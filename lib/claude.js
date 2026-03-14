export async function generateCaption({
  topic,
  platform,
  postType,
  imageCount,
  voiceProfile,
}) {
  const { vibe, sample, cringe } = voiceProfile;

  const systemPrompt = `You write social media captions for small business owners. You sound human, not like a brand.

RULES:
- No engagement bait ("comment below!", "who else?", "am I right?")
- No emoji spam (1-2 max, only if it fits naturally)
- No hashtags in the caption (those go separately)
- First line stops the scroll
- Match their energy exactly
- Never use their banned words
${cringe ? `- NEVER use these words: ${cringe}` : ''}

${sample ? `Here's how they actually write - match this voice:\n"${sample}"` : ''}`;

  const userPrompt = buildUserPrompt({ topic, platform, postType, imageCount, vibe });

  try {
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
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      caption: data.content[0].text,
      error: null,
    };
  } catch (error) {
    console.error('Caption generation failed:', error);
    return {
      caption: null,
      error: error.message,
    };
  }
}

function buildUserPrompt({ topic, platform, postType, imageCount, vibe }) {
  const platformGuide = {
    instagram: 'Instagram caption. Can be longer, but front-load the good stuff before the "more" cutoff (~125 chars).',
    facebook: 'Facebook post. Conversational, can be a bit longer.',
    linkedin: 'LinkedIn post. Professional but human. Story-driven works well.',
    pinterest: 'Pinterest description. Keyword-rich for search, but still readable.',
  };

  if (postType === 'carousel') {
    return `Write a ${platform} caption for a ${imageCount}-slide carousel about: ${topic}

${platformGuide[platform] || ''}
${vibe ? `Their vibe: ${vibe}` : ''}

Also provide text for each of the ${imageCount} slides. The slides should tell a story:
- Slide 1: Hook (stop the scroll)
- Middle slides: Build the story/point
- Last slide: Payoff or call to action

Format your response like this:

CAPTION:
[the caption that goes below the post]

SLIDE TEXT:
1. [text for slide 1]
2. [text for slide 2]
... and so on

Keep slide text short - these go ON the images. 5-15 words each.`;
  } else {
    return `Write a ${platform} caption for a single image post about: ${topic}

${platformGuide[platform] || ''}
${vibe ? `Their vibe: ${vibe}` : ''}

Just write the caption. No preamble.`;
  }
}

export function parseGeneratedContent(response, imageCount) {
  if (!response) return { caption: '', slideTexts: [] };

  const captionMatch = response.match(/CAPTION:\s*([\s\S]*?)(?=SLIDE TEXT:|$)/i);
  const slideMatch = response.match(/SLIDE TEXT:\s*([\s\S]*)/i);

  if (captionMatch && slideMatch) {
    const caption = captionMatch[1].trim();
    const slideSection = slideMatch[1].trim();
    
    const slideTexts = [];
    const lines = slideSection.split('\n');
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) {
        slideTexts.push(match[1].trim());
      }
    }

    return { caption, slideTexts };
  }

  return { caption: response.trim(), slideTexts: [] };
}
