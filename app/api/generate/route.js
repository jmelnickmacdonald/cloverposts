import { NextResponse } from 'next/server';
import { generatePrompt, parseGeneratedContent } from '../../../lib/claude';

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, platform, imageCount, vibe, sampleCaption, cringeWords } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = generatePrompt({
      topic,
      platform: platform || 'instagram',
      imageCount: imageCount || 1,
      vibe,
      sampleCaption,
      cringeWords,
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.content[0]?.text || '';
    
    const isCarousel = imageCount > 1;
    const parsed = parseGeneratedContent(generatedText, isCarousel);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
