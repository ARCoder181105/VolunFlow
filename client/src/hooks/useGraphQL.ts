import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { type OperationVariables } from '@apollo/client';
import type { DocumentNode } from 'graphql';

// Custom hook for GraphQL queries with enhanced error handling and loading states
export function useGraphQLQuery<TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: Parameters<typeof useQuery<TData, TVariables>>[1]
) {
  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery<TData, TVariables>(query, {
    notifyOnNetworkStatusChange: true,
    ...(options || {}),
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      console.error('GraphQL Query Error:', error);
      
      // Extract user-friendly error message
      const errorMessage = error.message || 'An unexpected error occurred';
      setLocalError(errorMessage);
      
      // You can add additional error handling logic here
      // like sending to error reporting service
    } else {
      setLocalError(null);
    }
  }, [error]);

  return {
    data,
    loading,
    error: localError,
    networkError: error,
    refetch,
    fetchMore,
    networkStatus,
    // Helper to clear errors
    clearError: () => setLocalError(null),
  };
}

// Custom hook for GraphQL mutations with enhanced error handling and states
export function useGraphQLMutation<TData = any, TVariables extends OperationVariables = OperationVariables>(
  mutation: DocumentNode,
  options?: Parameters<typeof useMutation<TData, TVariables>>[1]
) {
  const [mutate, { data, loading, error, called }] = useMutation<TData, TVariables>(mutation, options);

  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('GraphQL Mutation Error:', error);
      
      // Extract user-friendly error message
      const errorMessage = error.message || 'An unexpected error occurred';
      setLocalError(errorMessage);
      setSuccess(false);
    } else if (called && !loading && !error) {
      setSuccess(true);
      setLocalError(null);
    }
  }, [error, loading, called]);

  const executeMutation = async (variables?: TVariables) => {
    setLocalError(null);
    setSuccess(false);
    
    try {
      const result = await mutate({ variables } as any);
      return result;
    } catch (err) {
      console.error('Mutation execution error:', err);
      throw err;
    }
  };

  return {
    mutate: executeMutation,
    data,
    loading,
    error: localError,
    networkError: error,
    success,
    called,
    // Helper methods
    clearError: () => setLocalError(null),
    clearSuccess: () => setSuccess(false),
    reset: () => {
      setLocalError(null);
      setSuccess(false);
    },
  };
}

// Hook for paginated queries
export function usePaginatedQuery<TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: Parameters<typeof useQuery<TData, TVariables>>[1] & {
    itemsPerPage?: number;
  }
) {
  const itemsPerPage = options?.itemsPerPage || 10;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const queryOptions: Parameters<typeof useQuery<TData, TVariables>>[1] = {
    ...options,
    variables: {
      ...options?.variables,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    } as TVariables,
  };

  const { data, loading, error, refetch, fetchMore, networkStatus } = useGraphQLQuery<TData, TVariables>(
    query,
    queryOptions
  );

  const loadNextPage = async () => {
    if (!hasMore || loading) return;

    try {
      const result = await fetchMore({
        variables: {
          skip: page * itemsPerPage,
          take: itemsPerPage,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          // Check if we have more items to load
          const newItems = (fetchMoreResult as any)[Object.keys(fetchMoreResult)[0]];
          if (newItems.length < itemsPerPage) {
            setHasMore(false);
          }
          
          // Merge previous and new results
          return {
            ...prev,
            [Object.keys(prev as object)[0]]: [
              ...(prev as any)[Object.keys(prev as object)[0]],
              ...newItems,
            ],
          };
        },
      });

      setPage(prev => prev + 1);
      return result;
    } catch (err) {
      console.error('Error loading next page:', err);
      throw err;
    }
  };

  const resetPagination = () => {
    setPage(1);
    setHasMore(true);
    refetch({
      skip: 0,
      take: itemsPerPage,
    } as TVariables);
  };

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    loadNextPage,
    resetPagination,
    refetch,
    networkStatus,
  };
}

// Hook for optimistic updates
export function useOptimisticMutation<TData = any, TVariables extends OperationVariables = OperationVariables>(
  mutation: DocumentNode,
  optimisticResponse: any,
  updateFunction: (cache: any, result: any) => void,
  options?: Parameters<typeof useMutation<TData, TVariables>>[1]
) {
  const mutationOptions: Parameters<typeof useMutation<TData, TVariables>>[1] = {
    ...options,
    optimisticResponse,
    update: updateFunction,
  };

  return useGraphQLMutation(mutation, mutationOptions);
}