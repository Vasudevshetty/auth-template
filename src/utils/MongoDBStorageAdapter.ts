import mongoose, { Schema, Document } from 'mongoose';
import { User, AuthProvider, AuthStorageAdapter } from '../types/auth.types';
import { logError } from './logger';

// Define the MongoDB User schema and interface
interface UserDocument extends Document, Omit<User, 'id'> {
  // MongoDB takes care of _id, we'll map it to id
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    name: { type: String },
    role: { type: String, default: 'user' },
    provider: { 
      type: String, 
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL 
    },
    providerId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { 
    timestamps: true, 
    // Auto-generate createdAt and updatedAt
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Create unique compound index on provider + providerId
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

/**
 * MongoDB implementation of the AuthStorageAdapter
 */
export class MongoDBStorageAdapter implements AuthStorageAdapter {
  private UserModel: mongoose.Model<UserDocument>;

  /**
   * Create a new MongoDB storage adapter
   * 
   * @param connectionString - MongoDB connection string
   */
  constructor(connectionString: string) {
    try {
      // Connect to MongoDB
      mongoose.connect(connectionString);
      
      // Create or get the User model
      this.UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
    } catch (error) {
      logError('Failed to connect to MongoDB', error);
      throw new Error('MongoDB connection failed');
    }
  }

  /**
   * Find a user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await this.UserModel.findById(id);
      return user ? user.toJSON() as User : null;
    } catch (error) {
      logError(`Error finding user by ID: ${id}`, error);
      return null;
    }
  }

  /**
   * Find a user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.UserModel.findOne({ email });
      return user ? user.toJSON() as User : null;
    } catch (error) {
      logError(`Error finding user by email: ${email}`, error);
      return null;
    }
  }

  /**
   * Find a user by provider and provider ID
   */
  async findUserByProviderId(provider: AuthProvider, providerId: string): Promise<User | null> {
    try {
      const user = await this.UserModel.findOne({ provider, providerId });
      return user ? user.toJSON() as User : null;
    } catch (error) {
      logError(`Error finding user by provider: ${provider}:${providerId}`, error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const newUser = new this.UserModel(userData);
      await newUser.save();
      return newUser.toJSON() as User;
    } catch (error) {
      logError('Error creating user', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        id, 
        userData,
        { new: true } // Return the updated document
      );
      return updatedUser ? updatedUser.toJSON() as User : null;
    } catch (error) {
      logError(`Error updating user: ${id}`, error);
      return null;
    }
  }

  /**
   * Find a user by reset password token
   */
  async findUserByResetToken(token: string): Promise<User | null> {
    try {
      const user = await this.UserModel.findOne({ 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
      });
      return user ? user.toJSON() as User : null;
    } catch (error) {
      logError(`Error finding user by reset token`, error);
      return null;
    }
  }
}