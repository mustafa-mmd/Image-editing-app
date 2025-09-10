 // components/ImageEditor.js
// 'use client';

// import { useState, useCallback, useEffect } from 'react';
// import ImageUpload from './ImageUpload';
// import AdjustmentsPanel from './AdjustmentsPanel';
// import Toolbar from './Toolbar';
// import PreviewCanvas from './PreviewCanvas';
// import { useImageEditor } from '@/hooks/useImageEditor';
// import { 
//   processBackgroundRemove, 
//   processImageAdjustments, 
//   convertImageFormat,
//   processBackgroundReplace 
// } from '@/lib/api';

// export default function ImageEditor() {
//   const { 
//     state, 
//     setImage, 
//     setTransparentImage, // Add this import
//     updateAdjustments, 
//     resetAdjustments, 
//     setLoading, 
//     updateResult, 
//     setFormat 
//   } = useImageEditor();
  
//   const [currentImage, setCurrentImage] = useState(state.editedImage);

//   // Update current image when state changes
//   useEffect(() => {
//     setCurrentImage(state.editedImage);
//   }, [state.editedImage]);

//   const handleImageSelect = useCallback(async (file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setImage(e.target?.result);
//       setCurrentImage(e.target?.result);
//     };
//     reader.readAsDataURL(file);
//   }, [setImage]);

//   // FIXED: handleBackgroundRemove function
//   const handleBackgroundRemove = useCallback(async () => {
//     if (!state.originalImage) return;
    
//     setLoading(true);
//     try {
//       const result = await processBackgroundRemove(state.originalImage);
//       if (result.success) {
//         // Store the transparent image for future background changes
//         setTransparentImage(result.image);
//         setCurrentImage(result.image);
//         updateResult(result);
//       }
//     } catch (error) {
//       console.error('Background removal failed:', error);
//       setLoading(false);
//     }
//   }, [state.originalImage, setLoading, setTransparentImage, updateResult]);

//   // FIXED: handleBackgroundReplace function
//   const handleBackgroundReplace = useCallback(async (color) => {
//     // Always use the transparent image as the base for background replacement
//     const baseImage = state.transparentImage || state.originalImage;
    
//     if (!baseImage) return;
    
//     setLoading(true);
//     try {
//       console.log('Replacing background with color:', color);
      
//       // Always apply background color to the base transparent/original image
//       const result = await processBackgroundReplace(baseImage, color);
      
//       if (result.success) {
//         console.log('Background replacement successful');
//         setCurrentImage(result.image);
//         updateResult(result);
//       } else {
//         console.error('Background replacement failed:', result.error);
//       }
//     } catch (error) {
//       console.error('Background replacement failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [state.transparentImage, state.originalImage, setLoading, updateResult]);

//   const handleDownload = useCallback(async () => {
//     if (!currentImage) return;
    
//     try {
//       // First apply adjustments to the image
//       const adjustedResult = await processImageAdjustments(currentImage, state.adjustments);
      
//       if (adjustedResult.success) {
//         // Then convert to the desired format
//         const result = await convertImageFormat(adjustedResult.image, state.format);
//         if (result.success && result.image) {
//           const link = document.createElement('a');
//           link.href = result.image;
//           link.download = `edited-image.${state.format}`;
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         }
//       }
//     } catch (error) {
//       console.error('Download failed:', error);
//     }
//   }, [currentImage, state.adjustments, state.format]);

//   const handleAdjustmentsChange = useCallback(async (newAdjustments) => {
//     if (!state.originalImage) return;
    
//     // Update adjustments in state
//     updateAdjustments(newAdjustments);
    
//     // Apply adjustments to image
//     setLoading(true);
//     try {
//       const result = await processImageAdjustments(state.originalImage, {
//         ...state.adjustments,
//         ...newAdjustments
//       });
      
//       if (result.success) {
//         updateResult(result);
//         setCurrentImage(result.image);
//       }
//     } catch (error) {
//       console.error('Image adjustment failed:', error);
//       setLoading(false);
//     }
//   }, [state.originalImage, state.adjustments, updateAdjustments, setLoading, updateResult]);

//   const handleAIEnhance = useCallback(async () => {
//     if (!state.originalImage) return;
    
//     setLoading(true);
//     try {
//       // Apply optimal adjustments for AI enhancement
//       const enhancements = {
//         brightness: 10,
//         contrast: 15,
//         saturation: 20,
//         sharpness: 25,
//         exposure: 5,
//       };
      
//       const result = await processImageAdjustments(state.originalImage, enhancements);
//       if (result.success) {
//         updateAdjustments(enhancements);
//         updateResult(result);
//         setCurrentImage(result.image);
//       }
//     } catch (error) {
//       console.error('AI enhancement failed:', error);
//       setLoading(false);
//     }
//   }, [state.originalImage, setLoading, updateAdjustments, updateResult]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             AI Photo Editor
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Professional photo editing with AI-powered background removal, 
//             real-time adjustments, and format conversion.
//           </p>
//         </div>

//         {!state.originalImage ? (
//           <ImageUpload 
//             onImageSelect={handleImageSelect} 
//             isLoading={state.isLoading}
//           />
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Preview Section */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
//                 <PreviewCanvas
//                   imageData={currentImage}
//                   adjustments={state.adjustments}
//                   isLoading={state.isLoading}
//                 />
//               </div>
              
