// components/ImageUpload.js
'use client';

import { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useFileDrop } from '@/hooks/useFileDrop';

export default function ImageUpload({ onImageSelect, isLoading }) {
  const fileInputRef = useRef(null);
  const { isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = 
    useFileDrop(onImageSelect);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ImageIcon className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Processing image...' : 'Upload your photo'}
            </h3>
            <p className="text-sm text-gray-500">
              Drag & drop your image here or click to browse
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Upload className="w-4 h-4" />
            <span>Supports: JPG, PNG, WEBP</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}