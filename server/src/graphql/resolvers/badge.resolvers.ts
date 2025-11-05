import { GraphQLError } from 'graphql';
import prisma from '../../services/prisma.service.js';
import { MyContext, UpdateBadgeInput, CreateBadgeInput } from '../../types/context.types.js';
import { Prisma, User } from '@prisma/client';

const checkIsNgoAdmin = (user: MyContext["user"]) => {
  if (!user) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  if (user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
    throw new GraphQLError("This action is restricted to NGO admins only.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};


const checkAdminOwnsBadge = async (user: MyContext["user"], badgeId: string) => {
  if (!user) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
  
  if (!badge) {
    throw new GraphQLError("Badge template not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  if (badge.ngoId !== user.adminOfNgoId) {
    throw new GraphQLError("You can only modify badges for your own NGO.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

export const badgeResolvers = {
  Mutation: {
    createBadgeTemplate: async (
      _: any,
      { input }: { input: CreateBadgeInput },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user); // Security check

      return prisma.badge.create({
        data: {
          ...input,
          criteria: String(input.criteria),
          ngoId: user!.adminOfNgoId!, // Link to the admin's NGO
        },
      });
    },

    awardBadge: async (
      _: any,
      { userId, badgeId }: { userId: string; badgeId: string },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user); // Must be an admin
      await checkAdminOwnsBadge(user!, badgeId); // Must own the badge

      try {
        return prisma.earnedBadge.create({
          data: { userId, badgeId },
          include: { badge: true, user: true }, // Return rich data
        });
      } catch (error) {
        // Handle case where user has already earned this badge
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

    updateBadgeTemplate: async (
      _: any,
      { badgeId, input }: { badgeId: string; input: UpdateBadgeInput },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user); // Must be an admin
      await checkAdminOwnsBadge(user!, badgeId); // Must own the badge

      // Update the badge with any fields provided in the input
      return prisma.badge.update({
        where: { id: badgeId },
        data: { ...input },
      });
    },


    deleteBadgeTemplate: async (
      _: any,
      { badgeId }: { badgeId: string },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user); // Must be an admin
      await checkAdminOwnsBadge(user!, badgeId); // Must own the badge

      // Delete the badge template.
      await prisma.badge.delete({
        where: { id: badgeId },
      });

      return true;
    },
  },
};