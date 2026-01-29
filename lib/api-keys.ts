// Client-side API key management using localStorage
// This ensures API keys persist across sessions and work on Vercel

const OPENAI_KEY_STORAGE = "openai_api_key";
const GEMINI_KEY_STORAGE = "gemini_api_key";
const PREFERRED_MODEL_STORAGE = "preferred_model";

export function getApiKeys() {
  if (typeof window === "undefined") {
    return { openai: "", gemini: "", preferredModel: "gpt-4o" };
  }

  return {
    openai: localStorage.getItem(OPENAI_KEY_STORAGE) || "",
    gemini: localStorage.getItem(GEMINI_KEY_STORAGE) || "",
    preferredModel: localStorage.getItem(PREFERRED_MODEL_STORAGE) || "gpt-4o",
  };
}

export function setApiKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OPENAI_KEY_STORAGE, key);
}

export function setGeminiKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
}

export function setPreferredModel(model: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFERRED_MODEL_STORAGE, model);
}

export function hasApiKey(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(OPENAI_KEY_STORAGE);
}

export function hasGeminiKey(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(GEMINI_KEY_STORAGE);
}

export function clearApiKeys() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OPENAI_KEY_STORAGE);
  localStorage.removeItem(GEMINI_KEY_STORAGE);
  localStorage.removeItem(PREFERRED_MODEL_STORAGE);
}

// Get API keys for use in API requests (client-side only)
export function getApiKeysForRequest() {
  const keys = getApiKeys();
  return {
    "x-openai-api-key": keys.openai,
    "x-gemini-api-key": keys.gemini,
    "x-preferred-model": keys.preferredModel,
  };
}
