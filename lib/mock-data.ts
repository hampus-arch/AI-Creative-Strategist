// Mock data for development without database

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
  preferredModel: "gpt-4o",
};

export function getMockSettings() {
  return {
    hasApiKey: !!mockSettings.openaiApiKey,
    preferredModel: mockSettings.preferredModel,
    apiKey: mockSettings.openaiApiKey,
  };
}

export function setMockSettings(settings: { apiKey?: string; preferredModel?: string }) {
  if (settings.apiKey !== undefined) {
    mockSettings.openaiApiKey = settings.apiKey;
  }
  if (settings.preferredModel !== undefined) {
    mockSettings.preferredModel = settings.preferredModel;
  }
}
