import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
// Import useQuery, but NOT useMutation
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "../graphql/queries/user.queries";
// DO NOT import LOGOUT_MUTATION, as it doesn't exist on the server
// import { LOGOUT_MUTATION } from "../graphql/mutations/auth.mutations"; 
import type { User, MeData } from "../types/user.types"; // Import MeData

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { data, loading: queryLoading, refetch } = useQuery<MeData>(ME_QUERY);
  
  // REMOVE the useMutation hook for logout
  // const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
    setLoading(queryLoading);
  }, [data, queryLoading]);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh_token`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        await refetch();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  // REWRITE the logout function to use fetch
  const logout = async () => {
    try {
      // Call the REST endpoint instead of the GraphQL mutation
      await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Logout fetch failed:", error);
    } finally {
      setUser(null);
      // Clear any remaining cookies
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  const value = {
    user,
    loading: loading || queryLoading,
    logout,
    refreshToken,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};