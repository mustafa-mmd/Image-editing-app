// // app/api/ai-enhance/route.js
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { image } = await req.json();
    
//     if (!image) {
//       return NextResponse.json(
//         { success: false, error: "No image provided" },
//         { status: 400 }
//       );
//     }

//     // Check if API key is available
//     if (!process.env.HUGGING_FACE_API_KEY) {
//       console.log('Hugging Face API key not found, using fallback enhancement');
//       return enhanceLocally(image);
//     }

//     // Extract base64 data
//     const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
//     console.log('Sending to Hugging Face Real-ESRGAN...');
    
//     const response = await fetch(
//       "https://api-inference.huggingface.co/models/cjwbw/real-esrgan",
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           inputs: base64Data,
//         }),
//       }
//     );

//     console.log('Hugging Face response status:', response.status);

//     if (response.ok) {
//       const enhancedBuffer = await response.arrayBuffer();
//       const enhancedBase64 = Buffer.from(enhancedBuffer).toString('base64');
//       const enhancedImage = `data:image/png;base64,${enhancedBase64}`;

//       console.log('AI enhancement successful!');
//       return NextResponse.json({
//         success: true,
//         image: enhancedImage,
//         source: 'hugging_face'
//       });
//     }

//     // If Hugging Face fails, use local enhancement
//     console.log('Hugging Face API failed, using local enhancement');
//     return enhanceLocally(image);
    
//   } catch (error) {
//     console.error("AI Enhance route error:", error);
//     return enhanceLocally(image);
//   }
// }

// // Local enhancement fallback - FIXED sharp import
// async function enhanceLocally(image) {
//   try {
//     // Use dynamic import for server-side compatibility
//     const sharp = (await import('sharp')).default;
//     const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
//     const imageBuffer = Buffer.from(base64Data, 'base64');
    
//     const enhancedImage = await sharp(imageBuffer)
//       .sharpen({ 
//         sigma: 2.5, // Increased for better sharpness
//         m1: 1,      // Flat threshold
//         m2: 3,      // Strong sharpening
//         x1: 2       // Reduced for smoother results
//       })
//       .modulate({
//         brightness: 1.12,    // Slight brightness boost
//         saturation: 1.25,    // Enhanced colors
//         contrast: 1.18       // Better contrast
//       })
//       .png({ quality: 95 })  // High quality PNG
//       .toBuffer();
    
//     const enhancedBase64 = enhancedImage.toString('base64');
//     const processedImage = `data:image/png;base64,${enhancedBase64}`;

//     return NextResponse.json({
//       success: true,
//       image: processedImage,
//       source: 'local_enhancement'
//     });
    
//   } catch (error) {
//     console.error("Local enhancement failed:", error);
    
//     // Return original image as fallback
//     return NextResponse.json({
//       success: true,
//       image: image,
//       source: 'original',
//       warning: "Enhancement failed, using original image"
//     });
//   }
// }





// app/api/ai-enhance/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { image } = await req.json();
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!process.env.HUGGING_FACE_API_KEY) {
      console.log('Hugging Face API key not found, using fallback enhancement');
      return enhanceLocally(image);
    }

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('Sending to Hugging Face Real-ESRGAN for AI enhancement...');
    
    // Hugging Face Real-ESRGAN expects raw image bytes, not JSON
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cjwbw/real-esrgan",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
        body: imageBuffer, // Send raw image bytes, not JSON
      }
    );

    console.log('Hugging Face response status:', response.status);

    if (response.ok) {
      const enhancedBuffer = await response.arrayBuffer();
      const enhancedBase64 = Buffer.from(enhancedBuffer).toString('base64');
      const enhancedImage = `data:image/png;base64,${enhancedBase64}`;

      console.log('✅ AI enhancement successful!');
      return NextResponse.json({
        success: true,
        image: enhancedImage,
        source: 'hugging_face'
      });
    }

    // If Hugging Face fails, use local enhancement
    const errorText = await response.text();
    console.log('Hugging Face API failed:', response.status, errorText);
    return enhanceLocally(image);
    
  } catch (error) {
    console.error("AI Enhance route error:", error);
    return enhanceLocally(image);
  }
}

// Local enhancement fallback
async function enhanceLocally(image) {
  try {
    const sharp = (await import('sharp')).default;
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const enhancedImage = await sharp(imageBuffer)
      .sharpen({ 
        sigma: 2.5,
        m1: 1,
        m2: 4,
        x1: 2
      })
      .modulate({
        brightness: 1.15,
        saturation: 1.3,
        contrast: 1.25
      })
      .png({ quality: 95 })
      .toBuffer();
    
    const enhancedBase64 = enhancedImage.toString('base64');
    const processedImage = `data:image/png;base64,${enhancedBase64}`;

    return NextResponse.json({
      success: true,
      image: processedImage,
      source: 'local_enhancement',
      message: "Used local enhancement (Hugging Face unavailable)"
    });
    
  } catch (error) {
    console.error("Local enhancement failed:", error);
    
    return NextResponse.json({
      success: true,
      image: image,
      source: 'original',
      warning: "All enhancement methods failed"
    });
  }
}
