import { GraphQLError } from 'graphql';
import prisma from '../../services/prisma.service.js';
import { MyContext } from '../../types/context.types.js';
import { Prisma } from '@prisma/client';

export const signupResolvers = {
  Mutation: {
    signupForEvent: async (_: any, { eventId }: { eventId: string }, context: MyContext) => {
      // Security Check: User must be logged in.
      if (!context.user) {
        throw new GraphQLError('You must be logged in to sign up for an event.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        // Create the Signup record, linking the user (from context) and the event (from args).
        const newSignup = await prisma.signup.create({
          data: {
            userId: context.user.id,
            eventId: eventId,
          },
          // Include the related event and user data in the response.
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
          if (error.code === 'P2002') {
            throw new GraphQLError('You have already signed up for this event.', {
              extensions: { code: 'BAD_REQUEST' },
            });
          }
        }
        // For any other errors, throw a generic server error.
        throw new GraphQLError('Could not sign up for the event.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};