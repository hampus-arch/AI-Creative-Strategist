"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FRAMEWORK_PHASES,
  PROMPT_TEMPLATES,
  CUSTOMER_AVATAR_PROMPT,
  type FrameworkPhase,
  type PromptTemplate,
} from "@/lib/framework";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Building2,
  RefreshCw,
  Lightbulb,
  Image as ImageIcon,
} from "lucide-react";
import { GenerateImageDialog } from "@/components/generate-image-dialog";
import { addMockAd } from "@/lib/mock-data";

interface Brand {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  scrapedContent: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedPhase, setSelectedPhase] = useState<FrameworkPhase>(
    (searchParams.get("phase") as FrameworkPhase) || "INTERRUPT"
  );
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    searchParams.get("brand") || ""
  );
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Image generation state
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState("");
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    fetchBrands();
    checkGeminiKey();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data.brands || []);
    } catch {
      console.error("Failed to fetch brands");
    }
  };

  const checkGeminiKey = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setHasGeminiKey(data.hasGeminiKey || false);
    } catch {
      console.error("Failed to check Gemini key");
    }
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const phasePrompts = PROMPT_TEMPLATES[selectedPhase] || [];
  const allPrompts = [CUSTOMER_AVATAR_PROMPT, ...phasePrompts];

  const fillPromptVariables = (template: string): string => {
    if (!selectedBrand) return template;
    
    let filled = template;
    filled = filled.replace(/\{\{brandName\}\}/g, selectedBrand.name || "");
    filled = filled.replace(/\{\{productName\}\}/g, selectedBrand.name || "");
    filled = filled.replace(/\{\{productDescription\}\}/g, selectedBrand.description || "");
    filled = filled.replace(/\{\{websiteContent\}\}/g, selectedBrand.scrapedContent || "");
    filled = filled.replace(/\{\{targetAudience\}\}/g, "Target audience based on brand profile");
    filled = filled.replace(/\{\{keyFeatures\}\}/g, "Key features from brand description");
    filled = filled.replace(/\{\{keyBenefits\}\}/g, "Key benefits from brand description");
    filled = filled.replace(/\{\{painPoints\}\}/g, "Pain points based on brand profile");
    filled = filled.replace(/\{\{differentiators\}\}/g, "Unique differentiators");
    filled = filled.replace(/\{\{objections\}\}/g, "Common objections");
    filled = filled.replace(/\{\{socialProof\}\}/g, "Social proof elements");
    filled = filled.replace(/\{\{successStories\}\}/g, "Customer success stories");
    filled = filled.replace(/\{\{reviews\}\}/g, "Customer reviews");
    filled = filled.replace(/\{\{currentOffer\}\}/g, "Current promotional offer");
    filled = filled.replace(/\{\{loyaltyProgram\}\}/g, "Loyalty program details");
    filled = filled.replace(/\{\{purchasedProduct\}\}/g, "Previously purchased product");
    filled = filled.replace(/\{\{complementaryProduct\}\}/g, "Complementary product");
    
    return filled;
  };

  const handlePromptSelect = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    const filledPrompt = fillPromptVariables(prompt.promptTemplate);
    setInput(filledPrompt);
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          brandId: selectedBrandId,
          frameworkPhase: selectedPhase,
          contentType: selectedPrompt?.type || "general",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate content");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard");
  };

  const handleClear = () => {
    setMessages([]);
    setSelectedPrompt(null);
    setInput("");
  };

  const handleGenerateImage = (content: string) => {
    // Extract a meaningful hook/concept from the content
    // Take the first 200 characters or first paragraph
    const concept = content.split('\n')[0].slice(0, 200);
    setSelectedConcept(concept);
    setImageDialogOpen(true);
  };

  const handleSaveToLibrary = async (imageData: string, prompt: string) => {
    try {
      // Save to ad library via API
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: selectedBrand?.name || "Generated",
          brandId: selectedBrandId || undefined,
          adCopy: selectedConcept,
          hook: selectedConcept.slice(0, 100),
          format: "image",
          frameworkPhase: selectedPhase,
          tags: ["ai-generated", selectedPhase.toLowerCase()],
          imageData: imageData,
        }),
      });

      if (response.ok) {
        toast.success("Image saved to Ad Library!");
      }
    } catch {
      // Fallback: save locally using mock function
      addMockAd({
        brandName: selectedBrand?.name || "Generated",
        brandId: selectedBrandId || undefined,
        adCopy: selectedConcept,
        hook: selectedConcept.slice(0, 100),
        format: "image",
        frameworkPhase: selectedPhase,
        tags: ["ai-generated", selectedPhase.toLowerCase()],
        imageData: imageData,
      });
      toast.success("Image saved to Ad Library!");
    }
  };

  const phaseInfo = FRAMEWORK_PHASES.find((p) => p.id === selectedPhase);

  return (
    <div className="flex h-[calc(100vh-2rem)] p-4 gap-4">
      {/* Left Sidebar - Prompts */}
      <Card className="w-80 flex-shrink-0 bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Generate Content</CardTitle>
          <CardDescription className="text-neutral-400">
            Select phase, brand, and prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phase Selector */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Framework Phase</label>
            <Select
              value={selectedPhase}
              onValueChange={(v) => setSelectedPhase(v as FrameworkPhase)}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {FRAMEWORK_PHASES.map((phase) => (
                  <SelectItem
                    key={phase.id}
                    value={phase.id}
                    className="text-white focus:bg-orange-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full bg-gradient-to-r",
                          phase.color
                        )}
                      />
                      {phase.name}
                      <Badge variant="outline" className="ml-1 text-xs">
                        {phase.percentage}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Selector */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Brand</label>
            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {brands.map((brand) => (
                  <SelectItem
                    key={brand.id}
                    value={brand.id}
                    className="text-white focus:bg-orange-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {brand.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompts */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-400">Prompt Templates</label>
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="space-y-2 pr-2">
                {allPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handlePromptSelect(prompt)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      selectedPrompt?.id === prompt.id
                        ? "bg-orange-500/20 border border-orange-500/50"
                        : "bg-neutral-800 border border-neutral-700 hover:border-neutral-600"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {prompt.name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {prompt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col bg-neutral-900 border-neutral-800">
        {/* Header */}
        <CardHeader className="pb-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                AI Content Generator
              </CardTitle>
              <CardDescription className="text-neutral-400">
                {phaseInfo?.name} Phase • {phaseInfo?.goal}
              </CardDescription>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="border-neutral-700 text-neutral-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Ready to Generate
              </h3>
              <p className="text-neutral-400 text-sm max-w-md">
                Select a prompt template from the left panel, or write your own prompt below.
                {!selectedBrandId && " Select a brand for personalized content."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-4",
                      message.role === "user"
                        ? "bg-orange-500/20 text-white"
                        : "bg-neutral-800 text-neutral-100"
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.role === "assistant" && message.content && (
                      <div className="flex justify-end gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(message.content, index)}
                          className="text-neutral-400 hover:text-white h-8"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {hasGeminiKey && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateImage(message.content)}
                            className="text-blue-400 hover:text-blue-300 h-8"
                            title="Generate image from this content"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your prompt or select a template..."
              className="bg-neutral-800 border-neutral-700 text-white resize-none min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 px-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-neutral-500">
              Press ⌘+Enter to send
            </p>
            {!hasGeminiKey && (
              <p className="text-xs text-neutral-500">
                Add Gemini API key in{" "}
                <a href="/settings" className="text-blue-500 hover:underline">
                  Settings
                </a>{" "}
                to generate images
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Image Generation Dialog */}
      <GenerateImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        initialConcept={selectedConcept}
        brandName={selectedBrand?.name}
        onSaveToLibrary={handleSaveToLibrary}
      />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
      <GeneratePageContent />
    </Suspense>
  );
}
