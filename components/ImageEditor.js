
// components/ImageEditor.js - Fixed version
'use client';
  

import { useState, useCallback, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import AdjustmentsPanel from './AdjustmentsPanel';
import Toolbar from './Toolbar';
import PreviewCanvas from './PreviewCanvas';
import { useImageEditor } from '@/hooks/useImageEditor';
import { 
  processBackgroundRemove, 
  processImageAdjustments, 
  convertImageFormat,
  processBackgroundReplace,
  processAIEnhance
} from '@/lib/api';

export default function ImageEditor() {
  const { 
    state, 
    setImage, 
    setTransparentImage,
    setBaseImage,
    updateAdjustments, 
    resetAdjustments, 
    setLoading, 
    updateResult, 
    setFormat 
  } = useImageEditor();
  
  const [currentImage, setCurrentImage] = useState(state.editedImage);

  // Update current image when state changes
  useEffect(() => {
    setCurrentImage(state.editedImage);
  }, [state.editedImage]);

  const handleImageSelect = useCallback(async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result;
      setImage(imageData);
      setBaseImage(imageData);
      setCurrentImage(imageData);
    };
    reader.readAsDataURL(file);
  }, [setImage, setBaseImage]);

  const handleBackgroundRemove = useCallback(async () => {
    if (!currentImage) return;
    
    setLoading(true);
    try {
      const result = await processBackgroundRemove(currentImage);
      
      if (result.success) {
        setTransparentImage(result.image);
        setBaseImage(result.image);
        setCurrentImage(result.image);
        updateResult(result);
      } else {
        console.error('Background removal failed:', result.error);
        alert(`Background removal failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      alert(`Background removal failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentImage, setLoading, setTransparentImage, setBaseImage, updateResult]);

  const handleBackgroundReplace = useCallback(async (color) => {
    const baseImage = state.transparentImage || state.baseImage;
    
    if (!baseImage) return;
    
    setLoading(true);
    try {
      const result = await processBackgroundReplace(baseImage, color);
      
      if (result.success) {
        setBaseImage(result.image);
        setCurrentImage(result.image);
        updateResult(result);
      }
    } catch (error) {
      console.error('Background replacement failed:', error);
    } finally {
      setLoading(false);
    }
  }, [state.transparentImage, state.baseImage, setLoading, updateResult, setBaseImage]);

  const handleAdjustmentsChange = useCallback((newAdjustments) => {
    updateAdjustments(newAdjustments);
  }, [updateAdjustments]);

  //  handleDownload
const handleDownload = useCallback(async () => {
  if (!state.baseImage) return;
  
  setLoading(true);
  try {
     

    // Apply ALL current adjustments to base image
    const adjustedResult = await processImageAdjustments(state.baseImage, state.adjustments);
    
    if (adjustedResult.success) {
      const formatResult = await convertImageFormat(adjustedResult.image, state.format);
      
      if (formatResult.success && formatResult.image) {
        const link = document.createElement('a');
        link.href = formatResult.image;
        link.download = `ai-enhanced-photo.${state.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  } finally {
    setLoading(false);
  }
}, [state.baseImage, state.adjustments, state.format, setLoading]);



const handleAIEnhance = useCallback(async () => {
  if (!state.baseImage) return;
  
  setLoading(true);
  try {
    const result = await processAIEnhance(state.baseImage);
    
    if (result.success) {
      setBaseImage(result.image);
      setCurrentImage(result.image);
      updateResult(result);
      
      // REMOVED the automatic adjustments - AI enhancement should stand alone
      console.log('AI enhancement successful. Source:', result.source);
    } else {
      console.error('AI enhancement failed:', result.error);
      alert(`AI enhancement failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('AI enhancement failed:', error);
    alert(`AI enhancement failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}, [state.baseImage, setLoading, updateResult, setBaseImage]);

  const handleReset = useCallback(() => {
    resetAdjustments();
    // Reset to base image (either original or transparent background)
    setCurrentImage(state.transparentImage || state.originalImage);
  }, [resetAdjustments, state.transparentImage, state.originalImage]);

  const handleCompleteReset = useCallback(() => {
    // This would reset everything including background removal
    setCurrentImage(state.originalImage);
    setBaseImage(state.originalImage);
    setTransparentImage(null);
    resetAdjustments();
  }, [state.originalImage, resetAdjustments, setBaseImage, setTransparentImage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Photo Editor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional photo editing with AI-powered background removal, 
            real-time adjustments, and format conversion.
          </p>
        </div>

        {!state.originalImage ? (
          <ImageUpload 
            onImageSelect={handleImageSelect} 
            isLoading={state.isLoading}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <PreviewCanvas
                  imageData={currentImage}
                  adjustments={state.adjustments}
                  isLoading={state.isLoading}
                />
              </div>
              
              <div className="mt-6">
                <Toolbar
                  onDownload={handleDownload}
                  onReset={handleReset}
                  onApplyAI={handleAIEnhance}
                  isLoading={state.isLoading}
                  hasImage={!!state.originalImage}
                />
              </div>
            </div>

            {/* Adjustments Panel */}
            <div className="lg:col-span-1">
              <AdjustmentsPanel
                adjustments={state.adjustments}
                onAdjustmentsChange={handleAdjustmentsChange}
                onBackgroundRemove={handleBackgroundRemove}
                onBackgroundReplace={handleBackgroundReplace}
                onFormatChange={setFormat}
                isLoading={state.isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}