import express from 'express';
import { MongoDBStorageAdapter } from '../utils/MongoDBStorageAdapter';
import { AuthService } from '../services/AuthService';
import { EmailService } from '../services/EmailService';
import { AuthController } from '../controllers/AuthController';
import { setupSwagger } from '../utils/swagger';

/**
 * Example showing how to use MongoDB storage adapter for authentication
 */

// Create Express application
const app = express();
app.use(express.json());

// Configuration values (in a real app, these would come from environment variables)
const config = {
  mongoUri: 'mongodb://localhost:27017/auth-example',
  jwtSecret: 'your-jwt-secret',
  jwtExpiresIn: '1h',
  refreshSecret: 'your-refresh-secret',
  refreshExpiresIn: '7d',
  port: 3000,
  email: {
    from: 'noreply@example.com',
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'example-user',
      pass: 'example-password'
    }
  }
};

// Setup MongoDB storage adapter
const storageAdapter = new MongoDBStorageAdapter(config.mongoUri);

// Optional: Setup email service for password reset
const emailService = new EmailService(config.email);

// Create auth service with MongoDB storage
const authService = new AuthService(
  storageAdapter,
  config.jwtSecret,
  config.jwtExpiresIn,
  config.refreshSecret,
  config.refreshExpiresIn,
  emailService
);

// Create auth controller
const authController = new AuthController(authService);

// Setup routes
app.use('/api/auth', authController.getRouter());

// Setup Swagger documentation
setupSwagger(app);

// Start the server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`API Documentation available at http://localhost:${config.port}/api-docs`);
});