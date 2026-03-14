export function generatePrompt({ topic, platform, imageCount, vibe, sampleCaption, cringeWords }) {
  const platformGuides = {
    instagram: 'Instagram caption: First line must stop the scroll (125 chars before truncation). Keep it punchy. End with a call to engage but not cheesy engagement bait.',
    facebook: 'Facebook post: Can be longer and more conversational. Tell a story. Ask a genuine question.',
    linkedin: 'LinkedIn post: Professional but personable. Lead with a hook. Share insight or lessons learned.',
    pinterest: 'Pinterest description: Keyword-rich but readable. Focus on what the pin shows and why it matters.',
  };

  const isCarousel = imageCount > 1;

  let systemPrompt = `You write social media captions for small business owners. Sound human, not like a brand or AI.

RULES:
- No engagement bait ("double tap if you agree", "comment below")
- No emoji spam (1-2 max, only if it fits naturally)
- No hashtags in the caption (they'll add their own)
- First line must stop the scroll
- Match their energy and voice
- Never use cliché phrases`;

  if (cringeWords) {
    systemPrompt += `\n- NEVER use these words: ${cringeWords}`;
  }

  if (sampleCaption) {
    systemPrompt += `\n\nHere's how they write - match this voice:\n"${sampleCaption}"`;
  }

  let userPrompt = `Write a ${platform} caption for a ${isCarousel ? `${imageCount}-slide carousel` : 'single image post'} about: ${topic}

${platformGuides[platform] || platformGuides.instagram}

${vibe ? `Vibe: ${vibe}` : ''}`;

  if (isCarousel) {
    userPrompt += `

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
CAPTION:
[Write the caption that goes below the post]

SLIDE TEXT:
1. [Text for slide 1 - 5-15 words max, this goes ON the image]
2. [Text for slide 2]
${imageCount > 2 ? `3. [Text for slide 3]` : ''}
${imageCount > 3 ? `...continue for all ${imageCount} slides` : ''}

Keep slide text SHORT - these are overlay text that goes on the images, not captions.`;
  } else {
    userPrompt += `

Write only the caption. No preamble, no explanation.`;
  }

  return { systemPrompt, userPrompt };
}

export function parseGeneratedContent(text, isCarousel) {
  if (!isCarousel) {
    return {
      caption: text.trim(),
      slideText: [],
    };
  }

  const captionMatch = text.match(/CAPTION:\s*([\s\S]*?)(?=SLIDE TEXT:|$)/i);
  const slideTextMatch = text.match(/SLIDE TEXT:\s*([\s\S]*?)$/i);

  const caption = captionMatch ? captionMatch[1].trim() : text.trim();
  const slideText = [];

  if (slideTextMatch) {
    const slides = slideTextMatch[1].trim().split(/\n/).filter(line => line.trim());
    slides.forEach(line => {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        slideText.push(match[1].trim());
      }
    });
  }

  return { caption, slideText };
}
