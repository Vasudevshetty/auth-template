import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import path from "path";
import { version } from "../../package.json";

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version,
      description: "API for authentication and user management",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            email: {
              type: "string",
            },
            name: {
              type: "string",
            },
            role: {
              type: "string",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/User",
            },
            tokens: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
                refreshToken: { type: "string" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
            },
            code: {
              type: "string",
            },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                    },
                    password: {
                      type: "string",
                      format: "password",
                    },
                    name: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/AuthResponse",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Login a user",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                    },
                    password: {
                      type: "string",
                      format: "password",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/AuthResponse",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/refresh-token": {
        post: {
          summary: "Refresh access token",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Token refreshed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/AuthResponse",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/logout": {
        post: {
          summary: "Logout a user",
          tags: ["Authentication"],
          responses: {
            200: {
              description: "Logout successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/me": {
        get: {
          summary: "Get current authenticated user",
          tags: ["Authentication"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            200: {
              description: "Current user data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/forgot-password": {
        post: {
          summary: "Request password reset email",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                "If email exists, a password reset link will be sent",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/reset-password": {
        post: {
          summary: "Reset password with token",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["token", "newPassword"],
                  properties: {
                    token: {
                      type: "string",
                    },
                    newPassword: {
                      type: "string",
                      format: "password",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Password reset successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid or expired token",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/github": {
        get: {
          summary: "GitHub OAuth login",
          tags: ["Authentication"],
          responses: {
            302: {
              description: "Redirects to GitHub for authentication",
            },
          },
        },
      },
      "/auth/github/callback": {
        get: {
          summary: "GitHub OAuth callback",
          tags: ["Authentication"],
          responses: {
            200: {
              description: "GitHub login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/google": {
        get: {
          summary: "Google OAuth login",
          tags: ["Authentication"],
          responses: {
            302: {
              description: "Redirects to Google for authentication",
            },
          },
        },
      },
      "/auth/google/callback": {
        get: {
          summary: "Google OAuth callback",
          tags: ["Authentication"],
          responses: {
            200: {
              description: "Google login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/facebook": {
        get: {
          summary: "Facebook OAuth login",
          tags: ["Authentication"],
          responses: {
            302: {
              description: "Redirects to Facebook for authentication",
            },
          },
        },
      },
      "/auth/facebook/callback": {
        get: {
          summary: "Facebook OAuth callback",
          tags: ["Authentication"],
          responses: {
            200: {
              description: "Facebook login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../**/*.ts")], // Use absolute paths
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Setup Swagger documentation
 * @param app Express application
 */
export function setupSwagger(app: Application): void {
  // Serve swagger docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve swagger spec as JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

/**
 * Add Swagger documentation for API routes
 */
export const authRouteDocs = {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  register: {},

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login a user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  login: {},

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  refreshToken: {},

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current authenticated user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *       401:
   *         description: Not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  me: {},

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Request password reset email
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *     responses:
   *       200:
   *         description: If email exists, a password reset link will be sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   */
  forgotPassword: {},

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Reset password with token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - newPassword
   *             properties:
   *               token:
   *                 type: string
   *               newPassword:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Password reset successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid or expired token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  resetPassword: {},
};
