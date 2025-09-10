// components/PreviewCanvas.js
// 'use client';

// import { useState, useEffect } from 'react';

// export default function PreviewCanvas({ imageData, adjustments, isLoading }) {
//   const [processedImage, setProcessedImage] = useState(null);

//   useEffect(() => {
//     if (imageData) {
//       setProcessedImage(imageData);
//     }
//   }, [imageData]);

//   if (!imageData) {
//     return (
//       <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
//         <div className="text-gray-500 text-center">
//           <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
//             <span className="text-2xl">📷</span>
//           </div>
//           <p>Upload an image to start editing</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
//       {isLoading && (
//         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
//           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}
//       <img
//         src={processedImage || imageData}
//         alt="Processed preview"
//         className="w-full h-auto max-h-96 object-contain"
//         style={{
//           filter: `
//             brightness(${100 + adjustments.brightness}%)
//             contrast(${100 + adjustments.contrast}%)
//             saturate(${100 + adjustments.saturation}%)
//           `,
//         }}
//       />
//     </div>
//   );
// }




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

  // Calculate CSS filter values for real-time preview
  const getFilterStyle = () => {
    // Reset to identity values when adjustments are at 0
    const brightness = adjustments.brightness === 0 ? 100 : 100 + adjustments.brightness;
    const contrast = adjustments.contrast === 0 ? 100 : 100 + adjustments.contrast;
    const saturation = adjustments.saturation === 0 ? 100 : 100 + adjustments.saturation;
    const blur = adjustments.blur === 0 ? 0 : adjustments.blur;
    const hue = adjustments.hue === 0 ? 0 : adjustments.hue;
    const opacity = adjustments.opacity === 100 ? 1 : adjustments.opacity / 100;

    return {
      filter: `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
        hue-rotate(${hue}deg)
      `,
      opacity: opacity,
      transform: `scale(${1 + (adjustments.zoom / 100)})`,
      transformOrigin: 'center'
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
      
      {/* Adjustment values display for debugging */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded hidden">
        Brightness: {adjustments.brightness}%
        <br />
        Contrast: {adjustments.contrast}%
        <br />
        Saturation: {adjustments.saturation}%
        <br />
        Blur: {adjustments.blur}px
      </div>
    </div>
  );
}