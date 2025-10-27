import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import merge from "lodash.merge";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.service.js";

// Import all your schemas and resolvers
import { typeDefs } from "../graphql/index.js";
import { userResolvers } from "../graphql/resolvers/user.resolvers.js";
import { ngoResolvers } from "../graphql/resolvers/ngo.resolvers.js";
import { eventResolvers } from "../graphql/resolvers/event.resolvers.js";
import { signupResolvers } from "../graphql/resolvers/signup.resolvers.js";
import { badgeResolvers } from "../graphql/resolvers/badge.resolvers.js";

import { MyContext } from "../types/context.types.js";

// Secret from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export const createApolloGraphQLMiddleware = async () => {
  const resolvers = merge(
    userResolvers,
    ngoResolvers,
    eventResolvers,
    signupResolvers,
    badgeResolvers
  );

  // 1. Create the Apollo Server instance
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
  });

  // 2. Start the server
  await server.start();

  // 3. Return the configured Express middleware, including the context function
  return expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.cookies.accessToken;
      if (token) {
        try {
          const user = jwt.verify(
            token,
            ACCESS_TOKEN_SECRET
          ) as MyContext["user"] | undefined;
          
          if (!user || !user.id) {
            return {};
          }

          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

          return { user: dbUser };
        } catch (error) {
          // Token is invalid or expired
          return {};
        }
      }
      return {};
    },
  });
};
