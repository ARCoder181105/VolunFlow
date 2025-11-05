import { User } from '@prisma/client';

// This interface defines the shape of our GraphQL context object.
export interface MyContext {
  user?: Omit<User, 'password' | 'refreshToken'>;
}

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  date: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
}

export interface UpdateNgoInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
}