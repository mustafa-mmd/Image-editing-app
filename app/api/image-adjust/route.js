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

    // 1. Apply ALL adjustments in the SAME ORDER as CSS filters
    // This is crucial for matching preview and download results

    // BRIGHTNESS - Match CSS: brightness(100 + adj.brightness)% 
    if (adj.brightness !== undefined && adj.brightness !== 0) {
      const brightnessValue = 1 + (adj.brightness / 100);
      processedImage = processedImage.linear(brightnessValue, 0);
      console.log('Applied brightness:', brightnessValue);
    }

    // CONTRAST - Match CSS: contrast(100 + adj.contrast)%
    if (adj.contrast !== undefined && adj.contrast !== 0) {
      const contrastValue = 1 + (adj.contrast / 100);
      processedImage = processedImage.linear(contrastValue, -(128 * (contrastValue - 1)) / 2);
      console.log('Applied contrast:', contrastValue);
    }

    // SATURATION - Match CSS: saturate(100 + adj.saturation)%
    if (adj.saturation !== undefined && adj.saturation !== 0) {
      const saturationValue = 1 + (adj.saturation / 100);
      processedImage = processedImage.modulate({
        saturation: saturationValue
      });
      console.log('Applied saturation:', saturationValue);
    }

    // EXPOSURE - Custom simulation (not a standard CSS filter)
    if (adj.exposure !== undefined && adj.exposure !== 0) {
      const exposureGain = 1 + (adj.exposure / 100);
      const exposureBias = -(128 * (exposureGain - 1)) * 0.5;
      processedImage = processedImage.linear(exposureGain, exposureBias);
      console.log('Applied exposure:', adj.exposure);
    }

    // 2. THEN apply other adjustments that don't have direct CSS equivalents
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

    // Apply blur - Match CSS: blur(adj.blur)px
    if (adj.blur !== undefined && adj.blur > 0) {
      processedImage = processedImage.blur(adj.blur);
      console.log('Applied blur:', adj.blur);
    }

    // Apply hue rotation - Match CSS: hue-rotate(adj.hue)deg
if (adj.hue !== undefined && adj.hue !== 0) {
  // Convert hue rotation to RGB matrix that matches CSS behavior
  const hueRadians = (adj.hue * Math.PI) / 180;
  const cosVal = Math.cos(hueRadians);
  const sinVal = Math.sin(hueRadians);
  const lumR = 0.213;
  const lumG = 0.715;
  const lumB = 0.072;
  
  // FIX: Use a 3x3 matrix (9 values) instead of 3x4 (12 values)
  processedImage = processedImage.recomb([
    [ // Row 1 - 3 values (remove the extra 0)
      lumR + cosVal * (1 - lumR) + sinVal * (-lumR),
      lumG + cosVal * (-lumG) + sinVal * (-lumG),
      lumB + cosVal * (-lumB) + sinVal * (1 - lumB)
    ],
    [ // Row 2 - 3 values (remove the extra 0)
      lumR + cosVal * (-lumR) + sinVal * (0.143),
      lumG + cosVal * (1 - lumG) + sinVal * (0.140),
      lumB + cosVal * (-lumB) + sinVal * (-0.283)
    ],
    [ // Row 3 - 3 values (remove the extra 0)
      lumR + cosVal * (-lumR) + sinVal * (-(1 - lumR)),
      lumG + cosVal * (-lumG) + sinVal * (lumG),
      lumB + cosVal * (1 - lumB) + sinVal * (lumB)
    ]
  ]);
  console.log('Applied hue rotation:', adj.hue);
}

// Apply opacity - Match CSS: opacity(adj.opacity)%
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
  console.log('Applied opacity:', adj.opacity, 'Value:', opacity);
}
    
    // Apply temperature (no direct CSS equivalent)
    if (adj.temperature !== undefined && adj.temperature !== 0) {
      const tempAdjust = adj.temperature / 100;
      if (tempAdjust > 0) {
        processedImage = processedImage.recomb([
          [1.0 + (tempAdjust * 0.2), 0.0, 0.0],
          [0.0, 1.0 - (tempAdjust * 0.1), 0.0],
          [0.0, 0.0, 1.0 - (tempAdjust * 0.2)]
        ]);
      } else {
        processedImage = processedImage.recomb([
          [1.0 + (tempAdjust * 0.1), 0.0, 0.0],
          [0.0, 1.0 + (tempAdjust * 0.1), 0.0],
          [0.0 - (tempAdjust * 0.2), 0.0, 1.0]
        ]);
      }
      console.log('Applied temperature:', adj.temperature);
    }

    // Apply zoom (no direct CSS equivalent)
    if (adj.zoom !== undefined && adj.zoom !== 0 && metadata.width && metadata.height) {
      const zoomFactor = 1 + (Math.abs(adj.zoom) / 100);
      if (adj.zoom > 0) {
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

    // Apply vignette effect (no direct CSS equivalent)
    if (adj.vignette !== undefined && adj.vignette > 0) {
      const vignetteStrength = adj.vignette / 200;
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
