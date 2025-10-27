import { GraphQLError } from 'graphql';
import prisma from '../../services/prisma.service.js';
import { MyContext } from '../../types/context.types.js';

export const userResolvers = {
  Query: {
    // The 'me' query is great for a quick auth check.
    me: async (_: any, __: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return prisma.user.findUnique({ where: { id: context.user.id } });
    },

    // The 'myProfile' query fetches the user and all their related data.
    myProfile: async (_: any, __: any, context: MyContext) => {
      // Security Check: User must be logged in.
      if (!context.user) {
        throw new GraphQLError('You must be logged in to view your profile.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Fetch the user and INCLUDE their related signups and earned badges.
      // This is the power of Prisma's relational queries.
      const userProfile = await prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          signups: {
            // For each signup, also include the details of the event.
            include: {
              event: true,
            },
          },
          earnedBadges: {
            // For each earned badge, also include the details of the badge template.
            include: {
              badge: true,
            },
          },
        },
      });

      if (!userProfile) {
        throw new GraphQLError('User profile not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return userProfile;
    },
  },
  Mutation: {
    _empty: () => null,
  },
};