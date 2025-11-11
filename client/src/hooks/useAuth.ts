import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME_QUERY } from "../graphql/queries/user.queries";
import { LOGOUT_MUTATION } from "../graphql/mutations/auth.mutations";
import type { User } from "../types/user.types";

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

  const { data, loading: queryLoading, refetch } = useQuery<{ me: User | null }>(ME_QUERY);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

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

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error("Logout mutation failed:", error);
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
