import { AuthService } from '../services/AuthService';
import { EmailService } from '../services/EmailService';
import { MongoDBStorageAdapter } from '../utils/MongoDBStorageAdapter';

/**
 * Example showing how to use password reset functionality
 */
async function passwordResetExample() {
  // Configuration values (in a real app, these would come from environment variables)
  const config = {
    mongoUri: 'mongodb://localhost:27017/auth-example',
    jwtSecret: 'your-jwt-secret',
    jwtExpiresIn: '1h',
    refreshSecret: 'your-refresh-secret',
    refreshExpiresIn: '7d',
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

  try {
    // Setup MongoDB storage adapter
    const storageAdapter = new MongoDBStorageAdapter(config.mongoUri);

    // Setup email service for password reset
    const emailService = new EmailService(config.email);

    // Create auth service with MongoDB storage and email service
    const authService = new AuthService(
      storageAdapter,
      config.jwtSecret,
      config.jwtExpiresIn,
      config.refreshSecret,
      config.refreshExpiresIn,
      emailService
    );

    // Example 1: Request password reset
    const userEmail = 'user@example.com';
    const resetUrl = 'https://yourapp.com/reset-password';
    
    console.log(`Requesting password reset for ${userEmail}...`);
    await authService.requestPasswordReset(userEmail, resetUrl);
    console.log('Password reset email sent (or would be sent in a real environment)');

    // Example 2: Reset password with token
    // Note: In a real application, the token would come from the email link
    const token = 'example-token-from-email-link';
    const newPassword = 'newSecurePassword123';
    
    console.log('Resetting password with token...');
    try {
      await authService.resetPassword(token, newPassword);
      console.log('Password reset successful');
    } catch (error: any) {
      console.error('Password reset failed:', error.message);
    }

  } catch (error) {
    console.error('Error in password reset example:', error);
  }
}

// Run the example
passwordResetExample()
  .then(() => console.log('Example completed'))
  .catch(err => console.error('Example failed:', err));