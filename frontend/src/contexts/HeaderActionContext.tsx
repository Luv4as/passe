'use client'

import { createContext, useContext, useState } from "react";

interface HeaderActionContextType {
  headerAction: React.ReactNode | null;
  setHeaderAction: (action: React.ReactNode | null) => void;
}

const HeaderActionContext = createContext<HeaderActionContextType>({
  headerAction: null,
  setHeaderAction: () => {},
});

export function HeaderActionProvider({ children }: { children: React.ReactNode }) {
  const [headerAction, setHeaderAction] = useState<React.ReactNode | null>(null);

  return (
    <HeaderActionContext.Provider value={{ headerAction, setHeaderAction }}>
      {children}
    </HeaderActionContext.Provider>
  );
}

export const useHeaderAction = () => useContext(HeaderActionContext);