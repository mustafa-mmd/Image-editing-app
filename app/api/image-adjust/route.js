// app/api/image-adjust/route.js
// import sharp from 'sharp';

// export async function POST(request) {
//   try {
//     const { image, adjustments } = await request.json();
    
//     // Validate inputs
//     if (!image) {
//       return Response.json(
//         { success: false, error: 'No image provided' },
//         { status: 400 }
//       );
//     }
    
//     // Set default adjustments if not provided
//     const adj = adjustments || {};
    
//     // Extract base64 data from the data URL
//     const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
//     const imageBuffer = Buffer.from(base64Data, 'base64');
    
//     // Process image with Sharp
//     let processedImage = sharp(imageBuffer);
//     const metadata = await processedImage.metadata();
    
//     console.log('Applying adjustments:', adj);

//     // 1. FIRST apply exposure (this affects the base image before contrast)
//     if (adj.exposure !== undefined && adj.exposure !== 0) {
//       const exposureGain = 1 + (adj.exposure / 100);
//       const exposureBias = -(128 * (exposureGain - 1)) * 0.5;
      
//       processedImage = processedImage.linear(exposureGain, exposureBias);
//       console.log('Applied exposure:', adj.exposure, 'Gain:', exposureGain, 'Bias:', exposureBias);
//     }

//     // 2. THEN apply brightness, contrast, saturation (contrast works on exposed image)
//     if (adj.brightness !== undefined || adj.contrast !== undefined || adj.saturation !== undefined) {
//       processedImage = processedImage.modulate({
//         brightness: adj.brightness !== undefined ? 1 + (adj.brightness / 100) : 1,
//         contrast: adj.contrast !== undefined ? 1 + (adj.contrast / 100) : 1,
//         saturation: adj.saturation !== undefined ? 1 + (adj.saturation / 100) : 1,
//       });
//       console.log('Applied modulate - brightness:', adj.brightness, 'contrast:', adj.contrast, 'saturation:', adj.saturation);
//     }

//     // 3. THEN apply other adjustments
//     if (adj.sharpness !== undefined && adj.sharpness !== 0) {
//       const sharpnessIntensity = Math.abs(adj.sharpness) / 100;
      
//       processedImage = processedImage.sharpen({
//         sigma: 0.5 + (sharpnessIntensity * 2),
//         m1: 0,
//         m2: 2 + (sharpnessIntensity * 8),
//         x1: 1 + sharpnessIntensity
//       });
//       console.log('Applied sharpness:', adj.sharpness, 'Intensity:', sharpnessIntensity);
//     }

//     // Apply blur
//     if (adj.blur !== undefined && adj.blur > 0) {
//       processedImage = processedImage.blur(adj.blur);
//       console.log('Applied blur:', adj.blur);
//     }

//     // Apply hue rotation
//     if (adj.hue !== undefined && adj.hue !== 0) {
//       const hueRadians = (adj.hue * Math.PI) / 180;
//       const cosVal = Math.cos(hueRadians);
//       const sinVal = Math.sin(hueRadians);
      
//       processedImage = processedImage.recomb([
//         [
//           cosVal + (0.143 * sinVal),
//           -sinVal + (0.143 * cosVal),
//           0.143 * (1 - cosVal) + (0.140 * sinVal)
//         ],
//         [
//           sinVal - (0.283 * cosVal),
//           cosVal + (0.283 * sinVal),
//           0.283 * (1 - cosVal) - (0.283 * sinVal)
//         ],
//         [
//           -0.283 * sinVal,
//           0.283 * (1 - cosVal),
//           cosVal + (0.283 * sinVal)
//         ]
//       ]);
//       console.log('Applied hue rotation:', adj.hue);
//     }

//     // Apply opacity
//     if (adj.opacity !== undefined && adj.opacity !== 100) {
//       const opacity = Math.max(0, Math.min(1, adj.opacity / 100));
      
//       if (opacity < 1) {
//         // Get image data with alpha channel
//         const { data, info } = await processedImage
//           .ensureAlpha() // Ensure alpha channel exists
//           .raw()
//           .toBuffer({ resolveWithObject: true });
        
