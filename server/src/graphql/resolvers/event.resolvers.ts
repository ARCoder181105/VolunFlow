import { GraphQLError } from "graphql";
import prisma from "../../services/prisma.service.js";
import { MyContext, CreateEventInput, UpdateEventInput } from "../../types/context.types.js";
import { Prisma, User } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

// --- AI Setup ---
// Initialize the AI client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({apiKey})

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

const checkAdminOwnsEvent = async (user: MyContext["user"], eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.ngoId !== user?.adminOfNgoId) {
    throw new GraphQLError("You can only modify events for your own NGO.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};

// --- Resolver Map ---
export const eventResolvers = {
  Query: {
    /**
     * Fetches all events for a specific NGO.
     * Publicly accessible.
     */
    getNgoEvents: async (_: any, { ngoId }: { ngoId: string }) => {
      return prisma.event.findMany({
        where: { ngoId },
        orderBy: { date: "asc" },
      });
    },

    /**
     * Fetches all upcoming events from all NGOs.
     * Publicly accessible.
     */
    getAllEvents: async () => {
      return prisma.event.findMany({
        where: {
          date: {
            gte: new Date(), // Only show events from today onwards
          },
        },
        orderBy: {
          date: "asc",
        },
      });
    },

    /**
     * Fetches all volunteers who signed up for a specific event.
     * Restricted to the admin of that event's NGO.
     */
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

      // Return the list of User objects
      return signups.map((signup) => signup.user);
    },
  },

  Mutation: {
    /**
     * Creates a new event for the logged-in admin's NGO.
     */
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
          ...rest, // Includes title, description, location, tags, etc.
          date: new Date(date), // Convert ISO string to a Date object
          ngoId: user!.adminOfNgoId!,
        },
      });
    },

    /**
     * Updates an existing event.
     * Restricted to the admin of that event's NGO.
     */
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
        ...(date && { date: new Date(date) }), // Conditionally add date if it exists
      };

      return prisma.event.update({
        where: { id: eventId },
        data: dataToUpdate,
      });
    },

    /**
     * Deletes an event.
     * Restricted to the admin of that event's NGO.
     */
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

    /**
     * Generates a list of suggested tags based on an event description.
     * Restricted to NGO admins.
     */
    generateEventTags: async (
      _: any,
      { description }: { description: string },
      context: MyContext
    ) => {
      const { user } = context;
      checkIsNgoAdmin(user); // Only admins can use this feature

      const prompt = `
        Based on the following event description, generate a list of 3-5 relevant keyword tags.
        Return *only* a valid JSON array of strings. Do not include any other text or markdown.
        Example: ["Community", "Environment", "Volunteering"]
        Description: "${description}"
      `;

      try {
        const result = await genAI.models.generateContent({
          model:"gemini-pro",
          contents:prompt
        })
        const text = result?.text ?? "";

        if (!text.trim()) {
          console.error("AI Tag Generation Failed: empty response", result);
          throw new GraphQLError("Failed to generate tags.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
        
        // Clean up the AI response just in case it includes markdown
        const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
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
};