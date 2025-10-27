import { GraphQLError } from 'graphql';
import prisma from '../../services/prisma.service.js';
import { MyContext } from '../../types/context.types.js';
import { Prisma } from '@prisma/client';

export const badgeResolvers = {
  Mutation: {
    createBadgeTemplate: async (_: any, { input }: any, context: MyContext) => {
      const { user } = context;

      // Security Check: User must be an NGO admin.
      if (!user || user.role !== 'NGO_ADMIN' || !user.adminOfNgoId) {
        throw new GraphQLError('Only NGO admins can create badge templates.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // The badge is automatically linked to the admin's NGO.
      return prisma.badge.create({
        data: {
          ...input,
          ngoId: user.adminOfNgoId,
        },
      });
    },
    awardBadge: async (_: any, { userId, badgeId }: { userId: string; badgeId: string }, context: MyContext) => {
      const { user } = context;
      console.log(user);

      // Security Check 1: User must be an NGO admin.
      if (!user || user.role !== 'NGO_ADMIN' || !user.adminOfNgoId) {
        throw new GraphQLError('Only NGO admins can award badges.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Security Check 2: Verify the badge belongs to the admin's NGO.
      const badgeTemplate = await prisma.badge.findUnique({ where: { id: badgeId } });
      if (!badgeTemplate || badgeTemplate.ngoId !== user.adminOfNgoId) {
        throw new GraphQLError("You can only award badges from your own NGO.", {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      try {
        return prisma.earnedBadge.create({
          data: {
            userId,
            badgeId,
          },
          include: { // Include related data for a rich response
            badge: true,
            user: true,
          },
        });
      } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new GraphQLError('This user has already earned this badge.', {
              extensions: { code: 'BAD_REQUEST' },
            });
          }
        throw new GraphQLError('Could not award badge.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};