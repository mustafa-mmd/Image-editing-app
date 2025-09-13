// // app/api/image-convert/route.js
// export async function POST(request) {
//   try {
//     const { image, format } = await request.json();

//     // Convert image format
//     // This is a simplified implementation

//     return Response.json({
//       success: true,
//       image: image,
//     });
//   } catch (error) {
//     return Response.json(
//       { success: false, error: 'Format conversion failed' },
//       { status: 500 }
//     );
//   }
// }





// app/api/image-convert/route.js
import sharp from 'sharp';

export async function POST(request) {
  try {
    const { image, format } = await request.json();
    
    // Validate input
    if (!image || !format) {
      return Response.json(
        { success: false, error: 'Missing image or format parameter' },
        { status: 400 }
      );
    }
    
    // Extract base64 data from the data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Process image with Sharp
    let processedImage = sharp(imageBuffer);
    
    // Convert to desired format with quality options
    switch (format) {
      case 'jpg':
      case 'jpeg':
        processedImage = processedImage.jpeg({ 
          quality: 90, 
          progressive: true,
          optimiseScans: true
        });
        break;
      case 'webp':
        processedImage = processedImage.webp({ 
          quality: 90,
          effort: 6 // Higher effort = better compression but slower
        });
        break;
      case 'avif':
        processedImage = processedImage.avif({ 
          quality: 80,
          effort: 5
        });
        break;
      case 'tiff':
        processedImage = processedImage.tiff({ 
          compression: 'lzw',
          quality: 90
        });
        break;
      default: // png
        processedImage = processedImage.png({
          compressionLevel: 9, // Highest compression
          progressive: true,
          palette: true
        });
    }
    
    // Convert to buffer and then to base64
    const processedBuffer = await processedImage.toBuffer();
    const processedBase64 = processedBuffer.toString('base64');
    
    // Determine mime type
    let mimeType;
    switch (format) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'avif':
        mimeType = 'image/avif';
        break;
      case 'tiff':
        mimeType = 'image/tiff';
        break;
      default:
        mimeType = `image/${format}`;
    }
    
    const processedImageData = `data:${mimeType};base64,${processedBase64}`;
    
    return Response.json({
      success: true,
      image: processedImageData,
      format: format,
      mimeType: mimeType
    });
  } catch (error) {
    console.error('Format conversion error:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Format conversion failed: ' + error.message 
      },
      { status: 500 }
    );
  }
}




