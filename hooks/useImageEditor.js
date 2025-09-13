// // hooks/useImageEditor.js
// 'use client';

// import { useState, useCallback } from 'react';

// // Default adjustments object
// const defaultAdjustments = {
//   brightness: 0,
//   contrast: 0,
//   saturation: 0,
//   sharpness: 0,
//   exposure: 0,
//   blur: 0,
//   hue: 0,
//   opacity: 100,
//   zoom: 0,
//   temperature: 0,
//   vignette: 0
// };

// export const useImageEditor = () => {
//   const [state, setState] = useState({
//     originalImage: null,
//     baseImage: null,
//     transparentImage: null,
//     editedImage: null,
//     adjustments: { ...defaultAdjustments },
//     format: 'png',
//     isLoading: false,
//     isAIEnhanced: false // Add this line
//   });

//   const setImage = useCallback((image) => {
//     setState(prev => ({
//       ...prev,
//       originalImage: image,
//       baseImage: image,
//       editedImage: image
//     }));
//   }, []);

//   const setBaseImage = useCallback((image) => {
//     setState(prev => ({
//       ...prev,
//       baseImage: image,
//       editedImage: image
//     }));
//   }, []);

//   const setTransparentImage = useCallback((image) => {
//     setState(prev => ({
//       ...prev,
//       transparentImage: image
//     }));
//   }, []);

//   const updateAdjustments = useCallback((newAdjustments) => {
//     setState(prev => ({
//       ...prev,
//       adjustments: { ...prev.adjustments, ...newAdjustments }
//     }));
//   }, []);

//   const resetAdjustments = useCallback(() => {
//     setState(prev => ({
//       ...prev,
//       adjustments: { ...defaultAdjustments }
//     }));
//   }, []);

//   const setLoading = useCallback((isLoading) => {
//     setState(prev => ({ ...prev, isLoading }));
//   }, []);

// const setIsAIEnhanced = useCallback((isEnhanced) => {
//   setState(prev => ({ ...prev, isAIEnhanced: isEnhanced }));
// }, []);

//   const updateResult = useCallback((result) => {
//     setState(prev => ({
//       ...prev,
//       editedImage: result.image,
//       isLoading: false
//     }));
//   }, []);

//   const setFormat = useCallback((format) => {
//     setState(prev => ({ ...prev, format }));
//   }, []);

//   return {
//     state,
//     setImage,
//     setBaseImage,
//     setTransparentImage,
//     updateAdjustments,
//     resetAdjustments,
//     setLoading,
//     updateResult,
//     setFormat,
//     setIsAIEnhanced // Export the setter
//   };
// };



// hooks/useImageEditor.js - Enhanced reset functionality with AI enhancement
'use client';

import { useState, useCallback } from 'react';

const initialAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  exposure: 0,
  blur: 0,
  hue: 0,
  opacity: 100,
  zoom: 0,
  temperature: 0,
  vignette: 0
  
};

const initialState = {
  originalImage: null,
  baseImage: null,
  editedImage: null,
  transparentImage: null,
  adjustments: initialAdjustments,
  backgroundRemoved: false,
  currentBackground: null,
  format: 'png',
  isLoading: false,
  isAIEnhanced: false, // Keep the AI enhancement state
  // Store original state for proper reset
  originalState: null
};

export const useImageEditor = () => {
  const [state, setState] = useState(initialState);

  const setImage = useCallback((imageData) => {
    setState(prev => ({
      ...initialState,
      originalImage: imageData,
      baseImage: imageData,
      editedImage: imageData,
      isAIEnhanced: false, // Reset AI enhancement when setting new image
      // Store the original state for complete reset
      originalState: {
        image: imageData,
        adjustments: { ...initialAdjustments },
        backgroundRemoved: false,
        currentBackground: null,
        isAIEnhanced: false
      }
    }));
  }, []);

  const setBaseImage = useCallback((imageData) => {
    setState(prev => ({
      ...prev,
      baseImage: imageData,
      editedImage: imageData,
    }));
  }, []);

  const setTransparentImage = useCallback((imageData) => {
    setState(prev => ({
      ...prev,
      transparentImage: imageData,
      baseImage: imageData,
      editedImage: imageData,
      backgroundRemoved: true,
    }));
  }, []);

  const updateAdjustments = useCallback((newAdjustments) => {
    setState(prev => ({
      ...prev,
      adjustments: { ...prev.adjustments, ...newAdjustments },
    }));
  }, []);

  // Enhanced reset function
  const resetAdjustments = useCallback(() => {
    setState(prev => ({
      ...prev,
      adjustments: { ...initialAdjustments },
      backgroundRemoved: false,
      currentBackground: null,
      isAIEnhanced: false, // Reset AI enhancement
      // Reset to original image or transparent image if available
      baseImage: prev.transparentImage || prev.originalImage,
      editedImage: prev.transparentImage || prev.originalImage,
    }));
  }, []);

  // Complete reset to original uploaded image
  const resetAll = useCallback(() => {
    setState(prev => ({
      ...initialState,
      originalImage: prev.originalImage,
      baseImage: prev.originalImage,
      editedImage: prev.originalImage,
      originalState: prev.originalState,
    }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setIsAIEnhanced = useCallback((isEnhanced) => {
    setState(prev => ({ ...prev, isAIEnhanced: isEnhanced }));
  }, []);

  const updateResult = useCallback((result) => {
    if (result.success && result.image) {
      setState(prev => ({ 
        ...prev, 
        editedImage: result.image,
        isLoading: false 
      }));
    }
  }, []);

  const setFormat = useCallback((format) => {
    setState(prev => ({ ...prev, format }));
  }, []);

  return {
    state,
    setImage,
    setBaseImage,
    setTransparentImage,
    updateAdjustments,
    resetAdjustments,
    resetAll, // Add complete reset function
    setLoading,
    setIsAIEnhanced, // Keep the setter
    updateResult,
    setFormat,
  };
};



