// // app/api/image-adjust/route.js
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
    
//     if (!adjustments) {
//       return Response.json(
//         { success: false, error: 'No adjustments provided' },
//         { status: 400 }
//       );
//     }
    
//     // Extract base64 data from the data URL
//     const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
//     const imageBuffer = Buffer.from(base64Data, 'base64');
    
//     // Process image with Sharp
//     let processedImage = sharp(imageBuffer);
    
//     // Apply brightness, contrast, and saturation
//     if (adjustments.brightness !== 0 || adjustments.contrast !== 0 || adjustments.saturation !== 0) {
//       processedImage = processedImage.modulate({
//         brightness: adjustments.brightness !== 0 ? 1 + (adjustments.brightness / 100) : 1,
//         contrast: adjustments.contrast !== 0 ? 1 + (adjustments.contrast / 100) : 1,
//         saturation: adjustments.saturation !== 0 ? 1 + (adjustments.saturation / 100) : 1,
//       });
//     }
    
//     // Apply exposure
//     if (adjustments.exposure !== 0) {
//       const exposure = Math.exp(adjustments.exposure / 100);
//       processedImage = processedImage.linear(exposure, -(128 * exposure) + 128);
//     }
    
//     // Apply sharpness
//     if (adjustments.sharpness !== 0) {
//       const sharpness = adjustments.sharpness / 100;
//       processedImage = processedImage.sharpen({
//         sigma: 1 + sharpness,
//         m1: 0,
//         m2: 5 + (5 * sharpness),
//         x1: 3 + (2 * sharpness),
//       });
//     }
    
//     // Apply blur
//     if (adjustments.blur > 0) {
//       processedImage = processedImage.blur(adjustments.blur);
//     }
    
//     // Apply hue rotation (convert hue to rotation angle)
//     if (adjustments.hue !== 0) {
//       // Hue is typically -180 to 180, convert to rotation
//       const rotationAngle = (adjustments.hue / 180) * Math.PI;
//       processedImage = processedImage.recomb([
//         [Math.cos(rotationAngle), -Math.sin(rotationAngle), 0],
//         [Math.sin(rotationAngle), Math.cos(rotationAngle), 0],
//         [0, 0, 1]
//       ]);
//     }
    
//     // Apply opacity
//     if (adjustments.opacity !== 100) {
//       const opacity = adjustments.opacity / 100;
//       processedImage = processedImage.composite([{
//         input: Buffer.from([255, 255, 255, 255 * opacity]),
//         raw: { width: 1, height: 1, channels: 4 },
//         tile: true,
//         blend: 'dest-in'
//       }]);
//     }
    
//     // Apply temperature (warmth/coolness)
//     if (adjustments.temperature !== 0) {
//       // Temperature adjustment: positive = warmer, negative = cooler
//       const temperature = adjustments.temperature / 100;
      
//       // Adjust red and blue channels based on temperature
//       processedImage = processedImage.recomb([
//         [1 + temperature, 0, 0],          // Increase red for warmth
//         [0, 1, 0],
//         [0, 0, 1 - temperature]           // Decrease blue for warmth
//       ]);
//     }
    
//     // Apply zoom (crop and resize)
//     if (adjustments.zoom !== 0) {
//       const metadata = await processedImage.metadata();
//       const zoomFactor = 1 + (adjustments.zoom / 100);
      
//       if (zoomFactor > 1) {
//         // For zoom in: crop the center and resize to original dimensions
//         const newWidth = Math.floor(metadata.width / zoomFactor);
//         const newHeight = Math.floor(metadata.height / zoomFactor);
//         const left = Math.floor((metadata.width - newWidth) / 2);
//         const top = Math.floor((metadata.height - newHeight) / 2);
        
//         processedImage = processedImage
//           .extract({ left, top, width: newWidth, height: newHeight })
//           .resize(metadata.width, metadata.height);
//       } else {
//         // For zoom out: not typically implemented as negative zoom
//         // You might want to add padding instead
//         console.warn('Negative zoom not implemented');
//       }
//     }
    
//     // Apply vignette effect
//     if (adjustments.vignette !== 0) {
//       const vignetteStrength = adjustments.vignette / 100;
//       const metadata = await processedImage.metadata();
      
//       // Create vignette mask
//       const vignetteBuffer = await sharp({
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
//             <defs>
//               <radialGradient id="grad" cx="50%" cy="50%" r="50%">
//                 <stop offset="0%" stop-color="black" stop-opacity="0"/>
//                 <stop offset="100%" stop-color="black" stop-opacity="${vignetteStrength}"/>
//               </radialGradient>
//             </defs>
//             <rect width="100%" height="100%" fill="url(#grad)"/>
//           </svg>
//         `),
//         blend: 'over'
//       }])
//       .png()
//       .toBuffer();
      
//       // Apply vignette as overlay
//       processedImage = processedImage.composite([{
//         input: vignetteBuffer,
//         blend: 'over'
//       }]);
//     }
    
//     // Convert to buffer and then to base64
//     const processedBuffer = await processedImage.png().toBuffer();
//     const processedBase64 = processedBuffer.toString('base64');
    
