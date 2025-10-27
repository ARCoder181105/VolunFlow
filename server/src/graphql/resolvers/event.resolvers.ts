import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import { MyContext } from "../../types/context.types.js";

export const eventResolvers = {
  Query: {
    // This is a public query, anyone can see an NGO's events.
    getNgoEvents: async (_: any, { ngoId }: { ngoId: string }) => {
      return prisma.event.findMany({
        where: { ngoId },
        orderBy: { date: "asc" }, // Show upcoming events first
      });
    },
    getAllEvents: async () => {
      // Fetch all events where the date is in the future
      return prisma.event.findMany({
        where: {
          date: {
            gte: new Date(), // gte means "greater than or equal to" today
          },
        },
        orderBy: {
          date: "asc", 
        },
      });
    },
    getEventAttendees: async (_: any, { eventId }: { eventId: string }, context: MyContext) => {
      const { user } = context;

      // Security Check 1: Must be logged in as an NGO admin.
      if (!user || user.role !== 'NGO_ADMIN' || !user.adminOfNgoId) {
        throw new GraphQLError('You must be an NGO admin to view attendees.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Security Check 2: Verify the event belongs to the admin's NGO.
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event || event.ngoId !== user.adminOfNgoId) {
        throw new GraphQLError("You can only view attendees for your own NGO's events.", {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Fetch the signups for the event and include the user data for each signup.
      const signups = await prisma.signup.findMany({
        where: { eventId },
        include: {
          user: true, // This fetches the full user profile for each signup
        },
      });

      // Map the results to return a clean list of User objects.
      return signups.map(signup => signup.user);
    },
  },
  Mutation: {
    createEvent: async (_: any, { input }: any, context: MyContext) => {
      const { user } = context;

      // Security Check 1: Must be logged in.
      if (!user) {
        throw new GraphQLError("You must be logged in to create an event.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Security Check 2: Must be an NGO admin.
      if (user.role !== 'NGO_ADMIN' || !user.adminOfNgoId) {
        throw new GraphQLError("Only NGO admins can create events.", {
          extensions: { code: "FORBIDDEN",user },
        });
      }

      // The event is automatically linked to the admin's NGO from the token.
      const newEvent = await prisma.event.create({
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          date: new Date(input.date), // Convert ISO string to a Date object
          ngoId: user.adminOfNgoId,
        },
      });

      return newEvent;
    },
  },
};
