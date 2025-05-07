/**
 * Base class for all authentication related errors
 */
export class AuthError extends Error {
  statusCode: number;
  code?: string;
  isOperational: boolean;

  constructor(message: string, statusCodeOrCode: number | string) {
    super(message);
    
    if (typeof statusCodeOrCode === 'number') {
      this.statusCode = statusCodeOrCode;
    } else {
      this.statusCode = 400; // Default status code
      this.code = statusCodeOrCode;
    }
    
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message: string = "Invalid email or password") {
    super(message, 401);
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "Forbidden access") {
    super(message, 403);
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = "User not found") {
    super(message, 404);
  }
}

export class UserExistsError extends AuthError {
  constructor(message: string = "User already exists") {
    super(message, 409);
  }
}

export class ValidationError extends AuthError {
  constructor(message: string = "Validation error") {
    super(message, 400);
  }
}

export class TokenError extends AuthError {
  constructor(message: string = "Invalid or expired token") {
    super(message, 401);
  }
}

export class OAuthError extends AuthError {
  constructor(message: string = "OAuth authentication failed") {
    super(message, 401);
  }
}
