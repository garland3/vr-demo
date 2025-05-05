
import { useState, useCallback, useRef } from 'react';
import { Groq } from 'groq-sdk';

export const useImageAnalysis = (query: string, intervalSeconds: number) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const groqClient = useRef<Groq | null>(null);

  // Initialize Groq client
  if (!groqClient.current) {
    groqClient.current = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || '', // Using Vite environment variable
    });
  }

  const captureAndAnalyzeImage = useCallback(async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement || !query || !groqClient.current) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Create a canvas to capture the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Draw the current video frame to the canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert the canvas to a data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to Groq for analysis
      const chatCompletion = await groqClient.current.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: query
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
      });

      // Get the response content
      const responseContent = chatCompletion.choices[0]?.message?.content;
      setAnalysisResult(responseContent || 'No analysis available');
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  }, [query]);

  // Start periodic analysis
  const startAnalysis = useCallback((videoElement: HTMLVideoElement | null) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!videoElement || !query) {
      return;
    }

    // Initial analysis
    captureAndAnalyzeImage(videoElement);

    // Set up interval for periodic analysis
    const intervalMs = intervalSeconds * 1000;
    intervalRef.current = window.setInterval(() => {
      captureAndAnalyzeImage(videoElement);
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [captureAndAnalyzeImage, intervalSeconds, query]);

  // Stop the analysis
  const stopAnalysis = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    analysisResult,
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis,
    captureAndAnalyzeImage
  };
};
