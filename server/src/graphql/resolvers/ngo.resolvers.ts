import { GraphQLError } from 'graphql';
import slugify from 'slugify'; 
import prisma from '../../services/prisma.service.js';
import { MyContext } from '../../types/context.types.js';

export const ngoResolvers = {
  Query: {
    // This is a public query, so no auth check is needed.
    getNgoBySlug: async (_: any, { slug }: { slug: string }) => {
      return prisma.nGO.findUnique({ where: { slug } });
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
};