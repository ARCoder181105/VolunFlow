import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configure the HTTP connection to your GraphQL server
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
  credentials: 'include', // This sends cookies with requests
});

// Set up authentication context if needed
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      // You can add authentication headers here if needed
    },
  };
});

// Create the Apollo Client instance
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});