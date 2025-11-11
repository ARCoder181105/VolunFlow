import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
  credentials: "include", // needed if backend uses cookies
});

// Auth middleware — attach token or other headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("auth_token");

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// ✅ Correct TypeScript-safe error handler
const errorLink = onError((error) => {
  const { graphQLErrors, networkError } = error;

  if (graphQLErrors && graphQLErrors.length > 0) {
    graphQLErrors.forEach((err) => {
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${JSON.stringify(
          err.locations
        )}, Path: ${err.path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
