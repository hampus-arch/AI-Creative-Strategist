"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Key, Bot, CheckCircle2, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { 
  getApiKeys, 
  setApiKey, 
  setGeminiKey, 
  setPreferredModel, 
  hasApiKey, 
  hasGeminiKey 
} from "@/lib/api-keys";

export default function SettingsPage() {
  const [apiKey, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKeyState, setHasApiKeyState] = useState(false);
  
  const [geminiApiKey, setGeminiApiKeyInput] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [hasGeminiKeyState, setHasGeminiKeyState] = useState(false);
  const [isSavingGemini, setIsSavingGemini] = useState(false);
  
  const [preferredModel, setPreferredModelState] = useState("gpt-4o");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const keys = getApiKeys();
    setHasApiKeyState(hasApiKey());
    setHasGeminiKeyState(hasGeminiKey());
    setPreferredModelState(keys.preferredModel);
    
    if (hasApiKey()) {
      fetchModels();
    }
    setIsLoading(false);
  };

  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const keys = getApiKeys();
      const response = await fetch("/api/settings/models", {
        headers: {
          "x-openai-api-key": keys.openai,
        },
      });
      const data = await response.json();
      if (data.models) {
        setAvailableModels(data.models);
      }
    } catch {
      console.error("Failed to fetch models");
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    // Basic validation
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      toast.error("Invalid OpenAI API key format. Should start with 'sk-'");
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage
      setApiKey(apiKey);
      
      // Also save to server (for backward compatibility)
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to save API key");
        return;
      }

      toast.success("OpenAI API key saved successfully");
      setHasApiKeyState(true);
      setApiKeyInput("");
      fetchModels();
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiApiKey.trim()) {
      toast.error("Please enter a Gemini API key");
      return;
    }

    // Basic validation
    if (!geminiApiKey.startsWith("AIza") || geminiApiKey.length < 30) {
      toast.error("Invalid Gemini API key format. Should start with 'AIza'");
      return;
    }

    setIsSavingGemini(true);
    try {
      // Save to localStorage
      setGeminiKey(geminiApiKey);
      
      // Also save to server (for backward compatibility)
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to save Gemini API key");
        return;
      }

      toast.success("Gemini API key saved successfully");
      setHasGeminiKeyState(true);
      setGeminiApiKeyInput("");
    } catch {
      toast.error("Failed to save Gemini API key");
    } finally {
      setIsSavingGemini(false);
    }
  };

  const handleSaveModel = async (model: string) => {
    setPreferredModelState(model);
    
    // Save to localStorage
    setPreferredModel(model);
    
    try {
      // Also save to server
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredModel: model }),
      });

      if (!response.ok) {
        toast.error("Failed to save model preference");
        return;
      }

      toast.success("Model preference saved");
    } catch {
      toast.error("Failed to save model preference");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400 mt-1">
          Configure your API keys and preferences
        </p>
      </div>

      {/* Success Info */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-500 font-medium text-sm">
                API Keys Saved Locally
              </p>
              <p className="text-green-400/80 text-xs mt-1">
                Your API keys are now saved in your browser and will persist across sessions. 
                They are stored locally and never sent to our servers except when making API calls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI API Key Card */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-white">OpenAI API Key</CardTitle>
          </div>
          <CardDescription className="text-neutral-400">
            For content generation (hooks, scripts, analysis)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasApiKeyState && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-500 text-sm">
                OpenAI API key is configured
              </span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-neutral-300">
              {hasApiKeyState ? "Update API Key" : "Enter API Key"}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                onClick={handleSaveApiKey}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gemini API Key Card */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-white">Google Gemini API Key</CardTitle>
          </div>
          <CardDescription className="text-neutral-400">
            For AI image generation (Imagen 3)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasGeminiKeyState && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-500 text-sm">
                Gemini API key is configured
              </span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="geminiKey" className="text-neutral-300">
              {hasGeminiKeyState ? "Update Gemini Key" : "Enter Gemini Key"}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="geminiKey"
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="AIza..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showGeminiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                onClick={handleSaveGeminiKey}
                disabled={isSavingGemini}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSavingGemini ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              Get your API key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                aistudio.google.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Selection Card */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-white">Model Selection</CardTitle>
          </div>
          <CardDescription className="text-neutral-400">
            Choose which OpenAI model to use for content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="model" className="text-neutral-300">
              Preferred Model
            </Label>
            <Select
              value={preferredModel}
              onValueChange={handleSaveModel}
              disabled={!hasApiKeyState || isLoadingModels}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <SelectItem
                      key={model}
                      value={model}
                      className="text-white focus:bg-orange-500/20 focus:text-white"
                    >
                      {model}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="gpt-4o" className="text-white">
                      gpt-4o
                    </SelectItem>
                    <SelectItem value="gpt-4o-mini" className="text-white">
                      gpt-4o-mini
                    </SelectItem>
                    <SelectItem value="gpt-4-turbo" className="text-white">
                      gpt-4-turbo
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {!hasApiKeyState && (
              <p className="text-xs text-neutral-500">
                Add your API key above to see available models
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
