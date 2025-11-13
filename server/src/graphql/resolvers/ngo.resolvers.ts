import { GraphQLError } from "graphql";
import slugify from "slugify";
import prisma from "../../services/prisma.service.js";
import { MyContext, UpdateNgoInput } from "../../types/context.types.js";
import {
  NGO as NgoPrismaType,
  Prisma,
  Event,
  Branch,
  Badge,
} from "@prisma/client";

// This check is for mutations where an NGO *must* exist
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

// This helper type allows our NGO type resolvers to be "smart"
type NgoWithRelations = NgoPrismaType & {
  events?: Event[];
  branches?: Branch[];
  badges?: Badge[];
};

export const ngoResolvers = {
  Query: {
    // Public query, no auth check
    getNgoBySlug: async (_: any, { slug }: { slug: string }) => {
      return prisma.nGO.findUnique({ where: { slug } });
    },

    // This is the query for the admin dashboard
    myNgo: async (_: any, __: any, context: MyContext) => {
      const { user } = context;

      // 1. User must be logged in.
      if (!user) {
        throw new GraphQLError("You must be logged in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // 2. User must be an NGO_ADMIN.
      if (user.role !== "NGO_ADMIN") {
        // This shouldn't be hit if client logic is correct, but good for security
        throw new GraphQLError("You are not an NGO admin.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      // 3. If they are an admin but have no NGO ID, return null.
      //    This is NOT an error.
      if (!user.adminOfNgoId) {
        return null;
      }

      // 4. If they are an admin AND have an NGO ID, fetch it with all data.
      return prisma.nGO.findUnique({
        where: { id: user.adminOfNgoId },
        include: {
          events: {
            orderBy: { date: "desc" },
            include: {
              signups: {
                include: {
                  user: {
                    select: { id: true },
                  },
                },
              },
            },
          },
          branches: true,
          badges: true,
        },
      });
    },

    // Public query for browsing all NGOs
    getAllNgos: async () => {
      return prisma.nGO.findMany({
        include: {
          events: {
            orderBy: { date: "desc" },
            take: 5,
          },
          badges: true,
          branches: true,
        },
      });
    },
  },

  Mutation: {
    createNgo: async (_: any, { input }: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to create an NGO.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Prevent a user from creating a second NGO
      if (context.user.role === "NGO_ADMIN" && context.user.adminOfNgoId) {
        throw new GraphQLError("You are already an admin of an NGO.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const { name, description, contactEmail, logoUrl } = input;
      const slug = (slugify as any)(name, { lower: true, strict: true });

      // Check for existing name or slug
      const existingNgo = await prisma.nGO.findFirst({
        where: { OR: [{ name }, { slug }] },
      });
      if (existingNgo) {
        throw new GraphQLError("An NGO with this name or slug already exists.", {
          extensions: { code: "BAD_REQUEST" },
        });
      }
      
      const newNgo = await prisma.$transaction(async (tx) => {
        const ngo = await tx.nGO.create({
          data: {
            name,
            slug,
            description,
            contactEmail,
            logoUrl: logoUrl || undefined, // Use undefined if logoUrl is empty/null
          },
        });

        // Promote the user to NGO_ADMIN and link them to the new NGO
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
      checkIsNgoAdmin(user); // Correct: Must have an NGO to update it

      const dataToUpdate: Prisma.NGOUpdateInput = { ...input };

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
      checkIsNgoAdmin(user); // Correct: Must have an NGO to delete it

      const adminId = user!.id;
      const ngoId = user!.adminOfNgoId!;

      try {
        await prisma.$transaction(async (tx) => {
          await tx.nGO.delete({
            where: { id: ngoId },
          });
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

  // Type Resolvers: Fetch relations only if they weren't eager-loaded
  NGO: {
    events: (parent: NgoWithRelations) => {
      if (parent.events) return parent.events; // Return eager-loaded data
      return prisma.event.findMany({ where: { ngoId: parent.id } });
    },
    branches: (parent: NgoWithRelations) => {
      if (parent.branches) return parent.branches; // Return eager-loaded data
      return prisma.branch.findMany({ where: { ngoId: parent.id } });
    },
    badges: (parent: NgoWithRelations) => {
      if (parent.badges) return parent.badges; // Return eager-loaded data
      return prisma.badge.findMany({ where: { ngoId: parent.id } });
    },
  },
};