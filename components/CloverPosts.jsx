'use client';
import { useState, useEffect } from 'react';
import ImagePicker from './ImagePicker';

export default function CloverPosts() {
  const [step, setStep] = useState('landing'); // landing, transition, topic, platform, type, images, style, voice, generating, caption, export
  const [formData, setFormData] = useState({
    topic: '',
    platform: 'instagram',
    postType: 'single',
    images: [],
    style: 'none',
    vibe: '',
    sampleCaption: '',
    cringeWords: '',
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Generate smart image suggestions based on topic
  const getImageSuggestions = (topic) => {
    const topicLower = topic.toLowerCase();
    
    // Real estate keywords
    if (topicLower.includes('listing') || topicLower.includes('house') || topicLower.includes('home') || topicLower.includes('property')) {
      return ['luxury home exterior', 'modern kitchen', 'cozy living room'];
    }
    if (topicLower.includes('buyer') || topicLower.includes('buying')) {
      return ['house keys', 'couple moving', 'sold sign'];
    }
    if (topicLower.includes('market') || topicLower.includes('update')) {
      return ['housing market', 'neighborhood aerial', 'city skyline'];
    }
    if (topicLower.includes('testimonial') || topicLower.includes('client')) {
      return ['happy couple', 'handshake', 'keys handover'];
    }
    
    // Lifestyle keywords
    if (topicLower.includes('morning') || topicLower.includes('routine')) {
      return ['coffee morning', 'sunrise', 'journal desk'];
    }
    if (topicLower.includes('tip') || topicLower.includes('advice')) {
      return ['lightbulb idea', 'notebook planning', 'checklist'];
    }
    if (topicLower.includes('fitness') || topicLower.includes('workout') || topicLower.includes('gym')) {
      return ['fitness workout', 'healthy lifestyle', 'running outdoors'];
    }
    if (topicLower.includes('food') || topicLower.includes('recipe') || topicLower.includes('cooking')) {
      return ['healthy food', 'cooking kitchen', 'fresh ingredients'];
    }
    
    // Default suggestions
    return ['professional workspace', 'lifestyle aesthetic', 'business success'];
  };

  const handleStart = () => {
    setStep('transition');
    setTimeout(() => {
      setStep('topic');
    }, 2000);
  };

  const handleNext = () => {
    const flow = ['topic', 'platform', 'type', 'images', 'style', 'voice', 'generating'];
    const currentIndex = flow.indexOf(step);
    
    // Skip style step if single image
    if (step === 'images' && formData.postType === 'single') {
      setStep('voice');
      return;
    }
    
    if (step === 'voice') {
      handleGenerate();
      return;
    }
    
    if (currentIndex < flow.length - 1) {
      setStep(flow[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const flow = ['topic', 'platform', 'type', 'images', 'style', 'voice'];
    const currentIndex = flow.indexOf(step);
    
    // Skip style step going back if single image
    if (step === 'voice' && formData.postType === 'single') {
      setStep('images');
      return;
    }
    
    if (currentIndex > 0) {
      setStep(flow[currentIndex - 1]);
    }
  };

  const handleGenerate = async () => {
    setStep('generating');
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          platform: formData.platform,
          imageCount: formData.images.length,
          vibe: formData.vibe,
          sampleCaption: formData.sampleCaption,
          cringeWords: formData.cringeWords,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data);
      setStep('caption');
    } catch (err) {
      setError(err.message);
      setStep('voice');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep('landing');
    setFormData({
      topic: '',
      platform: 'instagram',
      postType: 'single',
      images: [],
      style: 'none',
      vibe: '',
      sampleCaption: '',
      cringeWords: '',
    });
    setGeneratedContent(null);
  };

  // Clover prompts for each step
  const cloverPrompts = {
    topic: "What's this post about?",
    platform: "Where's it going?",
    type: "One image or a carousel?",
    images: "Add your images.",
    style: "Let's make them match.",
    voice: "How do you sound?",
    generating: "Working on it...",
    caption: "Here's what I came up with.",
    export: "Ready to post.",
  };

  // Landing page
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
           style={{ backgroundImage: 'url(/images/background.png)' }}>
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
          <img 
            src="/images/wordmark.png" 
            alt="CloverPosts" 
            className="h-12 md:h-16 mx-auto mb-8"
          />
          <img 
            src="/images/mascot.png" 
            alt="Clover" 
            className="w-32 md:w-40 mx-auto mb-6"
          />
          <p className="text-gray-700 text-lg md:text-xl mb-8 leading-relaxed">
            Hey! I'm Clover. I help you make social posts that sound like you and look exactly how you pictured them.
          </p>
          <button
            onClick={handleStart}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Let's do it
          </button>
        </div>
      </div>
    );
  }

  // Transition screen
  if (step === 'transition') {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
           style={{ backgroundImage: 'url(/images/background.png)' }}>
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
          <img 
            src="/images/mascot.png" 
            alt="Clover" 
            className="w-24 md:w-32 mx-auto mb-6 animate-bounce"
          />
          <p className="text-gray-700 text-2xl md:text-3xl font-medium">
            Grab a seat.
          </p>
        </div>
      </div>
    );
  }

  // Main app flow
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
         style={{ backgroundImage: 'url(/images/background.png)' }}>
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <img 
            src="/images/wordmark.png" 
            alt="CloverPosts" 
            className="h-8 md:h-10"
          />
          <button
            onClick={handleStartOver}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Start over
          </button>
        </div>

        {/* Clover + Prompt */}
        <div className="flex items-start gap-4 mb-6">
          <img 
            src="/images/mascot.png" 
            alt="Clover" 
            className="w-16 md:w-20 flex-shrink-0"
          />
          <div className="bg-green-50 rounded-2xl rounded-tl-none p-4 flex-grow">
            <p className="text-gray-800 text-lg font-medium">
              {cloverPrompts[step]}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {/* TOPIC STEP */}
          {step === 'topic' && (
            <div>
              <textarea
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="A new listing, a tip, a personal story - whatever you're sharing."
                className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={4}
              />
            </div>
          )}

          {/* PLATFORM STEP */}
          {step === 'platform' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, platform: 'instagram' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.platform === 'instagram'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">📸</div>
                <div className="font-medium text-gray-800">Instagram</div>
              </button>
              <button
                disabled
                className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
              >
                <div className="text-2xl mb-1">👥</div>
                <div className="font-medium text-gray-400">Facebook</div>
                <div className="text-xs text-gray-400">Coming soon</div>
              </button>
              <button
                disabled
                className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
              >
                <div className="text-2xl mb-1">💼</div>
                <div className="font-medium text-gray-400">LinkedIn</div>
                <div className="text-xs text-gray-400">Coming soon</div>
              </button>
              <button
                disabled
                className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
              >
                <div className="text-2xl mb-1">📌</div>
                <div className="font-medium text-gray-400">Pinterest</div>
                <div className="text-xs text-gray-400">Coming soon</div>
              </button>
            </div>
          )}

          {/* TYPE STEP */}
          {step === 'type' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, postType: 'single' })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.postType === 'single'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">🖼️</div>
                <div className="font-medium text-gray-800">Single Image</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, postType: 'carousel' })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.postType === 'carousel'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">🎠</div>
                <div className="font-medium text-gray-800">Carousel</div>
                <div className="text-sm text-gray-500">2-10 slides</div>
              </button>
            </div>
          )}

          {/* IMAGES STEP */}
          {step === 'images' && (
            <ImagePicker
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={formData.postType === 'single' ? 1 : 10}
              topicSuggestions={getImageSuggestions(formData.topic)}
            />
          )}

          {/* STYLE STEP */}
          {step === 'style' && (
            <div>
              <p className="text-gray-600 mb-4">Apply a filter to make your images look cohesive:</p>
              <div className="grid grid-cols-3 gap-3">
                {['none', 'warm', 'cool', 'vintage', 'bright', 'moody'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setFormData({ ...formData, style })}
                    className={`p-3 rounded-xl border-2 capitalize transition-all ${
                      formData.style === style
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {style === 'none' ? 'No filter' : style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VOICE STEP */}
          {step === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">What's the vibe?</label>
                <div className="flex flex-wrap gap-2">
                  {['casual', 'professional', 'playful', 'inspiring', 'witty', 'warm'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setFormData({ ...formData, vibe: v })}
                      className={`px-4 py-2 rounded-full capitalize transition-all ${
                        formData.vibe === v
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Paste a caption you've written before
                  <span className="font-normal text-gray-500"> (so I can match your voice)</span>
                </label>
                <textarea
                  value={formData.sampleCaption}
                  onChange={(e) => setFormData({ ...formData, sampleCaption: e.target.value })}
                  placeholder="Optional but helpful..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Words to avoid
                  <span className="font-normal text-gray-500"> (your cringe list)</span>
                </label>
                <input
                  type="text"
                  value={formData.cringeWords}
                  onChange={(e) => setFormData({ ...formData, cringeWords: e.target.value })}
                  placeholder="e.g., synergy, leverage, game-changer"
                  className="w-full p-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* GENERATING STEP */}
          {step === 'generating' && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Crafting your caption...</p>
            </div>
          )}

          {/* CAPTION STEP */}
          {step === 'caption' && generatedContent && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Caption</label>
                <div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap">
                  {generatedContent.caption}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedContent.caption)}
                  className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  📋 Copy caption
                </button>
              </div>
              {generatedContent.slideText && generatedContent.slideText.length > 0 && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Slide Text</label>
                  <div className="space-y-2">
                    {generatedContent.slideText.map((text, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl text-gray-700 flex justify-between items-center">
                        <span><strong>Slide {i + 1}:</strong> {text}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(text)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          📋
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {step !== 'topic' && step !== 'generating' && step !== 'caption' && (
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back
            </button>
          )}
          {step === 'topic' && <div />}
          
          {step !== 'generating' && step !== 'caption' && (
            <button
              onClick={handleNext}
              disabled={
                (step === 'topic' && !formData.topic.trim()) ||
                (step === 'images' && formData.images.length === 0) ||
                (step === 'voice' && !formData.vibe)
              }
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-all ml-auto"
            >
              {step === 'voice' ? 'Generate' : 'Next →'}
            </button>
          )}

          {step === 'caption' && (
            <button
              onClick={handleStartOver}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-all ml-auto"
            >
              Create another post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
