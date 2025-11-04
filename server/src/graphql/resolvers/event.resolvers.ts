import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import {
  MyContext,
  UpdateEventInput,
  CreateEventInput,
} from "../../types/context.types.js";

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

const checkAdminOwnsEvent = async (
  user: MyContext["user"],
  eventId: string
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.ngoId !== user?.adminOfNgoId) {
    throw new GraphQLError("You can only modify events for your own NGO.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

export const eventResolvers = {
  Query: {
    // This is a public query, anyone can see an NGO's events.
    getNgoEvents: async (_: any, { ngoId }: { ngoId: string }) => {
      return prisma.event.findMany({
        where: { ngoId },
        orderBy: { date: "asc" },
      });
    },
    getAllEvents: async () => {
      // Fetch all events where the date is in the future
      return prisma.event.findMany({
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
      });
    },
    getEventAttendees: async (
      _: any,
      { eventId }: { eventId: string },
      context: MyContext
    ) => {
      const { user } = context;

      checkIsNgoAdmin(user);
      checkAdminOwnsEvent(user, eventId);

      // Fetch the signups for the event and include the user data for each signup.
      const signups = await prisma.signup.findMany({
        where: { eventId },
        include: {
          user: true, 
        },
      });

      return signups.map((signup) => signup.user);
    },
  },
  Mutation: {
    createEvent: async (_: any, { input }: { input: CreateEventInput }, context: MyContext) => {
      const { user } = context;

      if (!user) {
        throw new GraphQLError("You must be logged in to create an event.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
        throw new GraphQLError("Only NGO admins can create events.", {
          extensions: { code: "FORBIDDEN", user },
        });
      }

      const newEvent = await prisma.event.create({
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          date: new Date(input.date), 
          ngoId: user.adminOfNgoId,
        },
      });

      return newEvent;
    },

    updateEvent: async (
      _: any,
      { eventId, input }: { eventId: string; input: UpdateEventInput },
      context: MyContext
    ) => {
      const { user } = context;

      if (!user) {
        throw new GraphQLError("You must be logged in to update an event.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
        throw new GraphQLError("Only NGO admins can update events.", {
          extensions: { code: "FORBIDDEN", user },
        });
      }

      const existingEvent = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent || existingEvent.ngoId !== user.adminOfNgoId) {
        throw new GraphQLError("You can only update events for your own NGO.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const data: any = {};
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.location !== undefined) data.location = input.location;
      if (input.date !== undefined) data.date = new Date(input.date);

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data,
      });

      return updatedEvent;
    },
    deleteEvent: async (
      _: any,
      { eventId }: { eventId: string },
      context: MyContext
    ) => {
      const { user } = context;

      if (!user) {
        throw new GraphQLError("You must be logged in to delete an event.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role !== "NGO_ADMIN" || !user.adminOfNgoId) {
        throw new GraphQLError("Only NGO admins can delete events.", {
          extensions: { code: "FORBIDDEN", user },
        });
      }

      const existingEvent = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent || existingEvent.ngoId !== user.adminOfNgoId) {
        throw new GraphQLError("You can only delete events for your own NGO.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      await prisma.event.delete({
        where: { id: eventId },
      });

      return true;
    },
  },
};
