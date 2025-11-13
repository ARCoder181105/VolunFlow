import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import {
  MyContext,
  CreateEventInput,
  UpdateEventInput,
} from "../../types/context.types.js";
// Import the Prisma 'Event' type
import { Prisma, User, Event as PrismaEvent, NGO as NgoPrismaType } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

// --- AI Setup ---
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

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

// --- Helper type for "smart" resolvers ---
type EventWithRelations = PrismaEvent & {
  ngo?: NgoPrismaType;
  signups?: any[];
};


// --- Resolver Map ---
export const eventResolvers = {
  Query: {
    getNgoEvents: async (_: any, { ngoId }: { ngoId: string }) => {
      return prisma.event.findMany({
        where: { ngoId },
        orderBy: { date: "asc" },
        include: {
          ngo: true, 
        },
      });
    },
    
    // *** THIS IS THE FIX ***
    getAllEvents: async () => {
      return prisma.event.findMany({
        // REMOVED the 'where' clause that filtered for future dates
        orderBy: {
          date: "asc",
        },
        include: {
          ngo: true, // Eager-load the NGO data the client query requires
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
      await checkAdminOwnsEvent(user!, eventId);

      const signups = await prisma.signup.findMany({
        where: { eventId },
        include: { user: true },
      });

      return signups.map((signup) => signup.user);
    },

    getEventDetails: async (_: any, { eventId }: { eventId: string }) => {
      return prisma.event.findUnique({
        where: { id: eventId },
        include: {
          ngo: true, 
          signups: { 
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    },
  },

  Mutation: {
    // ... (All mutations remain unchanged) ...
    createEvent: async (
      _: any,
      { input }: { input: CreateEventInput },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user);

      const { date, ...rest } = input;

      return prisma.event.create({
        data: {
          ...rest,
          date: new Date(date),
          ngoId: user!.adminOfNgoId!,
        },
      });
    },

    updateEvent: async (
      _: any,
      { eventId, input }: { eventId: string; input: UpdateEventInput },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user);
      await checkAdminOwnsEvent(user!, eventId);

      const { date, ...rest } = input;
      const dataToUpdate: Prisma.EventUpdateInput = {
        ...rest,
        ...(date && { date: new Date(date) }),
      };

      return prisma.event.update({
        where: { id: eventId },
        data: dataToUpdate,
      });
    },

    deleteEvent: async (
      _: any,
      { eventId }: { eventId: string },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user);
      await checkAdminOwnsEvent(user!, eventId);

      await prisma.event.delete({
        where: { id: eventId },
      });

      return true;
    },

    generateEventTags: async (
      _: any,
      { description }: { description: string },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user);

      const prompt = `
        Based on the following event description, generate a list of 3-5 relevant keyword tags.
        Return *only* a valid JSON array of strings. Do not include any other text or markdown.
        Example: ["Community", "Environment", "Volunteering"]
        Description: "${description}"
      `;

      try {
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: prompt,
        });
        const text = result?.text ?? "";

        if (!text.trim()) {
          console.error("AI Tag Generation Failed: empty response", result);
          throw new GraphQLError("Failed to generate tags.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        const jsonText = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const tags: string[] = JSON.parse(jsonText);
        return tags;
      } catch (error) {
        console.error("AI Tag Generation Failed:", error);
        throw new GraphQLError("Failed to generate tags.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  // "Smart" Type Resolvers - check if data was eager-loaded
  Event: {
    ngo: (parent: EventWithRelations) => {
      // 1. If 'ngo' was eager-loaded, return it.
      if (parent.ngo) {
        return parent.ngo;
      }
      // 2. Otherwise, fetch it.
      return prisma.nGO.findUnique({
        where: { id: parent.ngoId },
      });
    },
    
    signups: (parent: EventWithRelations) => {
      // 1. If 'signups' was eager-loaded, return it.
      if (parent.signups) {
        return (parent as any).signups;
      }
      // 2. Otherwise, fetch it.
      return prisma.signup.findMany({
        where: { eventId: parent.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    },
  },
};