//     const processedImageData = `data:image/png;base64,${processedBase64}`;
    
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
    
    if (!adjustments) {
      return Response.json(
        { success: false, error: 'No adjustments provided' },
        { status: 400 }
      );
    }
    
    // Extract base64 data from the data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Process image with Sharp
    let processedImage = sharp(imageBuffer);
    const metadata = await processedImage.metadata();
    
    // Apply brightness, contrast, and saturation
    if (adjustments.brightness !== 0 || adjustments.contrast !== 0 || adjustments.saturation !== 0) {
      processedImage = processedImage.modulate({
        brightness: adjustments.brightness !== 0 ? 1 + (adjustments.brightness / 100) : 1,
        contrast: adjustments.contrast !== 0 ? 1 + (adjustments.contrast / 100) : 1,
        saturation: adjustments.saturation !== 0 ? 1 + (adjustments.saturation / 100) : 1,
      });
    }
    
    // Apply exposure
    if (adjustments.exposure !== 0) {
      const exposure = Math.exp(adjustments.exposure / 100);
      processedImage = processedImage.linear(exposure, -(128 * exposure) + 128);
    }
    
    // Apply sharpness
    if (adjustments.sharpness !== 0) {
      const sharpness = adjustments.sharpness / 100;
      processedImage = processedImage.sharpen({
        sigma: 1 + sharpness,
        m1: 0,
        m2: 5 + (5 * sharpness),
        x1: 3 + (2 * sharpness),
      });
    }
    
    // Advanced sharpening with control over radius (for AI Enhance)
    if (adjustments.sharpness > 0 || adjustments.sharpen_radius) {
      const sharpness = adjustments.sharpness / 100 || 0.5;
      const radius = adjustments.sharpen_radius || 1.0;
      
      processedImage = processedImage.sharpen({
        sigma: radius,
        m1: 0,
        m2: 5 + (5 * sharpness),
        x1: 3 + (2 * sharpness),
      });
    }
    
    // Apply blur
    if (adjustments.blur > 0) {
      processedImage = processedImage.blur(adjustments.blur);
    }
    
    // Apply hue rotation (convert hue to rotation angle)
    if (adjustments.hue !== 0) {
      // Hue is typically -180 to 180, convert to rotation
      const rotationAngle = (adjustments.hue / 180) * Math.PI;
      processedImage = processedImage.recomb([
        [Math.cos(rotationAngle), -Math.sin(rotationAngle), 0],
        [Math.sin(rotationAngle), Math.cos(rotationAngle), 0],
        [0, 0, 1]
      ]);
    }
    
    // Apply opacity
    if (adjustments.opacity !== 100) {
      const opacity = adjustments.opacity / 100;
      processedImage = processedImage.composite([{
        input: Buffer.from([255, 255, 255, 255 * opacity]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }]);
    }
    
    // Apply temperature (warmth/coolness)
    if (adjustments.temperature !== 0) {
      // Temperature adjustment: positive = warmer, negative = cooler
      const temperature = adjustments.temperature / 100;
      
      // Adjust red and blue channels based on temperature
      processedImage = processedImage.recomb([
        [1 + temperature, 0, 0],          // Increase red for warmth
        [0, 1, 0],
        [0, 0, 1 - temperature]           // Decrease blue for warmth
      ]);
    }
    
    // Apply zoom (crop and resize)
    if (adjustments.zoom !== 0) {
      const zoomFactor = 1 + (adjustments.zoom / 100);
      
      if (zoomFactor > 1) {
        // For zoom in: crop the center and resize to original dimensions
        const newWidth = Math.floor(metadata.width / zoomFactor);
        const newHeight = Math.floor(metadata.height / zoomFactor);
        const left = Math.floor((metadata.width - newWidth) / 2);
        const top = Math.floor((metadata.height - newHeight) / 2);
        
        processedImage = processedImage
          .extract({ left, top, width: newWidth, height: newHeight })
          .resize(metadata.width, metadata.height);
      } else {
        // For zoom out: not typically implemented as negative zoom
        // You might want to add padding instead
        console.warn('Negative zoom not implemented');
      }
    }
    
    // Apply vignette effect
    if (adjustments.vignette !== 0) {
      const vignetteStrength = adjustments.vignette / 100;
      
      // Create vignette mask
      const vignetteBuffer = await sharp({
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
            <defs>
              <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="black" stop-opacity="0"/>
                <stop offset="100%" stop-color="black" stop-opacity="${vignetteStrength}"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
          </svg>
        `),
        blend: 'over'
      }])
      .png()
      .toBuffer();
      
      // Apply vignette as overlay
      processedImage = processedImage.composite([{
        input: vignetteBuffer,
        blend: 'over'
      }]);
    }
    
    // Professional AI Enhancements - Add these new adjustment handlers:
    
    // Clarity enhancement (local contrast boost)
    if (adjustments.clarity > 0) {
      const clarity = adjustments.clarity / 100;
      processedImage = processedImage
        .convolve({
          width: 3,
          height: 3,
          kernel: [-clarity, -clarity, -clarity, -clarity, 1 + 8 * clarity, -clarity, -clarity, -clarity, -clarity]
        });
    }
    
    // Dehaze (reduces haze and improves clarity)
    if (adjustments.dehaze > 0) {
      const dehazeAmount = adjustments.dehaze / 100;
      processedImage = processedImage.linear(1.0 + dehazeAmount, -128 * dehazeAmount);
    }
    
    // Vibrance (smart saturation that protects skin tones)
    if (adjustments.vibrance > 0) {
      const vibrance = adjustments.vibrance / 50;
      processedImage = processedImage.modulate({
        saturation: 1 + vibrance
      });
    }
    
    // Convert to buffer and return
    const processedBuffer = await processedImage.png().toBuffer();
    const processedBase64 = processedBuffer.toString('base64');
    
    const processedImageData = `data:image/png;base64,${processedBase64}`;
    
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