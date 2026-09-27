import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { getSettings, saveSettings } from '../controllers/settings.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Workspace settings management (Admin only)
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get workspace settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current workspace settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 settings:
 *                   type: object
 */
router.get('/', authenticate, getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Save workspace settings (Admin only) – also applies AI provider change at runtime
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             ai:
 *               provider: gemini
 *               model: gemini-1.5-pro
 *               temperature: 0.3
 *               maxTokens: 2000
 *             documentProcessing:
 *               chunkSize: 800
 *               chunkOverlap: 100
 *               topK: 5
 *     responses:
 *       200:
 *         description: Settings saved and applied
 */
router.put('/', authenticate, requireAdmin, saveSettings);

export default router;
