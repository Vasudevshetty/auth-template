import { Request, Response, NextFunction } from "express";
import { AuthError } from "../errors/AuthError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = "Something went wrong";
  let errors: any = {};

  // Handle AuthError instances
  if (err instanceof AuthError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle validation errors from express-validator
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    // Handle specific validation error format if needed
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  // In development, log the error
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(Object.keys(errors).length > 0 && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
