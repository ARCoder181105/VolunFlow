import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import prisma from "./prisma.service.js";

// FIX: Provide a fallback string to ensure the type is 'string', not 'string | undefined'.
// This resolves the TS2769 overload error.
const ACCESS_TOKEN_SECRET: Secret =
  process.env.ACCESS_TOKEN_SECRET || "fallback_access_secret_please_change";
const REFRESH_TOKEN_SECRET: Secret =
  process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret_please_change";

// FIX: Ensure expiry is a string like "1d" or "7d", not a number of milliseconds.
const ACCESS_TOKEN_EXPIRY: SignOptions["expiresIn"] =
  (process.env.ACCESS_TOKEN_EXPIRY_STRING || "1d") as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRY: SignOptions["expiresIn"] =
  (process.env.REFRESH_TOKEN_EXPIRY_STRING || "7d") as SignOptions["expiresIn"];

/**
 * Hashes a given password using bcrypt.
 * @param password The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a hashed password.
 * @param password The plain text password.
 * @param hashedPassword The hashed password to compare against.
 * @returns A promise that resolves to true if passwords match, false otherwise.
 */
export const comparePassword = async (
  password: string,
  hashedPassword?: string | null
): Promise<boolean> => {
  if (!hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generates new access and refresh tokens for a user.
 * Hashes and stores the refresh token in the database.
 * @param user The user object to generate tokens for.
 * @returns A promise that resolves to an object containing the accessToken and refreshToken.
 */
export const generateAndStoreTokens = async (
  user: User
): Promise<{ accessToken: string; refreshToken: string }> => {
  // This will now pass type-checking
  const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  // This will also pass type-checking
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  // Hash the refresh token before storing it for security
  const hashedRefreshToken = await hashPassword(refreshToken);

  // Store the hashed refresh token in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return { accessToken, refreshToken };
};
