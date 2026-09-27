import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SettingsModel } from '../models/settings.model';
import { resetAIProvider } from '../ai/ai-provider.factory';
import { config } from '../config/env';
import { validateModel, VALID_PROVIDERS } from '../config/allowed-models';

const DEFAULT_SETTINGS = {
  workspaceId: 'default',
  appName: 'KnowSphere',
  timezone: 'Asia/Kolkata',
  language: 'en',
  ai: {
    provider: config.ai.provider,
    model: config.ai.model,
    temperature: config.ai.temperature,
    maxTokens: config.ai.maxTokens
    // NO apiKey — lives only in .env
  },
  vectorDB: {
    provider: 'qdrant',
    url: config.qdrant.url,
    collection: config.qdrant.collection
    // NO apiKey — lives only in .env as QDRANT_API_KEY
  },
  documentProcessing: {
    chunkSize: config.processing.chunkSize,
    chunkOverlap: config.processing.chunkOverlap,
    topK: config.processing.topK,
    minRelevanceScore: 0.7
  },
  security: { sessionTimeout: 30, mfaEnabled: false, allowedDomains: ['company.com'] },
  notifications: { emailNotifications: true, processingComplete: true, queryAlerts: false, weeklyReport: true }
};

export const getSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await SettingsModel.findOne({ workspaceId: 'default' });
    if (!settings) settings = await SettingsModel.create(DEFAULT_SETTINGS);

    // Return settings WITHOUT any api key fields
    const safe = settings.toObject() as any;
    delete safe.ai?.apiKey;
    delete safe.vectorDB?.apiKey;

    res.json({ success: true, settings: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const saveSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;

    // ── SECURITY: strip ANY api key the client might send ──────────────────
    if (body.ai) {
      delete body.ai.apiKey;
      delete body.ai.api_key;
      delete body.ai.key;
    }
    if (body.vectorDB) {
      delete body.vectorDB.apiKey;
      delete body.vectorDB.api_key;
    }

    // ── Validate provider ─────────────────────────────────────────────────
    if (body.ai?.provider && !VALID_PROVIDERS.includes(body.ai.provider)) {
      res.status(400).json({ success: false, message: `Invalid AI provider: ${body.ai.provider}` });
      return;
    }

    // ── Validate model for the selected provider ──────────────────────────
    if (body.ai?.provider && body.ai?.model) {
      const check = validateModel(body.ai.provider, body.ai.model);
      if (!check.valid) {
        res.status(400).json({ success: false, message: check.message });
        return;
      }
    }

    // ── Validate temperature range ────────────────────────────────────────
    if (body.ai?.temperature !== undefined) {
      const t = parseFloat(body.ai.temperature);
      if (isNaN(t) || t < 0 || t > 1) {
        res.status(400).json({ success: false, message: 'temperature must be between 0 and 1' });
        return;
      }
    }

    // ── Validate maxTokens ────────────────────────────────────────────────
    if (body.ai?.maxTokens !== undefined) {
      const mt = parseInt(body.ai.maxTokens, 10);
      if (isNaN(mt) || mt < 256 || mt > 100000) {
        res.status(400).json({ success: false, message: 'maxTokens must be between 256 and 100000' });
        return;
      }
    }

    // ── Persist ───────────────────────────────────────────────────────────
    const settings = await SettingsModel.findOneAndUpdate(
      { workspaceId: 'default' },
      { $set: body },
      { new: true, upsert: true }
    );

    // ── Apply AI provider change at runtime (affects next chat request) ───
    if (body.ai?.provider) {
      (config.ai as any).provider    = body.ai.provider;
      (config.ai as any).model       = body.ai.model       ?? config.ai.model;
      (config.ai as any).temperature = body.ai.temperature ?? config.ai.temperature;
      (config.ai as any).maxTokens   = body.ai.maxTokens   ?? config.ai.maxTokens;
      resetAIProvider();
      // Safe log — no secrets
      console.log(`⚙️  AI config updated: ${body.ai.provider} / ${body.ai.model}`);
    }

    // Return clean settings (no apiKey)
    const safe = settings!.toObject() as any;
    delete safe.ai?.apiKey;
    delete safe.vectorDB?.apiKey;

    res.json({ success: true, settings: safe, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
