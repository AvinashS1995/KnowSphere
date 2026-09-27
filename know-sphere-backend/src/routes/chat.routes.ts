import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getConversations, getConversation, createConversation,
  sendMessage, deleteConversation
} from '../controllers/chat.controller';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: RAG-powered AI chat with source citations
 */

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations (without messages for performance)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 */
router.get('/', getConversations);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Create a new empty conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: New conversation created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 */
router.post('/', createConversation);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a message and get RAG-powered AI response with source citations
 *     description: |
 *       **Full RAG Pipeline:**
 *       1. Embeds the question using the configured AI provider
 *       2. Performs semantic search in Qdrant vector store
 *       3. Retrieves top-K relevant document chunks
 *       4. Builds context prompt with retrieved chunks
 *       5. Calls LLM (OpenAI / Gemini / OpenRouter) with context
 *       6. Returns answer + source citations with page references
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *           examples:
 *             newConversation:
 *               summary: Start a new conversation
 *               value:
 *                 question: What is the employee increment process?
 *             existingConversation:
 *               summary: Continue an existing conversation
 *               value:
 *                 question: What documents do I need for reimbursement?
 *                 conversationId: 64f1a2b3c4d5e6f7a8b9c0d3
 *             withCollection:
 *               summary: Search within a specific knowledge collection
 *               value:
 *                 question: What is the leave encashment policy?
 *                 collectionId: 64f1a2b3c4d5e6f7a8b9c0d4
 *     responses:
 *       200:
 *         description: AI answer with source citations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendMessageResponse'
 *             example:
 *               success: true
 *               conversationId: 64f1a2b3c4d5e6f7a8b9c0d3
 *               message:
 *                 id: 64f1a2b3c4d5e6f7a8b9c0d5
 *                 role: assistant
 *                 content: "Based on the HR policy documents, the employee increment process includes: 1. Performance review by manager..."
 *                 sources:
 *                   - documentId: 64f1a2b3c4d5e6f7a8b9c0d2
 *                     documentName: HR_Policy_2024.pdf
 *                     documentType: PDF
 *                     pageRange: "Page 5–6"
 *                     excerpt: "The employee increment process is carried out annually..."
 *                     relevanceScore: 94
 *       400:
 *         description: Question is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: AI or vector store error
 */
router.post('/message', sendMessage);

/**
 * @swagger
 * /api/chat/{id}:
 *   get:
 *     summary: Get a conversation with all messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Full conversation with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Conversation not found
 */
router.get('/:id', getConversation);

/**
 * @swagger
 * /api/chat/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete('/:id', deleteConversation);

export default router;
