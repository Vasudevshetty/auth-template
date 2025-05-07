import { User, AuthStorageAdapter, AuthProvider } from "../types/auth.types";
import { UserNotFoundError } from "../errors/AuthError";
import crypto from "crypto";

/**
 * In-memory implementation of the AuthStorageAdapter interface.
 * This is for demonstration purposes - in a real application, you would
 * implement this adapter with your database of choice (MongoDB, PostgreSQL, etc.)
 */
export class MemoryStorageAdapter implements AuthStorageAdapter {
  private users: Map<string, User> = new Map();

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  /**
   * Find user by OAuth provider and provider ID
   */
  async findUserByProviderId(
    provider: AuthProvider,
    providerId: string
  ): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.provider === provider && user.providerId === providerId) {
        return user;
      }
    }
    return null;
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    const user: User = {
      id,
      email: userData.email!,
      password: userData.password,
      name: userData.name,
      role: userData.role || "user",
      provider: userData.provider,
      providerId: userData.providerId,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new UserNotFoundError();
    }

    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }
}
