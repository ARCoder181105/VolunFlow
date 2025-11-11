import { useState, useEffect, useCallback } from 'react';

// Generic hook for localStorage with TypeScript support
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      // Remove from state
      setStoredValue(initialValue);
      
      // Remove from local storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const newValue = JSON.parse(event.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// Specialized hook for boolean values
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean
): [boolean, (value: boolean | ((val: boolean) => boolean)) => void, () => void] {
  return useLocalStorage<boolean>(key, initialValue);
}

// Specialized hook for string values
export function useLocalStorageString(
  key: string,
  initialValue: string
): [string, (value: string | ((val: string) => string)) => void, () => void] {
  return useLocalStorage<string>(key, initialValue);
}

// Specialized hook for number values
export function useLocalStorageNumber(
  key: string,
  initialValue: number
): [number, (value: number | ((val: number) => number)) => void, () => void] {
  return useLocalStorage<number>(key, initialValue);
}

// Specialized hook for array values
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[]
): [T[], (value: T[] | ((val: T[]) => T[])) => void, () => void] {
  return useLocalStorage<T[]>(key, initialValue);
}

// Specialized hook for object values
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  return useLocalStorage<T>(key, initialValue);
}

// Hook for managing a list in localStorage with CRUD operations
export function useLocalStorageList<T>(
  key: string,
  initialValue: T[] = []
) {
  const [items, setItems, removeItems] = useLocalStorage<T[]>(key, initialValue);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, [setItems]);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, [setItems]);

  const updateItem = useCallback((index: number, updatedItem: T) => {
    setItems(prev => prev.map((item, i) => i === index ? updatedItem : item));
  }, [setItems]);

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const getItem = useCallback((index: number): T | undefined => {
    return items[index];
  }, [items]);

  const findItem = useCallback((predicate: (item: T) => boolean): T | undefined => {
    return items.find(predicate);
  }, [items]);

  const filterItems = useCallback((predicate: (item: T) => boolean): T[] => {
    return items.filter(predicate);
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    getItem,
    findItem,
    filterItems,
    setItems,
    removeAll: removeItems,
    count: items.length,
    isEmpty: items.length === 0,
  };
}

// Hook for managing a map/dictionary in localStorage
export function useLocalStorageMap<T>(
  key: string,
  initialValue: Record<string, T> = {}
) {
  const [map, setMap, removeMap] = useLocalStorage<Record<string, T>>(key, initialValue);

  const setValue = useCallback((mapKey: string, value: T) => {
    setMap(prev => ({ ...prev, [mapKey]: value }));
  }, [setMap]);

  const getValue = useCallback((mapKey: string): T | undefined => {
    return map[mapKey];
  }, [map]);

  const removeValue = useCallback((mapKey: string) => {
    setMap(prev => {
      const { [mapKey]: removed, ...rest } = prev;
      return rest;
    });
  }, [setMap]);

  const hasKey = useCallback((mapKey: string): boolean => {
    return mapKey in map;
  }, [map]);

  const clearMap = useCallback(() => {
    setMap({});
  }, [setMap]);

  const keys = Object.keys(map);
  const values = Object.values(map);
  const entries = Object.entries(map);

  return {
    map,
    setValue,
    getValue,
    removeValue,
    hasKey,
    clearMap,
    keys,
    values,
    entries,
    size: keys.length,
    isEmpty: keys.length === 0,
    removeAll: removeMap,
  };
}