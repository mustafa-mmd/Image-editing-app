// // app/api/background-remove/route.js
// export async function POST(request) {
//   try {
//     const { image } = await request.json();

//     // For production, integrate with a free background removal API
//     // Mock implementation for demo purposes
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     return Response.json({
//       success: true,
//       image: image,
//     });
//   } catch (error) {
//     return Response.json(
//       { success: false, error: 'Background removal failed' },
//       { status: 500 }
//     );
//   }
// }




// app/api/background-remove/route.js
export async function POST(request) {
  try {
    const { image } = await request.json();
    
    // Extract base64 data from the data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Create FormData for the API request
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image_file', blob);
    
    // Make request to Remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', response.status, errorText);
      throw new Error(`Background removal failed: ${response.status} ${response.statusText}`);
    }
    
    // Get the processed image
    const resultBuffer = await response.arrayBuffer();
    const processedBase64 = Buffer.from(resultBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    const processedImage = `data:${mimeType};base64,${processedBase64}`;
    
    return Response.json({
      success: true,
      image: processedImage,
    });
  } catch (error) {
    console.error('Background removal error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message || 'Background removal failed' 
      },
      { status: 500 }
    );
  }
}