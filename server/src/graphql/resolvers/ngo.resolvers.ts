import { GraphQLError } from 'graphql';
import slugify from 'slugify'; 
import prisma from '../../services/prisma.service.js';
import { MyContext } from '../../types/context.types.js';
import {NGO as NgoPrismaType} from '@prisma/client'

export const ngoResolvers = {
  Query: {
    // This is a public query, so no auth check is needed.
    getNgoBySlug: async (_: any, { slug }: { slug: string }) => {
      return prisma.nGO.findUnique({ where: { slug } });
    },
    myNgo: async (_: any, __: any, context: MyContext) => {
      const { user } = context;

      // Security Check 1: Must be logged in.
      if (!user) {
        throw new GraphQLError('You must be logged in to view your NGO.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Security Check 2: Must be an admin and have an NGO ID.
      if (user.role !== 'NGO_ADMIN' || !user.adminOfNgoId) {
        throw new GraphQLError('You are not an admin of any NGO.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Fetch the NGO and *all* its related data in one call.
      return prisma.nGO.findUnique({
        where: { id: user.adminOfNgoId },
        include: {
          events: {
            orderBy: { date: 'desc' }, // Include all events
          },
          branches: true, // Include all branches
          badges: true,   // Include all badge templates
        },
      });
    },
  },
  Mutation: {
    createNgo: async (_: any, { input }: any, context: MyContext) => {
      // This is a protected mutation.
      if (!context.user) {
        throw new GraphQLError('You must be logged in to create an NGO.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { name, description, contactEmail } = input;
      const slug = (slugify as any)(name, { lower: true, strict: true });

      // Use a transaction to ensure both operations (create NGO, update user) succeed or fail together.
      const newNgo = await prisma.$transaction(async (tx) => {
        const ngo = await tx.nGO.create({
          data: {
            name,
            slug,
            description,
            contactEmail,
          },
        });

        // Make the user who created it an admin.
        await tx.user.update({
          where: { id: context.user!.id },
          data: {
            role: 'NGO_ADMIN',
            adminOfNgoId: ngo.id,
          },
        });

        return ngo;
      });

      return newNgo;
    },
  },
  NGO: {
    // The 'parent' argument is the NGO object returned by getNgoBySlug
    events: (parent: NgoPrismaType) => {
      return prisma.event.findMany({
        where: { ngoId: parent.id },
      });
    },
    branches: (parent: NgoPrismaType) => {
      return prisma.branch.findMany({
        where: { ngoId: parent.id },
      });
    },
    badges: (parent: NgoPrismaType) => {
      return prisma.badge.findMany({
        where: { ngoId: parent.id },
      });
    },
  },
};