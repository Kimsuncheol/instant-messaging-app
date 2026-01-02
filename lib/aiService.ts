import { app } from "./firebase";
import { getAI, getGenerativeModel, GoogleAIBackend, ResponseModality } from "firebase/ai";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a GenerativeModel instance for image generation
const imageModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-image",
  generationConfig: {
    responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
  },
});

export interface GeneratedImage {
  mimeType: string;
  data: string; // base64 encoded
}

export interface ImageGenerationResult {
  image?: GeneratedImage;
  text?: string;
  error?: string;
}

/**
 * Generate an image from a text prompt using Gemini
 */
export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  try {
    const result = await imageModel.generateContent(prompt);
    const response = result.response;

    // Check for inline data parts (image)
    const inlineDataParts = response.inlineDataParts?.();
    if (inlineDataParts && inlineDataParts.length > 0) {
      const imageData = inlineDataParts[0].inlineData;
      return {
        image: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      };
    }

    // Fallback: Check candidates for image parts
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            image: {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data,
            },
          };
        }
        if (part.text) {
          return { text: part.text };
        }
      }
    }

    return { error: "No image generated" };
  } catch (err: unknown) {
    console.error("Image generation error:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Failed to generate image" };
  }
}

/**
 * Edit an image based on text instructions
 */
export async function editImage(
  imageBase64: string,
  mimeType: string,
  instructions: string
): Promise<ImageGenerationResult> {
  try {
    const result = await imageModel.generateContent([
      { text: instructions },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = result.response;
    const inlineDataParts = response.inlineDataParts?.();

    if (inlineDataParts && inlineDataParts.length > 0) {
      const imageData = inlineDataParts[0].inlineData;
      return {
        image: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      };
    }

    return { error: "No edited image generated" };
  } catch (err: unknown) {
    console.error("Image edit error:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Failed to edit image" };
  }
}
