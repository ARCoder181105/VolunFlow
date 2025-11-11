import { GraphQLError } from "graphql";
import slugify from "slugify";
import prisma from "../../services/prisma.service.js";
import { MyContext, UpdateNgoInput } from "../../types/context.types.js";
import { NGO as NgoPrismaType, Prisma } from "@prisma/client";

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

export const ngoResolvers = {
  Query: {
    // This is a public query, so no auth check is needed.
    getNgoBySlug: async (_: any, { slug }: { slug: string }) => {
      return prisma.nGO.findUnique({ where: { slug } });
    },
    myNgo: async (_: any, __: any, context: MyContext) => {
      const { user } = context;
      checkIsNgoAdmin(user);

      return prisma.nGO.findUnique({
        where: { id: user!.adminOfNgoId! },
        include: {
          events: { orderBy: { date: "desc" } },
          branches: true,
          badges: true,
        },
      });
    },
    // Add to your Query resolvers in ngo.resolvers.ts
    getAllNgos: async () => {
      return prisma.nGO.findMany({
        include: {
          events: {
            orderBy: { date: "desc" },
            take: 5, // Limit events to prevent overfetching
          },
          badges: true,
          branches: true,
        },
      });
    },
  },
  Mutation: {
    createNgo: async (_: any, { input }: any, context: MyContext) => {
      // This is a protected mutation.
      if (!context.user) {
        throw new GraphQLError("You must be logged in to create an NGO.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { name, description, contactEmail, logoUrl } = input;
      const slug = (slugify as any)(name, { lower: true, strict: true });

      // Use a transaction to ensure both operations (create NGO, update user) succeed or fail together.
      const newNgo = await prisma.$transaction(async (tx) => {
        const ngo = await tx.nGO.create({
          data: {
            name,
            slug,
            description,
            contactEmail,
            logoUrl
          },
        });

        // Make the user who created it an admin.
        await tx.user.update({
          where: { id: context.user!.id },
          data: {
            role: "NGO_ADMIN",
            adminOfNgoId: ngo.id,
          },
        });

        return ngo;
      });

      return newNgo;
    },

    updateNgoProfile: async (
      _: any,
      { input }: { input: UpdateNgoInput },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user);

      const dataToUpdate: Prisma.NGOUpdateInput = { ...input };

      // If the name is being updated, we must also update the slug
      if (input.name) {
        dataToUpdate.slug = (slugify as any)(input.name, {
          lower: true,
          strict: true,
        });
      }

      return prisma.nGO.update({
        where: { id: user!.adminOfNgoId! },
        data: dataToUpdate,
      });
    },

    deleteNgo: async (_: any, __: any, context: MyContext) => {
      const { user } = context;
      checkIsNgoAdmin(user);

      const adminId = user!.id;
      const ngoId = user!.adminOfNgoId!;

      try {
        // Use a transaction to ensure both operations succeed or fail
        await prisma.$transaction(async (tx) => {
          // 1. Delete the NGO. Cascading deletes will handle events, badges, etc.
          await tx.nGO.delete({
            where: { id: ngoId },
          });

          // 2. Demote the user back to a VOLUNTEER and remove the NGO link
          await tx.user.update({
            where: { id: adminId },
            data: {
              role: "VOLUNTEER",
              adminOfNgoId: null,
            },
          });
        });

        return true;
      } catch (error) {
        console.error("Failed to delete NGO:", error);
        throw new GraphQLError("Could not delete NGO.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
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
