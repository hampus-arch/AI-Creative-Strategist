// Mock data for development without database

import { FrameworkPhase } from "./framework";

export const MOCK_USER = {
  id: "mock-user-1",
  name: "Demo User",
  email: "demo@example.com",
};

export interface MockBrand {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  scrapedContent: string | null;
  metaAdsLibraryUrl: string | null;
  createdAt: string;
}

// In-memory storage for brands (will reset on page refresh)
let mockBrands: MockBrand[] = [];

export function getMockBrands(): MockBrand[] {
  return mockBrands;
}

export function addMockBrand(brand: Omit<MockBrand, "id" | "createdAt">): MockBrand {
  const newBrand: MockBrand = {
    ...brand,
    id: `brand-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  mockBrands.push(newBrand);
  return newBrand;
}

export function deleteMockBrand(id: string): boolean {
  const index = mockBrands.findIndex((b) => b.id === id);
  if (index !== -1) {
    mockBrands.splice(index, 1);
    return true;
  }
  return false;
}

export function getMockBrand(id: string): MockBrand | undefined {
  return mockBrands.find((b) => b.id === id);
}

// Mock settings
let mockSettings = {
  openaiApiKey: "",
  geminiApiKey: "",
  preferredModel: "gpt-4o",
};

export function getMockSettings() {
  return {
    hasApiKey: !!mockSettings.openaiApiKey,
    hasGeminiKey: !!mockSettings.geminiApiKey,
    preferredModel: mockSettings.preferredModel,
    apiKey: mockSettings.openaiApiKey,
    geminiApiKey: mockSettings.geminiApiKey,
  };
}

export function setMockSettings(settings: { 
  apiKey?: string; 
  geminiApiKey?: string;
  preferredModel?: string;
}) {
  if (settings.apiKey !== undefined) {
    mockSettings.openaiApiKey = settings.apiKey;
  }
  if (settings.geminiApiKey !== undefined) {
    mockSettings.geminiApiKey = settings.geminiApiKey;
  }
  if (settings.preferredModel !== undefined) {
    mockSettings.preferredModel = settings.preferredModel;
  }
}

// ============================================
// SAVED ADS - Ad Library functionality
// ============================================

export type AdFormat = "image" | "video" | "carousel";

export interface SavedAd {
  id: string;
  brandId?: string;
  brandName: string;
  imageData?: string;           // Base64 encoded image data
  adCopy: string;               // The ad text
  hook?: string;                // Extracted hook
  cta?: string;                 // Call to action
  format: AdFormat;
  frameworkPhase: FrameworkPhase;
  metaAdsLibraryUrl?: string;
  aiAnalysis?: string;          // AI-generated insights
  tags: string[];
  createdAt: string;
}

// In-memory storage for saved ads
let mockAds: SavedAd[] = [];

export function getMockAds(): SavedAd[] {
  return mockAds;
}

export function getMockAdsByBrand(brandId: string): SavedAd[] {
  return mockAds.filter((ad) => ad.brandId === brandId);
}

export function getMockAdsByPhase(phase: FrameworkPhase): SavedAd[] {
  return mockAds.filter((ad) => ad.frameworkPhase === phase);
}

export function getMockAd(id: string): SavedAd | undefined {
  return mockAds.find((ad) => ad.id === id);
}

export function addMockAd(ad: Omit<SavedAd, "id" | "createdAt">): SavedAd {
  const newAd: SavedAd = {
    ...ad,
    id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  mockAds.push(newAd);
  return newAd;
}

export function updateMockAd(id: string, updates: Partial<SavedAd>): SavedAd | null {
  const index = mockAds.findIndex((ad) => ad.id === id);
  if (index !== -1) {
    mockAds[index] = { ...mockAds[index], ...updates };
    return mockAds[index];
  }
  return null;
}

export function deleteMockAd(id: string): boolean {
  const index = mockAds.findIndex((ad) => ad.id === id);
  if (index !== -1) {
    mockAds.splice(index, 1);
    return true;
  }
  return false;
}

export function searchMockAds(query: string): SavedAd[] {
  const lowerQuery = query.toLowerCase();
  return mockAds.filter(
    (ad) =>
      ad.brandName.toLowerCase().includes(lowerQuery) ||
      ad.adCopy.toLowerCase().includes(lowerQuery) ||
      ad.hook?.toLowerCase().includes(lowerQuery) ||
      ad.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// Helper to extract page ID from Meta Ads Library URL
export function extractMetaPageId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pageId = urlObj.searchParams.get("view_all_page_id");
    return pageId;
  } catch {
    return null;
  }
}
