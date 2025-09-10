// hooks/useFileDrop.js
'use client';

import { useState, useCallback } from 'react';

export const useFileDrop = (onFileSelect) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  };
};