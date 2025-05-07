# Authentication Template

A comprehensive authentication service template built with TypeScript, Express, and JWT.

## Features

- 🔑 **JWT Authentication**: Secure authentication with access tokens and refresh tokens
- 🔐 **Password Reset**: Email-based password reset functionality
- 🔄 **OAuth Integration**: Social login with GitHub, Google, and Facebook
- 📊 **Swagger Documentation**: Auto-generated API documentation
- 🧩 **MongoDB Integration**: MongoDB support for data persistence
- 📝 **Advanced Logging**: Structured logging with Winston
- 🛡️ **Security Features**:
  - Helmet for securing HTTP headers
  - XSS protection
  - Rate limiting for API endpoints
  - Secure HTTP headers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (if using MongoDB storage)

### Installation

1. Clone this repository

   ```bash
   git clone https://github.com/your-username/auth-template.git
   cd auth-template
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`

   ```bash
   cp .env.example .env
   ```

4. Modify the `.env` file with your configurations

5. Start the development server

   ```bash
   npm run dev
   ```

## Configuration

All configuration options are managed through environment variables. See `.env.example` for all available options.

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT expiration time (e.g. "1h", "1d")
- `REFRESH_SECRET`: Secret key for refresh tokens
- `REFRESH_EXPIRES_IN`: Refresh token expiration time

### MongoDB Configuration

- `MONGO_URI`: MongoDB connection string

### Email Configuration (for Password Reset)

- `EMAIL_FROM`: Sender email address
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_SECURE`: Use secure connection (true/false)
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password

### OAuth Configuration

#### GitHub

- `ENABLE_GITHUB`: Enable GitHub authentication (true/false)
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `GITHUB_CALLBACK_URL`: GitHub OAuth callback URL

#### Google

- `ENABLE_GOOGLE`: Enable Google authentication (true/false)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL

#### Facebook

- `ENABLE_FACEBOOK`: Enable Facebook authentication (true/false)
- `FACEBOOK_CLIENT_ID`: Facebook OAuth client ID
- `FACEBOOK_CLIENT_SECRET`: Facebook OAuth client secret
- `FACEBOOK_CALLBACK_URL`: Facebook OAuth callback URL

## API Documentation

Swagger documentation is available at `/api-docs` endpoint when the server is running.

### Available Endpoints

#### Authentication

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login with email and password
- `POST /api/v1/auth/refresh-token`: Refresh access token
- `GET /api/v1/auth/me`: Get current authenticated user

#### Password Reset

- `POST /api/v1/auth/forgot-password`: Request password reset email
- `POST /api/v1/auth/reset-password`: Reset password with token

#### OAuth

- `GET /api/v1/auth/github`: Authenticate with GitHub
- `GET /api/v1/auth/google`: Authenticate with Google
- `GET /api/v1/auth/facebook`: Authenticate with Facebook

## Storage Adapters

The template includes two storage adapters:

1. `MemoryStorageAdapter`: In-memory storage (for development/testing)
2. `MongoDBStorageAdapter`: MongoDB-based storage (for production)

## Security Features

### XSS Protection

The template uses `xss-clean` to sanitize user input and prevent Cross-Site Scripting (XSS) attacks.

### Rate Limiting

API rate limiting is configured to prevent brute force and DoS attacks.

### Secure HTTP Headers

Helmet is used to set secure HTTP headers, including:
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security

## Logging

Winston is used for logging with the following features:
- JSON-formatted logs for production
- Colorized console output for development
- Separate error logs
- Log rotation

## License

This project is licensed under the MIT License.
