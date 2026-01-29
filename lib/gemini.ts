// Google Gemini API utilities for image generation

export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "3:4";
export type ImageStyle = "realistic" | "illustrated" | "minimal" | "photographic" | "digital-art" | "3d-render";

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: AspectRatio;
  style?: ImageStyle;
  negativePrompt?: string;
}

export interface GeneratedImage {
  base64Data: string;
  mimeType: string;
}

const STYLE_PROMPTS: Record<ImageStyle, string> = {
  realistic: "photorealistic, high quality, professional photography, 8k resolution",
  illustrated: "digital illustration, artistic, vibrant colors, detailed artwork",
  minimal: "minimalist design, clean, simple, modern aesthetic, white space",
  photographic: "professional product photography, studio lighting, high-end commercial",
  "digital-art": "digital art, creative, artistic interpretation, bold colors",
  "3d-render": "3D render, CGI, realistic materials, professional lighting, octane render",
};

export async function generateImage(
  apiKey: string,
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const { prompt, aspectRatio = "1:1", style = "photographic", negativePrompt } = options;

  // Enhance prompt with style
  const styleEnhancement = STYLE_PROMPTS[style] || "";
  const enhancedPrompt = `${prompt}. ${styleEnhancement}`;

  // Build the request for Gemini's image generation
  // Using the Imagen model through Gemini API
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Generate an image: ${enhancedPrompt}${negativePrompt ? `. Avoid: ${negativePrompt}` : ""}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["image", "text"],
      responseMimeType: "image/png",
    },
  };

  try {
    // Try Gemini 2.0 Flash with image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract image from response
    const candidates = data.candidates || [];
    if (candidates.length === 0) {
      throw new Error("No image generated");
    }

    const parts = candidates[0]?.content?.parts || [];
    const imagePart = parts.find((part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData);

    if (!imagePart?.inlineData) {
      // If no image, might need to try Imagen model instead
      throw new Error("No image in response. The model may not support image generation.");
    }

    return {
      base64Data: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    };
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}

// Alternative: Use Imagen 3 directly if available
export async function generateImageWithImagen(
  apiKey: string,
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const { prompt, aspectRatio = "1:1", style = "photographic" } = options;

  const styleEnhancement = STYLE_PROMPTS[style] || "";
  const enhancedPrompt = `${prompt}. ${styleEnhancement}`;

  const requestBody = {
    instances: [
      {
        prompt: enhancedPrompt,
      },
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: aspectRatio,
      safetyFilterLevel: "block_few",
      personGeneration: "allow_adult",
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Imagen API error: ${response.status}`);
  }

  const data = await response.json();
  const predictions = data.predictions || [];

  if (predictions.length === 0 || !predictions[0].bytesBase64Encoded) {
    throw new Error("No image generated");
  }

  return {
    base64Data: predictions[0].bytesBase64Encoded,
    mimeType: "image/png",
  };
}

export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

// Helper to create image prompt from ad concept
export function createImagePromptFromConcept(
  concept: string,
  brandName?: string,
  productDescription?: string
): string {
  let prompt = `Create a professional advertisement image. `;
  
  if (brandName) {
    prompt += `Brand: ${brandName}. `;
  }
  
  prompt += `Concept: ${concept}. `;
  
  if (productDescription) {
    prompt += `Product: ${productDescription}. `;
  }
  
  prompt += `The image should be eye-catching, suitable for social media advertising, with clean composition and professional lighting.`;
  
  return prompt;
}
