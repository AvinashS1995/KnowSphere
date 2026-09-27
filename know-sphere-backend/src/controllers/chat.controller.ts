import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ConversationModel } from '../models/conversation.model';
import { ragQuery } from '../rag/rag.service';
import { SettingsModel } from '../models/settings.model';
import { config } from '../config/env';

/** Load active AI settings from DB (falls back to .env defaults) */
async function getActiveAIConfig(): Promise<{ provider: string; model: string; temperature: number; maxTokens: number }> {
  try {
    const settings = await SettingsModel.findOne({ workspaceId: 'default' }).lean();
    if (settings?.ai?.provider) {
      return {
        provider:    settings.ai.provider,
        model:       settings.ai.model,
        temperature: settings.ai.temperature ?? config.ai.temperature,
        maxTokens:   settings.ai.maxTokens   ?? config.ai.maxTokens
      };
    }
  } catch {}
  // Fallback to .env
  return { provider: config.ai.provider, model: config.ai.model, temperature: config.ai.temperature, maxTokens: config.ai.maxTokens };
}

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

    // SECURITY: ignore any provider/model/apiKey from client — use DB settings
    if (!question?.trim()) { res.status(400).json({ success: false, message: 'Question is required' }); return; }

    // Get AI config from database (admin-controlled), not from request body
    const aiConfig = await getActiveAIConfig();

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

    conv.messages.push({ role: 'user', content: question, createdAt: new Date() });

    // RAG query uses AI config from DB
    const { answer, sources } = await ragQuery(question, collectionId);

    conv.messages.push({ role: 'assistant', content: answer, sources, createdAt: new Date() });

    if (conv.messages.length <= 2) {
      conv.title = question.slice(0, 60);
    }

    await conv.save();

    const lastMsg = conv.messages[conv.messages.length - 1];
    res.json({
      success: true,
      conversationId: conv.id,
      aiProvider: aiConfig.provider,   // safe to return — not a secret
      aiModel:    aiConfig.model,      // safe to return — not a secret
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