//               <div className="mt-6">
//                 <Toolbar
//                   onDownload={handleDownload}
//                   onReset={resetAdjustments}
//                   onApplyAI={handleAIEnhance}
//                   isLoading={state.isLoading}
//                   hasImage={!!state.originalImage}
//                 />
//               </div>
//             </div>

//             {/* Adjustments Panel */}
//             <div className="lg:col-span-1">
//               <AdjustmentsPanel
//                 adjustments={state.adjustments}
//                 onAdjustmentsChange={handleAdjustmentsChange}
//                 onBackgroundRemove={handleBackgroundRemove}
//                 onBackgroundReplace={handleBackgroundReplace}
//                 onFormatChange={setFormat}
//                 isLoading={state.isLoading}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// components/ImageEditor.js
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
  applyAdjustmentsClientSide
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
      
      // Check if the API call was successful
      if (result.success) {
        // Store the transparent image for future background changes
        setTransparentImage(result.image);
        setBaseImage(result.image);
        setCurrentImage(result.image);
        updateResult(result);
      } else {
        // Handle API error response
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

  const handleAdjustmentsChange = useCallback(async (newAdjustments) => {
    updateAdjustments(newAdjustments);
  }, [updateAdjustments]);

  const handleApplyAdjustments = useCallback(async () => {
    if (!state.baseImage) return;
    
    setLoading(true);
    try {
      // Try API first
      const result = await processImageAdjustments(state.baseImage, state.adjustments);
      
      if (result.success) {
        setBaseImage(result.image);
        setCurrentImage(result.image);
        updateResult(result);
      } else {
        // Fallback to client-side processing
        console.warn('API adjustment failed, using client-side fallback:', result.error);
        
        const img = new Image();
        img.onload = async () => {
          try {
            const adjustedImage = await applyAdjustmentsClientSide(img, state.adjustments);
            setBaseImage(adjustedImage);
            setCurrentImage(adjustedImage);
            updateResult({ success: true, image: adjustedImage });
          } catch (error) {
            console.error('Client-side adjustment failed:', error);
            alert('Failed to apply adjustments to image');
          } finally {
            setLoading(false);
          }
        };
        
        img.onerror = () => {
          console.error('Failed to load image for client-side processing');
          setLoading(false);
        };
        
        img.src = state.baseImage;
        return; // Don't setLoading(false) here as it's handled in the onload/onerror
      }
    } catch (error) {
      console.error('Applying adjustments failed:', error);
      alert('Failed to apply adjustments: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [state.baseImage, state.adjustments, setLoading, setBaseImage, updateResult]);

  const handleDownload = useCallback(async () => {
    if (!state.baseImage) return;
    
    setLoading(true);
    try {
      // First try to use the API for all adjustments
      const result = await processImageAdjustments(state.baseImage, state.adjustments);
      
      if (result.success) {
        // Then convert to the desired format
        const formatResult = await convertImageFormat(result.image, state.format);
        if (formatResult.success && formatResult.image) {
          const link = document.createElement('a');
          link.href = formatResult.image;
          link.download = `edited-image.${state.format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Fallback to client-side processing if API fails
        console.warn('API adjustment failed, using client-side fallback:', result.error);
        
        // Create an image element to process adjustments client-side
        const img = new Image();
        img.onload = async () => {
          try {
            const adjustedImage = await applyAdjustmentsClientSide(img, state.adjustments);
            
            // Convert to desired format
            const formatResult = await convertImageFormat(adjustedImage, state.format);
            if (formatResult.success && formatResult.image) {
              const link = document.createElement('a');
              link.href = formatResult.image;
              link.download = `edited-image.${state.format}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } catch (error) {
            console.error('Client-side adjustment failed:', error);
            alert('Failed to apply adjustments to image');
          } finally {
            setLoading(false);
          }
        };
        
        img.onerror = () => {
          console.error('Failed to load image for client-side processing');
          setLoading(false);
        };
        
        img.src = state.baseImage;
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [state.baseImage, state.adjustments, state.format, setLoading]);

  const handleAIEnhance = useCallback(async () => {
    if (!state.baseImage) return;
    
    setLoading(true);
    
    // Add a loading message that shows progress
    const loadingMessages = [
      "Analyzing image composition...",
      "Enhancing colors and contrast...",
      "Applying professional sharpening...",
      "Adding final touches..."
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      // This is where you'd update a loading message in your UI
      console.log(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 800);
    
    try {
      // Professional multi-stage enhancement
      const enhancements = {
        brightness: 18,
        contrast: 32,
        saturation: 22,
        sharpness: 38,
        exposure: 7,
        temperature: 6,
        vibrance: 20,
        clarity: 28,
        dehaze: 12,
        vignette: 15
      };
      
      const result = await processImageAdjustments(state.baseImage, enhancements);
      
      if (result.success) {
        clearInterval(messageInterval);
        
        updateAdjustments(enhancements);
        setBaseImage(result.image);
        setCurrentImage(result.image);
        updateResult(result);
        
        // Create a "wow" effect with a success notification
        alert(' AI Professional Enhancement Complete! \nYour image has been transformed with studio-quality adjustments.');
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
      alert('AI enhancement failed. Please try again.');
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  }, [state.baseImage, setLoading, updateAdjustments, setBaseImage, updateResult]);

  const handleReset = useCallback(() => {
    resetAdjustments();
    setCurrentImage(state.baseImage);
  }, [resetAdjustments, state.baseImage]);

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
                  onApplyAdjustments={handleApplyAdjustments}
                  isLoading={state.isLoading}
                  hasImage={!!state.originalImage}
                  isAIEnhanced={state.isAIEnhanced}
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