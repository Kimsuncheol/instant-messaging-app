"use client";

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Captures a DOM element as a PNG image
 * Uses dynamic import to ensure dom-to-image-more is only loaded client-side
 * @param element - The HTML element to capture
 * @returns Promise with base64 data URL and dimensions
 */
export async function captureElement(
  element: HTMLElement
): Promise<CaptureResult> {
  try {
    // Dynamic import to avoid SSR issues
    const domtoimage = (await import("dom-to-image-more")).default;
    
    const dataUrl = await domtoimage.toPng(element, {
      quality: 1,
      bgcolor: "#0B141A", // Match chat background
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    return {
      dataUrl,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  } catch (error) {
    console.error("Error capturing element:", error);
    throw new Error("Failed to capture messages");
  }
}

/**
 * Downloads a base64 data URL as an image file
 * @param dataUrl - The base64 data URL
 * @param filename - The filename (without extension)
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Converts a data URL to a Blob
 * @param dataUrl - The base64 data URL
 * @returns Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Shares the captured image using Web Share API (if available)
 * @param dataUrl - The base64 data URL
 * @param title - The share title
 */
export async function shareImage(
  dataUrl: string,
  title: string
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], `${title}.png`, { type: "image/png" });

    await navigator.share({
      title,
      files: [file],
    });
    return true;
  } catch (error) {
    console.error("Error sharing image:", error);
    return false;
  }
}

