// // lib/api.js
// export const processBackgroundRemove = async (imageData) => {
//   try {
//     const response = await fetch('/api/background-remove', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: imageData }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Background removal API error:', error);
//     return { 
//       success: false, 
//       error: error.message || 'Network error during background removal' 
//     };
//   }
// };

// export const processImageAdjustments = async (imageData, adjustments) => {
//   try {
//     const response = await fetch('/api/image-adjust', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: imageData, adjustments }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Image adjustment API error:', error);
//     return { 
//       success: false, 
//       error: error.message || 'Network error during image adjustment' 
//     };
//   }
// };

// export const convertImageFormat = async (imageData, format) => {
//   try {
//     const response = await fetch('/api/image-convert', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: imageData, format }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Format conversion API error:', error);
//     return { 
//       success: false, 
//       error: error.message || 'Network error during format conversion' 
//     };
//   }
// };




// lib/api.js

// Helper function to handle API responses
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

export const processBackgroundRemove = async (imageData) => {
  try {
    // Check if imageData is a valid base64 string or blob
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data provided');
    }

    // Extract base64 data if it's a data URL
    const base64Data = imageData.startsWith('data:') 
      ? imageData.split(',')[1] 
      : imageData;

    const response = await fetch('/api/background-remove', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ image: base64Data }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Background removal API error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error during background removal' 
    };
  }
};

export const processImageAdjustments = async (imageData, adjustments) => {
  try {
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data provided');
    }

    const base64Data = imageData.startsWith('data:') 
      ? imageData.split(',')[1] 
      : imageData;

    const response = await fetch('/api/image-adjust', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ image: base64Data, adjustments }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Image adjustment API error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error during image adjustment' 
    };
  }
};

export const convertImageFormat = async (imageData, format) => {
  try {
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data provided');
    }

    const base64Data = imageData.startsWith('data:') 
      ? imageData.split(',')[1] 
      : imageData;

    const response = await fetch('/api/image-convert', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ image: base64Data, format }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Format conversion API error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error during format conversion' 
    };
  }
};

export const processBackgroundReplace = async (imageData, backgroundColor) => {
  try {
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data provided');
    }

    const base64Data = imageData.startsWith('data:') 
      ? imageData.split(',')[1] 
      : imageData;

    const response = await fetch('/api/background-replace', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        image: base64Data, 
        backgroundColor
      }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Background replacement API error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error during background replacement' 
    };
  }
};

// Add this new function to apply adjustments client-side as a fallback
export const applyAdjustmentsClientSide = (imageElement, adjustments) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    
    // Apply basic adjustments that can be done with canvas
    ctx.filter = `
      brightness(${100 + adjustments.brightness}%)
      contrast(${100 + adjustments.contrast}%)
      saturate(${100 + adjustments.saturation}%)
      blur(${adjustments.blur}px)
      hue-rotate(${adjustments.hue}deg)
      opacity(${adjustments.opacity}%)
    `.trim();
    
    ctx.drawImage(imageElement, 0, 0);
    
    // Handle zoom (scale)
    if (adjustments.zoom !== 0) {
      const zoomFactor = 1 + (adjustments.zoom / 100);
      const scaledWidth = canvas.width * zoomFactor;
      const scaledHeight = canvas.height * zoomFactor;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageElement, offsetX, offsetY, scaledWidth, scaledHeight);
    }
    
    // Handle temperature (warmth/coolness) - simplified approximation
    if (adjustments.temperature !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Adjust temperature (red/blue balance)
        data[i] = Math.min(255, data[i] + adjustments.temperature * 0.5); // Red
        data[i + 2] = Math.max(0, data[i + 2] - adjustments.temperature * 0.5); // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Handle vignette effect
    if (adjustments.vignette !== 0) {
      const vignetteStrength = adjustments.vignette / 100;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );
      
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${vignetteStrength * 0.5})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    resolve(canvas.toDataURL('image/png'));
  });
};