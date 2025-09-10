// hooks/useImageEditor.js
'use client';

import { useState, useCallback } from 'react';

// Default adjustments object
const defaultAdjustments = {
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

export const useImageEditor = () => {
  const [state, setState] = useState({
    originalImage: null,
    baseImage: null,
    transparentImage: null,
    editedImage: null,
    adjustments: { ...defaultAdjustments },
    format: 'png',
    isLoading: false,
    isAIEnhanced: false // Add this line
  });

  const setImage = useCallback((image) => {
    setState(prev => ({
      ...prev,
      originalImage: image,
      baseImage: image,
      editedImage: image
    }));
  }, []);

  const setBaseImage = useCallback((image) => {
    setState(prev => ({
      ...prev,
      baseImage: image,
      editedImage: image
    }));
  }, []);

  const setTransparentImage = useCallback((image) => {
    setState(prev => ({
      ...prev,
      transparentImage: image
    }));
  }, []);

  const updateAdjustments = useCallback((newAdjustments) => {
    setState(prev => ({
      ...prev,
      adjustments: { ...prev.adjustments, ...newAdjustments }
    }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setState(prev => ({
      ...prev,
      adjustments: { ...defaultAdjustments }
    }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

const setIsAIEnhanced = useCallback((isEnhanced) => {
  setState(prev => ({ ...prev, isAIEnhanced: isEnhanced }));
}, []);

  const updateResult = useCallback((result) => {
    setState(prev => ({
      ...prev,
      editedImage: result.image,
      isLoading: false
    }));
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
    setLoading,
    updateResult,
    setFormat,
    setIsAIEnhanced // Export the setter
  };
};