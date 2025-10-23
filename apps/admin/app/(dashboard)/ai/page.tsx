'use client';

import { useState } from 'react';
import AIAssistant from '@/components/AIAssistant';

export default function AIPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Assistant
        </h1>
        <p className="text-gray-600">
          Generate content, translate articles, extract from URLs, and improve existing content using AI.
        </p>
      </div>

      <AIAssistant />
    </div>
  );
}

