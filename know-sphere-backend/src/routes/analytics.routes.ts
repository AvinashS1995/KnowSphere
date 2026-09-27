import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { getSummary } from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Usage analytics and insights (Admin only)
 */

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get analytics summary – KPIs, trends, top queries (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AnalyticsSummary'
 *             example:
 *               success: true
 *               data:
 *                 totalQueries: 1254
 *                 uniqueUsers: 48
 *                 topDocuments: 12
 *                 avgResponseTime: "2.3s"
 *                 queryTrends:
 *                   - date: "Sep 1"
 *                     queries: 120
 *                   - date: "Sep 5"
 *                     queries: 145
 *                 topQueries:
 *                   - question: "Employee increment process"
 *                     count: 156
 *                     trend: up
 *                   - question: "Leave policy"
 *                     count: 134
 *                     trend: up
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/summary', getSummary);

export default router;
