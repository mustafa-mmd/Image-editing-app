const handleApiResponse = async (response) => {
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: `HTTP error! status: ${response.status}` };
    }
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Background removal
export const processBackgroundRemove = async (imageData) => {
  try {
    if (!imageData || typeof imageData !== "string") throw new Error("Invalid image data");
    const base64Data = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;

    const response = await fetch("/api/background-remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Background removal API error:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

// Image adjustments
export const processImageAdjustments = async (imageData, adjustments) => {
  try {
    if (!imageData || typeof imageData !== "string") throw new Error("Invalid image data");
    const base64Data = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;

    const response = await fetch("/api/image-adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data, adjustments }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Image adjustment API error:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

// Format conversion
export const convertImageFormat = async (imageData, format) => {
  try {
    if (!imageData || typeof imageData !== "string") throw new Error("Invalid image data");
    const base64Data = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;

    const response = await fetch("/api/image-convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data, format }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Format conversion API error:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

// Background replacement
export const processBackgroundReplace = async (imageData, backgroundColor) => {
  try {
    if (!imageData || typeof imageData !== "string") throw new Error("Invalid image data");
    const base64Data = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;

    const response = await fetch("/api/background-replace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data, backgroundColor }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Background replacement API error:", error);
    return { success: false, error: error.message || "Network error" };
  }
};


export const processAIEnhance = async (imageData) => {
  try {
    if (!imageData || typeof imageData !== "string") throw new Error("No image provided to AI enhance");

    // Send the FULL data URL (API expects this format)
    const response = await fetch("/api/ai-enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData }), // Send full data URL
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || "AI enhancement failed");
    }

    if (!result.image) {
      throw new Error("No image received from enhancement");
    }

    // Ensure the returned image has proper data URL format
    let enhancedImage = result.image;
    if (!enhancedImage.startsWith('data:image/')) {
      enhancedImage = `data:image/png;base64,${enhancedImage}`;
    }

    return {
      ...result,
      image: enhancedImage
    };
  } catch (error) {
    console.error("AI enhancement API call failed:", error);
    return { 
      success: false, 
      error: error.message || "Network error during enhancement",
      image: imageData // Return original image as fallback
    };
  }
};

// Client-side adjustments fallback
export const applyAdjustmentsClientSide = (imageElement, adjustments) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    ctx.filter = `
      brightness(${100 + (adjustments.brightness || 0)}%)
      contrast(${100 + (adjustments.contrast || 0)}%)
      saturate(${100 + (adjustments.saturation || 0)}%)
      blur(${adjustments.blur || 0}px)
      hue-rotate(${adjustments.hue || 0}deg)
      opacity(${(adjustments.opacity || 100)}%)
    `.trim();

    ctx.drawImage(imageElement, 0, 0);
    resolve(canvas.toDataURL("image/png"));
  });
};