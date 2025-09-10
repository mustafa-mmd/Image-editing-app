// // app/api/background-replace/route.js
// import sharp from 'sharp';

// export async function POST(request) {
//   try {
//     const { image, backgroundColor, originalImage } = await request.json();
    
//     // Use the original transparent image if provided, otherwise use the current image
//     const imageToProcess = originalImage || image;
    
//     if (!imageToProcess || backgroundColor === undefined) {
//       return Response.json(
//         { success: false, error: 'Missing parameters' },
//         { status: 400 }
//       );
//     }
    
//     // Extract base64 data
//     const base64Data = imageToProcess.replace(/^data:image\/\w+;base64,/, '');
//     const imageBuffer = Buffer.from(base64Data, 'base64');
    
//     // Process with sharp
//     const img = sharp(imageBuffer);
//     const metadata = await img.metadata();
    
//     if (backgroundColor === 'transparent') {
//       // For transparent, just return the transparent image
//       const buffer = await img.png().toBuffer();
//       const base64Result = buffer.toString('base64');
//       return Response.json({
//         success: true,
//         image: `data:image/png;base64,${base64Result}`
//       });
//     } else {
//       // Parse the color
//       let bgColor;
//       if (backgroundColor.startsWith('#')) {
//         const hex = backgroundColor.replace('#', '');
//         bgColor = {
//           r: parseInt(hex.substring(0, 2), 16),
//           g: parseInt(hex.substring(2, 4), 16),
//           b: parseInt(hex.substring(4, 6), 16),
//           alpha: 1
//         };
//       } else {
//         const colorMap = {
//           'white': { r: 255, g: 255, b: 255, alpha: 1 },
//           'black': { r: 0, g: 0, b: 0, alpha: 1 },
//           'red': { r: 255, g: 0, b: 0, alpha: 1 },
//           'green': { r: 0, g: 255, b: 0, alpha: 1 },
//           'blue': { r: 0, g: 0, b: 255, alpha: 1 },
//           'yellow': { r: 255, g: 255, b: 0, alpha: 1 },
//           'cyan': { r: 0, g: 255, b: 255, alpha: 1 },
//           'magenta': { r: 255, g: 0, b: 255, alpha: 1 },
//           'gray': { r: 128, g: 128, b: 128, alpha: 1 },
//           'transparent': { r: 0, g: 0, b: 0, alpha: 0 }
//         };
//         bgColor = colorMap[backgroundColor.toLowerCase()] || { r: 0, g: 0, b: 0, alpha: 1 };
//       }
      
//       // Create background with the correct color
//       const coloredBackground = sharp({
//         create: {
//           width: metadata.width,
//           height: metadata.height,
//           channels: 4,
//           background: bgColor
//         }
//       }).png();
      
//       // Composite the transparent image over the colored background
//       const compositeBuffer = await coloredBackground
//         .composite([{ input: imageBuffer, blend: 'over' }])
//         .toBuffer();
      
//       const base64Result = compositeBuffer.toString('base64');
//       return Response.json({
//         success: true,
//         image: `data:image/png;base64,${base64Result}`
//       });
//     }
//   } catch (error) {
//     console.error('Error in background replacement:', error);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }






// app/api/background-replace/route.js
import sharp from 'sharp';

export async function POST(request) {
  try {
    const { image, backgroundColor } = await request.json();
    
    if (!image || backgroundColor === undefined) {
      return Response.json(
        { success: false, error: 'Missing parameters' },
        { status: 400 }
      );
    }
    
    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Process with sharp - preserve any existing adjustments
    const img = sharp(imageBuffer);
    const metadata = await img.metadata();
    
    if (backgroundColor === 'transparent') {
      // For transparent, just return the image as PNG to preserve adjustments and transparency
      const buffer = await img.png().toBuffer();
      const base64Result = buffer.toString('base64');
      return Response.json({
        success: true,
        image: `data:image/png;base64,${base64Result}`
      });
    } else {
      // Parse the color
      let bgColor;
      if (backgroundColor.startsWith('#')) {
        const hex = backgroundColor.replace('#', '');
        bgColor = {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          alpha: 1
        };
      } else {
        const colorMap = {
          'white': { r: 255, g: 255, b: 255, alpha: 1 },
          'black': { r: 0, g: 0, b: 0, alpha: 1 },
          'red': { r: 255, g: 0, b: 0, alpha: 1 },
          'green': { r: 0, g: 255, b: 0, alpha: 1 },
          'blue': { r: 0, g: 0, b: 255, alpha: 1 },
          'yellow': { r: 255, g: 255, b: 0, alpha: 1 },
          'cyan': { r: 0, g: 255, b: 255, alpha: 1 },
          'magenta': { r: 255, g: 0, b: 255, alpha: 1 },
          'gray': { r: 128, g: 128, b: 128, alpha: 1 },
          'transparent': { r: 0, g: 0, b: 0, alpha: 0 }
        };
        bgColor = colorMap[backgroundColor.toLowerCase()] || { r: 0, g: 0, b: 0, alpha: 1 };
      }
      
      // Create background with the correct color
      const coloredBackground = sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 4,
          background: bgColor
        }
      }).png();
      
      // Composite the current image (with adjustments) over the colored background
      const compositeBuffer = await coloredBackground
        .composite([{ input: imageBuffer, blend: 'over' }])
        .toBuffer();
      
      const base64Result = compositeBuffer.toString('base64');
      return Response.json({
        success: true,
        image: `data:image/png;base64,${base64Result}`
      });
    }
  } catch (error) {
    console.error('Error in background replacement:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}