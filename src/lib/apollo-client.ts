"use client";

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAccessToken } from "@/lib/auth-context";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? (() => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    console.error("NEXT_PUBLIC_GRAPHQL_URL is not set — GraphQL requests will fail");
  }
  return "http://localhost:8000/graphql";
})();

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default apolloClient;
