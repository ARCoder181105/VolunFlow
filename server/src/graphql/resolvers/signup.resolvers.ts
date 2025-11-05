import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import { MyContext } from "../../types/context.types.js";
import { Prisma } from "@prisma/client";

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

        return newSignup;
      } catch (error) {
        // This catches database errors, like trying to sign up twice.
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // The 'P2002' code is for a unique constraint violation.
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

      // Security Check: User must be logged in.
      if (!user) {
        throw new GraphQLError("You must be logged in to cancel a signup.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const updatedSignup = await prisma.signup.update({
          where: {
            userId_eventId: {// using the compound key of the user and event
              userId: user.id,
              eventId: eventId,
            },
          },
          data: {
            status: "CANCELLED", // Set the status as defined in your schema
          },
          include: {
            event: true,
            user: true,
          },
        });

        return updatedSignup;
      } catch (error) {
        // This will catch errors if the signup doesn't exist
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            // 'Record to update not found'
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
  },
};