//         // Modify alpha channel for opacity
//         const newData = Buffer.alloc(data.length);
//         for (let i = 0; i < data.length; i += info.channels) {
//           // Copy RGB channels
//           newData[i] = data[i];         // R
//           newData[i + 1] = data[i + 1]; // G
//           newData[i + 2] = data[i + 2]; // B
//           // Apply opacity to alpha channel
//           newData[i + 3] = info.channels === 4 ? Math.round(data[i + 3] * opacity) : Math.round(255 * opacity);
//         }
        
//         processedImage = sharp(newData, {
//           raw: {
//             width: info.width,
//             height: info.height,
//             channels: info.channels
//           }
//         });
//       }
//       console.log('Applied opacity:', adj.opacity, 'Value:', opacity);
//     }

//     // Apply temperature
//     if (adj.temperature !== undefined && adj.temperature !== 0) {
//       const tempAdjust = adj.temperature / 100;
      
//       if (tempAdjust > 0) {
//         // Warmer (more red/orange)
//         processedImage = processedImage.recomb([
//           [1.0 + (tempAdjust * 0.2), 0.0, 0.0],
//           [0.0, 1.0 - (tempAdjust * 0.1), 0.0],
//           [0.0, 0.0, 1.0 - (tempAdjust * 0.2)]
//         ]);
//       } else {
//         // Cooler (more blue)
//         processedImage = processedImage.recomb([
//           [1.0 + (tempAdjust * 0.1), 0.0, 0.0],
//           [0.0, 1.0 + (tempAdjust * 0.1), 0.0],
//           [0.0 - (tempAdjust * 0.2), 0.0, 1.0]
//         ]);
//       }
//       console.log('Applied temperature:', adj.temperature);
//     }

//     // Apply zoom
//     if (adj.zoom !== undefined && adj.zoom !== 0 && metadata.width && metadata.height) {
//       const zoomFactor = 1 + (Math.abs(adj.zoom) / 100);
      
//       if (adj.zoom > 0) {
//         // Zoom in: crop center
//         const newWidth = Math.floor(metadata.width / zoomFactor);
//         const newHeight = Math.floor(metadata.height / zoomFactor);
//         const left = Math.floor((metadata.width - newWidth) / 2);
//         const top = Math.floor((metadata.height - newHeight) / 2);
        
//         processedImage = processedImage
//           .extract({ left, top, width: newWidth, height: newHeight })
//           .resize(metadata.width, metadata.height, {
//             fit: 'fill',
//             kernel: sharp.kernel.lanczos3
//           });
//       }
//       console.log('Applied zoom:', adj.zoom);
//     }

//     // Apply vignette effect
//     if (adj.vignette !== undefined && adj.vignette > 0) {
//       const vignetteStrength = adj.vignette / 200;
      
//       // Create vignette using composite operation
//       const vignetteImage = await sharp({
//         create: {
//           width: metadata.width,
//           height: metadata.height,
//           channels: 4,
//           background: { r: 0, g: 0, b: 0, alpha: 0 }
//         }
//       })
//       .composite([{
//         input: Buffer.from(`
//           <svg width="${metadata.width}" height="${metadata.height}">
//             <radialGradient id="vignette-grad" cx="50%" cy="50%" r="75%">
//               <stop offset="0%" stop-color="white" stop-opacity="0"/>
//               <stop offset="70%" stop-color="white" stop-opacity="0"/>
//               <stop offset="100%" stop-color="black" stop-opacity="${vignetteStrength}"/>
//             </radialGradient>
//             <rect width="100%" height="100%" fill="url(#vignette-grad)"/>
//           </svg>
//         `),
//         blend: 'over'
//       }])
//       .png()
//       .toBuffer();
      
//       processedImage = processedImage.composite([{
//         input: vignetteImage,
//         blend: 'multiply'
//       }]);
//       console.log('Applied vignette:', adj.vignette);
//     }

//     // Convert to high quality PNG for download
//     const processedBuffer = await processedImage.png({
//       quality: 95,
//       compressionLevel: 9,
//       progressive: true
//     }).toBuffer();
    
//     const processedBase64 = processedBuffer.toString('base64');
//     const processedImageData = `data:image/png;base64,${processedBase64}`;

//     console.log('Image processing completed successfully');
    
