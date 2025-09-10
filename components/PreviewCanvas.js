
// components/PreviewCanvas.js
'use client';

import { useState, useEffect } from 'react';

export default function PreviewCanvas({ imageData, adjustments, isLoading }) {
  const [processedImage, setProcessedImage] = useState(null);

  useEffect(() => {
    if (imageData) {
      setProcessedImage(imageData);
    }
  }, [imageData]);

  // CSS filters that MATCH the API processing
  const getFilterStyle = () => {
    const brightness = 100 + (adjustments.brightness || 0);
    const contrast = 100 + (adjustments.contrast || 0);
    const saturation = 100 + (adjustments.saturation || 0);
    const blur = adjustments.blur || 0;
    const hue = adjustments.hue || 0;
    const opacity = (adjustments.opacity || 100) / 100;
    
    // Add exposure simulation - combine with brightness
    const exposure = adjustments.exposure || 0;
    const totalBrightness = brightness + (exposure * 0.7); // Combine brightness and exposure
    
    // Add sharpness simulation - combine with regular contrast
    const sharpness = adjustments.sharpness || 0;
    const totalContrast = contrast + (sharpness * 0.3); // Combine contrast and sharpness
    
    // Temperature simulation (warm/cool)
    const temperature = adjustments.temperature || 0;
    const temperatureFilter = temperature > 0 
      ? `sepia(${temperature * 0.3}%) hue-rotate(-${temperature * 0.2}deg)` // Warm
      : `sepia(${Math.abs(temperature) * 0.2}%) hue-rotate(${Math.abs(temperature) * 0.3}deg)`; // Cool

    return {
      filter: `
        brightness(${totalBrightness}%) /* Combined brightness + exposure */
        contrast(${totalContrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
        hue-rotate(${hue}deg)
        ${temperatureFilter}
      `.replace(/\s+/g, ' ').trim(),
      opacity: opacity,
      transform: `scale(${1 + ((adjustments.zoom || 0) / 100)})`,
      transformOrigin: 'center',
      boxShadow: adjustments.vignette > 0 
        ? `inset 0 0 ${adjustments.vignette * 3}px rgba(0, 0, 0, ${adjustments.vignette / 200})`
        : 'none'
    };
  };

  if (!imageData) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-gray-500 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <p>Upload an image to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="w-full h-96 flex items-center justify-center overflow-hidden">
        <img
          src={processedImage || imageData}
          alt="Processed preview"
          className="w-full h-auto max-h-96 object-contain transition-all duration-200"
          style={getFilterStyle()}
        />
      </div>
    </div>
  );
}