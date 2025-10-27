import { User } from '@prisma/client';

// This interface defines the shape of our GraphQL context object.
export interface MyContext {
  user?: Omit<User, 'password' | 'refreshToken'>;
}