import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KnowSphere – Enterprise Knowledge Copilot API',
    version: '1.0.0',
    description: `
API documentation for **KnowSphere** — an Enterprise RAG-powered Knowledge Copilot.

### Authentication
All protected endpoints require a **Bearer JWT** token.

Obtain a token via \`POST /api/auth/login\` and pass it in the header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### AI Providers
Configurable via \`.env\`: \`openai\` | \`gemini\` | \`openrouter\`
    `,
    contact: {
      name: 'KnowSphere Team',
      email: 'support@knowsphere.app'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server'
    },
    {
      url: 'https://api.knowsphere.app',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from /api/auth/login'
      }
    },
    schemas: {
      // ── Auth ──────────────────────────────────────
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@company.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Avinash Suryawanshi' },
          email: { type: 'string', format: 'email', example: 'avinash@company.com' },
          password: { type: 'string', minLength: 6, example: 'Welcome@123' },
          role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
          department: { type: 'string', example: 'Engineering' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      // ── User ──────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          name: { type: 'string', example: 'Avinash Suryawanshi' },
          email: { type: 'string', example: 'avinash@company.com' },
          role: { type: 'string', enum: ['admin', 'user'], example: 'admin' },
          status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
          department: { type: 'string', example: 'Engineering' },
          lastLogin: { type: 'string', format: 'date-time' }
        }
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Rahul Sharma' },
          email: { type: 'string', format: 'email', example: 'rahul@company.com' },
          role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
          department: { type: 'string', example: 'HR' }
        }
      },
      // ── Document ──────────────────────────────────
      Document: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
          name: { type: 'string', example: 'HR_Policy_2024.pdf' },
          type: { type: 'string', enum: ['PDF', 'DOCX', 'XLSX', 'TXT', 'CSV', 'PPTX'] },
          size: { type: 'number', example: 2516582 },
          department: { type: 'string', example: 'HR' },
          status: { type: 'string', enum: ['queued', 'uploading', 'processing', 'embedding', 'completed', 'failed'] },
          s3Url: { type: 'string', example: 'https://s3.filebase.com/ems-file-store/documents/...' },
          pageCount: { type: 'number', example: 20 },
          chunkCount: { type: 'number', example: 48 },
          isFavorite: { type: 'boolean', example: false },
          isArchived: { type: 'boolean', example: false },
          uploadedBy: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      // ── Chat ──────────────────────────────────────
      Source: {
        type: 'object',
        properties: {
          documentId: { type: 'string' },
          documentName: { type: 'string', example: 'HR_Policy_2024.pdf' },
          documentType: { type: 'string', example: 'PDF' },
          pageRange: { type: 'string', example: 'Page 5–6' },
          excerpt: { type: 'string', example: 'The employee increment process is carried out annually...' },
          relevanceScore: { type: 'number', example: 94 }
        }
      },
      ChatMessage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          role: { type: 'string', enum: ['user', 'assistant'] },
          content: { type: 'string', example: 'What is the employee increment process?' },
          sources: { type: 'array', items: { $ref: '#/components/schemas/Source' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'Employee Increment Process' },
          userId: { type: 'string' },
          messages: { type: 'array', items: { $ref: '#/components/schemas/ChatMessage' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      SendMessageRequest: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', example: 'What is the employee increment process?' },
          conversationId: { type: 'string', description: 'Omit to start a new conversation' },
          collectionId: { type: 'string', description: 'Filter search to a specific knowledge collection' }
        }
      },
      SendMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          conversationId: { type: 'string' },
          message: { $ref: '#/components/schemas/ChatMessage' }
        }
      },
      // ── Analytics ─────────────────────────────────
      AnalyticsSummary: {
        type: 'object',
        properties: {
          totalQueries: { type: 'number', example: 1254 },
          uniqueUsers: { type: 'number', example: 48 },
          topDocuments: { type: 'number', example: 12 },
          avgResponseTime: { type: 'string', example: '2.3s' },
          queryTrends: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, queries: { type: 'number' } } } },
          topQueries: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, count: { type: 'number' }, trend: { type: 'string', enum: ['up', 'down', 'stable'] } } } }
        }
      },
      // ── Common ─────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'KnowSphere API Docs',
      customCss: `
        .swagger-ui .topbar { background-color: #3730a3; }
        .swagger-ui .topbar .topbar-wrapper .link span { color: white; }
        .swagger-ui .info .title { color: #3730a3; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true
      }
    })
  );

  // Also expose raw JSON spec
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger docs: http://localhost:${config.port}/api-docs`);
};

export default setupSwagger;
