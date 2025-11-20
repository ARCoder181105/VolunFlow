import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import { MyContext } from "../../types/context.types.js";

export const branchResolvers = {
  Mutation: {
    addBranch: async (
      _: any, 
      { input }: { input: { address: string; city: string; latitude: number; longitude: number } }, 
      context: MyContext
    ) => {
      const { user } = context;

      // 1. Check permissions
      if (!user) {
        throw new GraphQLError("You must be logged in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
        throw new GraphQLError("Only NGO admins can add branches.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      // 2. Create the branch linked to the admin's NGO
      return prisma.branch.create({
        data: {
          ...input,
          ngoId: user.adminOfNgoId,
        },
      });
    },

    deleteBranch: async (_: any, { branchId }: { branchId: string }, context: MyContext) => {
      const { user } = context;

      if (!user || user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
        throw new GraphQLError("Not authorized.", { extensions: { code: "FORBIDDEN" } });
      }

      // Ensure the branch belongs to the admin's NGO before deleting
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      
      if (!branch || branch.ngoId !== user.adminOfNgoId) {
        throw new GraphQLError("Branch not found or access denied.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      await prisma.branch.delete({ where: { id: branchId } });
      return true;
    },
  },
};