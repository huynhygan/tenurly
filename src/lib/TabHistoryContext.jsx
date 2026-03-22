import React, { createContext, useContext, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Each tab root path maps to an independent history stack
const TabHistoryContext = createContext();

export function TabHistoryProvider({ children }) {
  // Map of tabRoot -> array of paths visited
  const stacks = useRef({});

  const pushTab = useCallback((tabRoot, path) => {
    if (!stacks.current[tabRoot]) stacks.current[tabRoot] = [tabRoot];
    const stack = stacks.current[tabRoot];
    // Avoid duplicate consecutive entries
    if (stack[stack.length - 1] !== path) {
      stack.push(path);
    }
  }, []);

  const popTab = useCallback((tabRoot) => {
    const stack = stacks.current[tabRoot];
    if (!stack || stack.length <= 1) return null;
    stack.pop();
    return stack[stack.length - 1];
  }, []);

  const getTabPath = useCallback((tabRoot) => {
    const stack = stacks.current[tabRoot];
    if (!stack || stack.length === 0) return tabRoot;
    return stack[stack.length - 1];
  }, []);

  const resetTab = useCallback((tabRoot) => {
    stacks.current[tabRoot] = [tabRoot];
  }, []);

  return (
    <TabHistoryContext.Provider value={{ pushTab, popTab, getTabPath, resetTab }}>
      {children}
    </TabHistoryContext.Provider>
  );
}

export function useTabHistory() {
  return useContext(TabHistoryContext);
}

// Hook to register the current path into the tab stack
export function useRegisterTabPath(tabRoot) {
  const { pushTab } = useTabHistory();
  const location = useLocation();
  React.useEffect(() => {
    if (tabRoot) pushTab(tabRoot, location.pathname + location.search);
  }, [location.pathname, location.search, tabRoot, pushTab]);
}