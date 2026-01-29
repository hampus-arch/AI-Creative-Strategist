"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type MockBrand } from "./mock-data";

interface BrandContextType {
  brands: MockBrand[];
  selectedBrand: MockBrand | null;
  setSelectedBrandId: (id: string | null) => void;
  isLoading: boolean;
  refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<MockBrand[]>([]);
  const [selectedBrandId, setSelectedBrandIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Load saved selection from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedBrandId");
    if (saved) {
      setSelectedBrandIdState(saved);
    }
  }, []);

  const setSelectedBrandId = (id: string | null) => {
    setSelectedBrandIdState(id);
    if (id) {
      localStorage.setItem("selectedBrandId", id);
    } else {
      localStorage.removeItem("selectedBrandId");
    }
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || null;

  return (
    <BrandContext.Provider
      value={{
        brands,
        selectedBrand,
        setSelectedBrandId,
        isLoading,
        refreshBrands: fetchBrands,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useSelectedBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useSelectedBrand must be used within a BrandProvider");
  }
  return context;
}
