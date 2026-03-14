const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export async function searchImages(query, perPage = 15) {
  if (!PEXELS_API_KEY) {
    console.error('Pexels API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Pexels search failed');
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error('Pexels search error:', error);
    return [];
  }
}
