'use client';

import { useState } from 'react';
import ImagePicker from './ImagePicker';

const STEPS = ['platform', 'type', 'images', 'style', 'voice', 'caption', 'slides', 'export'];

const CLOVER_PROMPTS = {
  platform: "Where's this going?",
  type: "Single image or carousel?",
  images: "Add your images",
  style: "Let's make them match",
  voice: "How do you sound?",
  caption: "Here's your caption",
  slides: "Text for each slide",
  export: "Ready to post"
};

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📱', enabled: true },
  { id: 'facebook', name: 'Facebook', icon: '📘', enabled: false },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', enabled: false },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', enabled: false },
];

const FILTERS = [
  { id: 'none', name: 'Original', color: null, css: 'none' },
  { id: 'warm', name: 'Warm', color: '#C4956A', css: 'sepia(20%) saturate(120%) brightness(105%) hue-rotate(-5deg)' },
  { id: 'cool', name: 'Cool', color: '#6A9BC4', css: 'saturate(90%) brightness(105%) hue-rotate(10deg)' },
  { id: 'moody', name: 'Moody', color: '#5A5A6A', css: 'saturate(80%) brightness(85%) contrast(115%)' },
  { id: 'bright', name: 'Bright', color: '#E8B86D', css: 'saturate(130%) brightness(110%) contrast(105%)' },
  { id: 'muted', name: 'Muted', color: '#A8A898', css: 'saturate(60%) brightness(105%) sepia(15%)' },
];

function getFilterStyle(filterId) {
  const f = FILTERS.find(x => x.id === filterId);
  return f?.css || 'none';
}

