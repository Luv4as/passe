"use client";

import { createContext, useContext, useState } from "react";

interface HeaderActionContextType {
  headerAction: React.ReactNode | null;
  setHeaderAction: (action: React.ReactNode | null) => void;
  headerDescription: React.ReactNode | null;
  setHeaderDescription: (description: React.ReactNode | null) => void;
  customTitle: string | null;
  setCustomTitle: (title: string | null) => void;
  hideHeader: boolean;
  setHideHeader: (hide: boolean) => void;
}

const HeaderActionContext = createContext<HeaderActionContextType | undefined>(
  undefined,
);

export function HeaderActionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerAction, setHeaderAction] = useState<React.ReactNode | null>(
    null,
  );
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [headerDescription, setHeaderDescription] =
    useState<React.ReactNode | null>(null);
  const [hideHeader, setHideHeader] = useState<boolean>(false);
  return (
    <HeaderActionContext.Provider
      value={{
        headerAction,
        setHeaderAction,
        customTitle,
        setCustomTitle,
        headerDescription,
        setHeaderDescription,
        hideHeader,
        setHideHeader,
      }}
    >
      {children}
    </HeaderActionContext.Provider>
  );
}

export function useHeaderAction() {
  const context = useContext(HeaderActionContext);
  if (!context) {
    throw new Error(
      "useHeaderAction must be used within a HeaderActionProvider",
    );
  }
  return context;
}
