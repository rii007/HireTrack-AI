import { createContext, useContext, useState, ReactNode } from "react";

type SearchContextState = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const SearchContext = createContext<SearchContextState | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return ctx;
}
