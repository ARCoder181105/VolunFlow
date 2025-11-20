import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import { MyContext } from "../../types/context.types.js";
import { Prisma } from "@prisma/client";
import { triggerEventSignup } from "../../services/webhook.service.js";

export const signupResolvers = {
  Mutation: {
    signupForEvent: async (
      _: any,
      { eventId }: { eventId: string },
      context: MyContext
    ) => {
      // Security Check: User must be logged in.
      if (!context.user) {
        throw new GraphQLError(
          "You must be logged in to sign up for an event.",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      try {
        const newSignup = await prisma.signup.create({
          data: {
            userId: context.user.id,
            eventId: eventId,
          },
          include: {
            event: true,
            user: true,
          },
        });
        
        triggerEventSignup(newSignup.user, newSignup.event);

        return newSignup;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new GraphQLError(
              "You have already signed up for this event.",
              {
                extensions: { code: "BAD_REQUEST" },
              }
            );
          }
        }

        throw new GraphQLError("Could not sign up for the event.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    cancelSignupForEvent: async (
      _: any,
      { eventId }: { eventId: string },
      context: MyContext
    ) => {
      const { user } = context;

      if (!user) {
        throw new GraphQLError("You must be logged in to cancel a signup.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const updatedSignup = await prisma.signup.update({
          where: {
            userId_eventId: {
              userId: user.id,
              eventId: eventId,
            },
          },
          data: {
            status: "CANCELLED",
          },
          include: {
            event: true,
            user: true,
          },
        });

        return updatedSignup;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new GraphQLError(
              "Signup not found or you're not registered for this event.",
              {
                extensions: { code: "NOT_FOUND" },
              }
            );
          }
        }

        throw new GraphQLError("Could not cancel signup.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    
    // --- NEW RESOLVER ---
    markAttendance: async (
      _: any,
      { signupId, attended }: { signupId: string; attended: boolean },
      context: MyContext
    ) => {
      const { user } = context;

      // 1. Auth Check
      if (!user) {
        throw new GraphQLError("You must be logged in.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
        throw new GraphQLError("Only NGO admins can mark attendance.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      // 2. Fetch the signup to verify ownership
      const signup = await prisma.signup.findUnique({
        where: { id: signupId },
        include: { event: true },
      });

      if (!signup) {
        throw new GraphQLError("Signup not found.", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // 3. Verify the event belongs to the admin's NGO
      if (signup.event.ngoId !== user.adminOfNgoId) {
        throw new GraphQLError("You can only mark attendance for your own events.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      // 4. Update status
      const updatedSignup = await prisma.signup.update({
        where: { id: signupId },
        data: {
          status: attended ? "ATTENDED" : "CONFIRMED",
        },
        include: { event: true, user: true },
      });

      return updatedSignup;
    },
  },
};