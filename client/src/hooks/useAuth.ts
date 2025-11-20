import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "../graphql/queries/user.queries";
import type { User, MeData } from "../types/user.types";
// FIX 1: Import the client instance
import { client } from "../graphql/client"; 

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
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

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
    setLoading(queryLoading);
  }, [data, queryLoading]);

  const checkAuth = async () => {
    try {
      const result = await refetch();
      // FIX 2: Use optional chaining (?.) to safely access data
      if (result.data?.me) {
        setUser(result.data.me);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Check auth failed:", error);
      setUser(null);
    }
  };

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
        await checkAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
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
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Now 'client' is properly imported and this will work
      await client.clearStore(); 
    }
  };

  const value = {
    user,
    loading: loading || queryLoading,
    logout,
    refreshToken,
    checkAuth,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};