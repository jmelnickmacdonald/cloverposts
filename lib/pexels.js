const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export async function searchImages(query, perPage = 15) {
  if (!PEXELS_API_KEY) {
    console.error('Missing PEXELS_API_KEY');
    return { photos: [], error: 'API key not configured' };
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      photos: data.photos.map(photo => ({
        id: photo.id,
        src: photo.src.medium,
        srcLarge: photo.src.large,
        srcOriginal: photo.src.original,
        alt: photo.alt || query,
        photographer: photo.photographer,
        color: photo.avg_color,
      })),
      error: null,
    };
  } catch (error) {
    console.error('Pexels search failed:', error);
    return { photos: [], error: error.message };
  }
}
