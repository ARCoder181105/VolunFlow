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

type NgoWithRelations = NgoPrismaType & {
  events?: Event[];
  branches?: Branch[];
  badges?: Badge[];
};

export const ngoResolvers = {
  Query: {
    getNgoBySlug: async (_: any, { slug }: { slug: string }) => {
      return prisma.nGO.findUnique({ where: { slug } });
    },

    myNgo: async (_: any, __: any, context: MyContext) => {
      const { user } = context;

      if (!user) {
        throw new GraphQLError("You must be logged in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role !== "NGO_ADMIN") {
        throw new GraphQLError("You are not an NGO admin.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      if (!user.adminOfNgoId) {
        return null;
      }

      return prisma.nGO.findUnique({
        where: { id: user.adminOfNgoId },
        include: {
          events: {
            orderBy: { date: "desc" },
            include: {
              signups: {
                include: {
                  user: {
                    // *** UPDATE: Select fields needed for "Manage Volunteers" list
                    select: { 
                      id: true,
                      name: true,
                      email: true,
                      avatarUrl: true 
                    },
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

      if (context.user.role === "NGO_ADMIN" && context.user.adminOfNgoId) {
        throw new GraphQLError("You are already an admin of an NGO.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const { name, description, contactEmail, logoUrl } = input;
      const slug = (slugify as any)(name, { lower: true, strict: true });

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
            logoUrl: logoUrl || undefined,
          },
        });

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

  NGO: {
    events: (parent: NgoWithRelations) => {
      if (parent.events) return parent.events;
      return prisma.event.findMany({ where: { ngoId: parent.id } });
    },
    branches: (parent: NgoWithRelations) => {
      if (parent.branches) return parent.branches;
      return prisma.branch.findMany({ where: { ngoId: parent.id } });
    },
    badges: (parent: NgoWithRelations) => {
      if (parent.badges) return parent.badges;
      return prisma.badge.findMany({ where: { ngoId: parent.id } });
    },
  },
};