export default function CloverPosts() {
  const [step, setStep] = useState(0);
  const [platforms, setPlatforms] = useState([]);
  const [postType, setPostType] = useState('');
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState('none');
  const [topic, setTopic] = useState('');
  const [voice, setVoice] = useState({ vibe: '', sample: '', cringe: '' });
  const [caption, setCaption] = useState('');
  const [slideTexts, setSlideTexts] = useState([]);
  const [generating, setGenerating] = useState(false);

  const currentStep = STEPS[step];
  const isCarousel = postType === 'carousel';

  const togglePlatform = (id) => {
    const platform = PLATFORMS.find(p => p.id === id);
    if (!platform?.enabled) return;
    setPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generateCaption = async () => {
    setGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || voice.vibe || 'social media post',
          platform: platforms[0] || 'instagram',
          postType,
          imageCount: selected.length,
          voiceProfile: voice,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setCaption('Caption generation failed. Please try again.');
      } else {
        setCaption(data.caption);
        if (data.slideTexts?.length > 0) {
          setSlideTexts(data.slideTexts);
        }
      }
    } catch (error) {
      setCaption('Caption generation failed. Please try again.');
    }
    
    setGenerating(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'platform': return platforms.length > 0;
      case 'type': return postType !== '';
      case 'images': return selected.length > 0;
      case 'caption': return caption.length > 0;
      case 'slides': return !isCarousel || slideTexts.length > 0;
      default: return true;
    }
  };

  const goNext = () => {
    let nextStep = step + 1;
    if (STEPS[nextStep] === 'slides' && !isCarousel) nextStep++;
    if (nextStep < STEPS.length) setStep(nextStep);
  };

  const goBack = () => {
    let prevStep = step - 1;
    if (STEPS[prevStep] === 'slides' && !isCarousel) prevStep--;
    if (prevStep >= 0) setStep(prevStep);
  };

  const resetAll = () => {
    setStep(0);
    setPlatforms([]);
    setPostType('');
    setSelected([]);
    setFilter('none');
    setTopic('');
    setVoice({ vibe: '', sample: '', cringe: '' });
    setCaption('');
    setSlideTexts([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-md mx-auto">
      <header className="text-center py-4 border-b border-green-100">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cl<span className="inline-block">🍀</span>verPosts
        </h1>
      </header>

      <div className="mx-4 mt-4 mb-4 p-3 bg-green-50 rounded-xl flex items-center gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
          🍀
        </div>
        <p className="text-base font-medium text-gray-800">
          {CLOVER_PROMPTS[currentStep]}
        </p>
      </div>

      <main className="px-4 pb-4 min-h-[320px]">
        
        {currentStep === 'platform' && (
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                disabled={!p.enabled}
                className={`
                  relative flex items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${platforms.includes(p.id) 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'}
                  ${!p.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-sm font-medium">{p.name}</span>
                {!p.enabled && (
                  <span className="absolute top-1 right-2 text-[10px] text-gray-400 uppercase">
                    soon
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {currentStep === 'type' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPostType('single')}
              className={`
                flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all
                ${postType === 'single' 
                  ? 'border-green-600 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <span className="text-sm font-medium">Single image</span>
            </button>
            <button
              onClick={() => setPostType('carousel')}
              className={`
                flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all
                ${postType === 'carousel' 
                  ? 'border-green-600 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <div className="flex gap-1">
                <div className="w-10 h-12 bg-gray-200 rounded" />
                <div className="w-10 h-12 bg-gray-300 rounded" />
                <div className="w-10 h-12 bg-gray-200 rounded" />
              </div>
              <span className="text-sm font-medium">Carousel</span>
            </button>
          </div>
        )}

        {currentStep === 'images' && (
          <ImagePicker
            selected={selected}
            onSelect={setSelected}
            maxImages={10}
            isCarousel={isCarousel}
          />
        )}

        {currentStep === 'style' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${filter === f.id 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'}
                  `}
                >
                  <div 
                    className="w-12 h-12 rounded-lg"
                    style={{ 
                      background: f.color 
                        ? f.color 
                        : 'linear-gradient(135deg, #8B4513, #228B22, #4169E1)' 
                    }}
                  />
                  <span className="text-xs font-medium">{f.name}</span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-3">Preview</p>
              <div className="flex gap-2 justify-center overflow-x-auto">
                {selected.map(img => (
                  <img
                    key={img.id}
                    src={img.src}
                    alt={img.alt}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 transition-all"
                    style={{ filter: getFilterStyle(filter) }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'voice' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's this post about?
              </label>
              <input
                type="text"
                placeholder='e.g., "Monday morning coffee ritual"'
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your vibe in a few words
              </label>
              <input
                type="text"
                placeholder='e.g., "warm but direct"'
                value={voice.vibe}
                onChange={e => setVoice(prev => ({ ...prev, vibe: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paste a caption you've written that sounds like you
              </label>
              <textarea
                placeholder="This helps match your voice..."
                value={voice.sample}
                onChange={e => setVoice(prev => ({ ...prev, sample: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Words to never use
              </label>
              <input
                type="text"
                placeholder='e.g., "bespoke, elevate, journey"'
                value={voice.cringe}
                onChange={e => setVoice(prev => ({ ...prev, cringe: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}

        {currentStep === 'caption' && (
          <div className="space-y-4">
            {!caption ? (
              <button
                onClick={generateCaption}
                disabled={generating}
                className={`
                  w-full p-4 rounded-xl font-medium text-white transition-all
                  ${generating 
                    ? 'bg-gray-400 cursor-wait' 
                    : 'bg-green-600 hover:bg-green-700'}
                `}
              >
                {generating ? 'Writing...' : 'Generate caption'}
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  rows={6}
                  className="w-full p-4 border border-gray-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <button
                  onClick={generateCaption}
                  className="text-sm text-green-600 font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'slides' && isCarousel && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Text for each slide (copy to Canva for now)
            </p>
            {selected.map((img, i) => (
              <div key={img.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-12 h-12 rounded-lg object-cover"
                    style={{ filter: getFilterStyle(filter) }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {i + 1}
                  </div>
                </div>
                <input
                  type="text"
                  value={slideTexts[i] || ''}
                  onChange={e => {
                    const newTexts = [...slideTexts];
                    newTexts[i] = e.target.value;
                    setSlideTexts(newTexts);
                  }}
                  placeholder={`Slide ${i + 1} text`}
                  className="flex-1 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
        )}

        {currentStep === 'export' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex gap-1 p-2 overflow-x-auto">
                {selected.map(img => (
                  <img
                    key={img.id}
                    src={img.src}
                    alt={img.alt}
                    className="w-20 h-20 rounded-lg flex-shrink-0 object-cover"
                    style={{ filter: getFilterStyle(filter) }}
                  />
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {caption}
                </pre>
              </div>
              {isCarousel && slideTexts.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-2">Slide text (copy to Canva):</p>
                  {slideTexts.map((text, i) => (
                    <p key={i} className="text-sm mb-1">
                      <strong>{i + 1}.</strong> {text}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => copyToClipboard(caption)}
                className="p-3 border-2 border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-all"
              >
                Copy caption
              </button>
              <button className="p-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all">
                Download images
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="px-4 py-4 border-t border-gray-100 flex justify-between gap-4">
        <button
          onClick={goBack}
          disabled={step === 0}
          className={`
            px-6 py-3 rounded-xl font-medium transition-all
            ${step === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'}
          `}
        >
          ← Back
        </button>
        
        {step < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${canProceed() 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={resetAll}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
          >
            New post
          </button>
        )}
      </footer>
    </div>
  );
}
