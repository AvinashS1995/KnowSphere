import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUrl:
    process.env.MONGO_DB_LOCAL_URL || "mongodb://localhost:27017/ai_system",
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "us-east-1",
    bucketName: process.env.AWS_BUCKET_NAME || "",
    endpoint: process.env.AWS_ENDPOINT || "",
  },
  openai: { apiKey: process.env.OPENAI_API_KEY || "" },
  gemini: { apiKey: process.env.GEMINI_API_KEY || "" },
  openrouter: { apiKey: process.env.OPENROUTER_API_KEY || "" },
  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    apiKey: process.env.QDRANT_API_KEY || "",
    collection: process.env.QDRANT_COLLECTION || "knowledge-base",
  },
  redis: { url: process.env.REDIS_URL || "redis://localhost:6379" },
  ai: {
    provider: (process.env.AI_PROVIDER || "gemini") as
      | "openai"
      | "gemini"
      | "openrouter",
    model: process.env.AI_MODEL || "gemini-3.8-flash",
    temperature: parseFloat(process.env.AI_TEMPERATURE || "0.2"),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || "2000", 10),
  },
  processing: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || "1000", 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || "150", 10),
    topK: parseInt(process.env.TOP_K || "5", 10),
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200",
};
