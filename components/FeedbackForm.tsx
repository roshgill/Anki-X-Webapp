"use client";

import { useState } from 'react';
import emailjs from '@emailjs/browser';

export function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    const templateParams = {
      message: feedback
      //to_email: 'RoshanAnkiX@gmail.com'
    };

    try {
      const response = await emailjs.send(
        'service_tisfysq',
        'template_igfu9n9',
        templateParams,
        {
          publicKey: process.env.NEXT_PUBLIC_EMAILJS_KEY || '',
        }
      );

      if (response.status === 200) {
        setStatus('success');
        setFeedback('');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email send failed:', error);
      setStatus('error');
    } finally {
      setIsSending(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="How can we make Anki-X better? Your feedback helps!"
        className="w-full p-3 border rounded-md min-h-[100px]"
        required
      />
    <button 
        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
    >
        Submit Feedback
    </button>
      {status === 'success' && (
        <p className="text-green-600 text-sm text-center">Thank you for your feedback!</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm text-center">Failed to send feedback. Please try again.</p>
      )}
    </form>
  );
}
