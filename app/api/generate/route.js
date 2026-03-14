import { generateCaption, parseGeneratedContent } from '@/lib/claude';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { topic, platform, postType, imageCount, voiceProfile } = body;

    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    const result = await generateCaption({
      topic,
      platform: platform || 'instagram',
      postType: postType || 'single',
      imageCount: imageCount || 1,
      voiceProfile: voiceProfile || {},
    });

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    const parsed = parseGeneratedContent(result.caption, imageCount);

    return Response.json({
      caption: parsed.caption,
      slideTexts: parsed.slideTexts,
    });
  } catch (error) {
    console.error('Generate endpoint error:', error);
    return Response.json({ error: 'Failed to generate caption' }, { status: 500 });
  }
}
