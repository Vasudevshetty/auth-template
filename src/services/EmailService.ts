import nodemailer from 'nodemailer';
import { AuthOptions } from '../types/auth.types';
import { logError, logInfo } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(emailOptions: AuthOptions['emailOptions']) {
    if (!emailOptions) {
      throw new Error('Email configuration is required for EmailService');
    }

    this.from = emailOptions.from;
    
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: emailOptions.host,
      port: emailOptions.port,
      secure: emailOptions.secure, // true for 465, false for other ports
      auth: {
        user: emailOptions.auth.user,
        pass: emailOptions.auth.pass,
      },
    });

    // Verify connection configuration
    this.transporter.verify()
      .then(() => logInfo('Email service is ready to take messages'))
      .catch((error) => logError('Email service configuration error', error));
  }

  /**
   * Send a password reset email
   * 
   * @param to - Recipient email address
   * @param resetLink - The reset password link
   */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please click on the following link, or paste it into your browser to complete the process:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Please click on the button below, or paste the link into your browser to complete the process:</p>
          <p>
            <a href="${resetLink}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
          </p>
          <p>Or copy and paste this link: <br><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logInfo(`Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      logError('Error sending password reset email', error);
      return false;
    }
  }

  /**
   * Send a password changed confirmation email
   * 
   * @param to - Recipient email address
   */
  async sendPasswordChangedEmail(to: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject: 'Password Changed Confirmation',
        text: `This is a confirmation that the password for your account has just been changed.\n`,
        html: `
          <h2>Password Changed</h2>
          <p>This is a confirmation that the password for your account has just been changed.</p>
          <p>If you did not change your password, please contact support immediately.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logInfo(`Password changed email sent to ${to}`);
      return true;
    } catch (error) {
      logError('Error sending password changed email', error);
      return false;
    }
  }
}