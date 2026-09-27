import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ConversationModel } from '../models/conversation.model';
import { ragQuery } from '../rag/rag.service';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await ConversationModel.find({ userId: req.user!.id })
      .select('-messages')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conv = await ConversationModel.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!conv) { res.status(404).json({ success: false, message: 'Conversation not found' }); return; }
    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conv = await ConversationModel.create({ userId: req.user!.id, title: 'New Conversation', messages: [] });
    res.status(201).json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, conversationId, collectionId } = req.body;
    if (!question?.trim()) { res.status(400).json({ success: false, message: 'Question is required' }); return; }

    // Get or create conversation
    let conv = conversationId
      ? await ConversationModel.findOne({ _id: conversationId, userId: req.user!.id })
      : null;

    if (!conv) {
      conv = await ConversationModel.create({
        userId: req.user!.id,
        title: question.slice(0, 50),
        messages: []
      });
    }

    // Add user message
    conv.messages.push({ role: 'user', content: question, createdAt: new Date() });

    // RAG query
    const { answer, sources } = await ragQuery(question, collectionId);

    // Add assistant response
    conv.messages.push({ role: 'assistant', content: answer, sources, createdAt: new Date() });

    // Update title if first message
    if (conv.messages.length <= 2) {
      conv.title = question.slice(0, 60);
    }

    await conv.save();

    const lastMsg = conv.messages[conv.messages.length - 1];
    res.json({
      success: true,
      conversationId: conv.id,
      message: {
        id: (lastMsg as any)._id,
        role: lastMsg.role,
        content: lastMsg.content,
        sources: lastMsg.sources,
        timestamp: lastMsg.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ConversationModel.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