//     return Response.json({
//       success: true,
//       image: processedImageData,
//     });
//   } catch (error) {
//     console.error('Image adjustment error:', error);
//     return Response.json(
//       { 
//         success: false, 
//         error: 'Image adjustment failed: ' + error.message 
//       },
//       { status: 500 }
//     );
//   }
// }



// app/api/image-adjust/route.js
import sharp from 'sharp';

export async function POST(request) {
  try {
    const { image, adjustments } = await request.json();
    
    // Validate inputs
    if (!image) {
      return Response.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Set default adjustments if not provided
    const adj = adjustments || {};
    
    // Extract base64 data from the data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Process image with Sharp
    let processedImage = sharp(imageBuffer);
    const metadata = await processedImage.metadata();
    
    console.log('Applying adjustments:', adj);

    // 1. FIRST apply exposure
    if (adj.exposure !== undefined && adj.exposure !== 0) {
      const exposureGain = 1 + (adj.exposure / 100);
      const exposureBias = -(128 * (exposureGain - 1)) * 0.5;
      
      processedImage = processedImage.linear(exposureGain, exposureBias);
      console.log('Applied exposure:', adj.exposure);
    }

    // 2. APPLY CONTRAST - MATCH CSS FILTER BEHAVIOR
    if (adj.contrast !== undefined && adj.contrast !== 0) {
      console.log('Applying contrast:', adj.contrast);
      
      // Match CSS filter behavior: contrast(100% + adjustment)
      // CSS: contrast(150%) = Sharp: contrast(1.5)
      const cssContrastValue = 100 + adj.contrast;
      const sharpContrastValue = cssContrastValue / 100;
      
      processedImage = processedImage.linear(sharpContrastValue, -(128 * (sharpContrastValue - 1)) / 2);
      console.log('CSS contrast:', cssContrastValue + '%', 'Sharp contrast:', sharpContrastValue);
    }

    // 3. THEN apply brightness and saturation
    if (adj.brightness !== undefined || adj.saturation !== undefined) {
      // Match CSS filter behavior: brightness(100% + adjustment)
      // CSS: brightness(150%) = Sharp: brightness(1.5)
      const brightnessValue = adj.brightness !== undefined ? (100 + adj.brightness) / 100 : 1;
      const saturationValue = adj.saturation !== undefined ? (100 + adj.saturation) / 100 : 1;
      
      processedImage = processedImage.modulate({
        brightness: brightnessValue,
        saturation: saturationValue,
      });
      console.log('Applied brightness:', brightnessValue, 'saturation:', saturationValue);
    }

    // 4. THEN apply other adjustments
    if (adj.sharpness !== undefined && adj.sharpness !== 0) {
      const sharpnessIntensity = Math.abs(adj.sharpness) / 100;
      
      processedImage = processedImage.sharpen({
        sigma: 0.5 + (sharpnessIntensity * 2),
        m1: 0,
        m2: 2 + (sharpnessIntensity * 8),
        x1: 1 + sharpnessIntensity
      });
      console.log('Applied sharpness:', adj.sharpness);
    }

    // Apply blur
    if (adj.blur !== undefined && adj.blur > 0) {
      processedImage = processedImage.blur(adj.blur);
      console.log('Applied blur:', adj.blur);
    }

    // Apply hue rotation
    if (adj.hue !== undefined && adj.hue !== 0) {
      const hueRadians = (adj.hue * Math.PI) / 180;
      const cosVal = Math.cos(hueRadians);
      const sinVal = Math.sin(hueRadians);
      
      processedImage = processedImage.recomb([
        [
          cosVal + (0.143 * sinVal),
          -sinVal + (0.143 * cosVal),
          0.143 * (1 - cosVal) + (0.140 * sinVal)
        ],
        [
          sinVal - (0.283 * cosVal),
          cosVal + (0.283 * sinVal),
          0.283 * (1 - cosVal) - (0.283 * sinVal)
        ],
        [
          -0.283 * sinVal,
          -0.283 * (1 - cosVal),
          cosVal + (0.283 * sinVal)
        ]
      ]);
      console.log('Applied hue rotation:', adj.hue);
    }

    // Apply opacity
    if (adj.opacity !== undefined && adj.opacity !== 100) {
      const opacity = Math.max(0, Math.min(1, adj.opacity / 100));
      
      if (opacity < 1) {
        // Get image data with alpha channel
        const { data, info } = await processedImage
          .ensureAlpha() // Ensure alpha channel exists
          .raw()
          .toBuffer({ resolveWithObject: true });
        
        // Modify alpha channel for opacity
        const newData = Buffer.alloc(data.length);
        for (let i = 0; i < data.length; i += info.channels) {
          // Copy RGB channels
          newData[i] = data[i];         // R
          newData[i + 1] = data[i + 1]; // G
          newData[i + 2] = data[i + 2]; // B
          // Apply opacity to alpha channel
          newData[i + 3] = info.channels === 4 ? Math.round(data[i + 3] * opacity) : Math.round(255 * opacity);
        }
        
        processedImage = sharp(newData, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
          }
        });
      }
      console.log('Applied opacity:', adj.opacity);
    }

    // Apply temperature
    if (adj.temperature !== undefined && adj.temperature !== 0) {
      const tempAdjust = adj.temperature / 100;
      
      if (tempAdjust > 0) {
        // Warmer (more red/orange)
        processedImage = processedImage.recomb([
          [1.0 + (tempAdjust * 0.2), 0.0, 0.0],
          [0.0, 1.0 - (tempAdjust * 0.1), 0.0],
          [0.0, 0.0, 1.0 - (tempAdjust * 0.2)]
        ]);
      } else {
        // Cooler (more blue)
        processedImage = processedImage.recomb([
          [1.0 + (tempAdjust * 0.1), 0.0, 0.0],
          [0.0, 1.0 + (tempAdjust * 0.1), 0.0],
          [0.0 - (tempAdjust * 0.2), 0.0, 1.0]
        ]);
      }
      console.log('Applied temperature:', adj.temperature);
    }

    // Apply zoom
    if (adj.zoom !== undefined && adj.zoom !== 0 && metadata.width && metadata.height) {
      const zoomFactor = 1 + (Math.abs(adj.zoom) / 100);
      
      if (adj.zoom > 0) {
        // Zoom in: crop center
        const newWidth = Math.floor(metadata.width / zoomFactor);
        const newHeight = Math.floor(metadata.height / zoomFactor);
        const left = Math.floor((metadata.width - newWidth) / 2);
        const top = Math.floor((metadata.height - newHeight) / 2);
        
        processedImage = processedImage
          .extract({ left, top, width: newWidth, height: newHeight })
          .resize(metadata.width, metadata.height, {
            fit: 'fill',
            kernel: sharp.kernel.lanczos3
          });
      }
      console.log('Applied zoom:', adj.zoom);
    }

    // Apply vignette effect
    if (adj.vignette !== undefined && adj.vignette > 0) {
      const vignetteStrength = adj.vignette / 200;
      
      // Create vignette using composite operation
      const vignetteImage = await sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([{
        input: Buffer.from(`
          <svg width="${metadata.width}" height="${metadata.height}">
            <radialGradient id="vignette-grad" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stop-color="white" stop-opacity="0"/>
              <stop offset="70%" stop-color="white" stop-opacity="0"/>
              <stop offset="100%" stop-color="black" stop-opacity="${vignetteStrength}"/>
            </radialGradient>
            <rect width="100%" height="100%" fill="url(#vignette-grad)"/>
          </svg>
        `),
        blend: 'over'
      }])
      .png()
      .toBuffer();
      
      processedImage = processedImage.composite([{
        input: vignetteImage,
        blend: 'multiply'
      }]);
      console.log('Applied vignette:', adj.vignette);
    }

    // Convert to high quality PNG for download
    const processedBuffer = await processedImage.png({
      quality: 95,
      compressionLevel: 9,
      progressive: true
    }).toBuffer();
    
    const processedBase64 = processedBuffer.toString('base64');
    const processedImageData = `data:image/png;base64,${processedBase64}`;

    console.log('Image processing completed successfully');
    
    return Response.json({
      success: true,
      image: processedImageData,
    });
  } catch (error) {
    console.error('Image adjustment error:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Image adjustment failed: ' + error.message 
      },
      { status: 500 }
    );
  }
}
