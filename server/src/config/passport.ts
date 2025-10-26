// --- Passport OAuth Strategies Configuration ---
// This file handles Google/Facebook authentication only.
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import prisma from '../services/prisma.service.js';
import { AuthProvider } from '@prisma/client';

// --- Helper: Find or Create User ---
const findOrCreateUser = async (
  profile: GoogleProfile | FacebookProfile,
  provider: AuthProvider
) => {
  const email = profile.emails?.[0].value;
  if (!email) {
    throw new Error(`Email not provided by ${provider}.`);
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.authProvider !== provider) {
      user = await prisma.user.update({
        where: { email },
        data: {
          authProvider: provider,
          avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
        },
      });
    }
    return user; 
  }

  return await prisma.user.create({
    data: {
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
      authProvider: provider,
    },
  });
};

// --- Google OAuth Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'GOOGLE');
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// --- Facebook OAuth Strategy ---
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: `${process.env.SERVER_URL}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, 'FACEBOOK');
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
