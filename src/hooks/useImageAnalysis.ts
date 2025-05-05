import { useState, useCallback, useRef } from 'react';

export const useImageAnalysis = (query: string, intervalSeconds: number) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const captureAndAnalyzeImage = useCallback(async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement || !query) {
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

      // Send to backend API for analysis
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDataUrl,
          query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      setAnalysisResult(data.result);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Error analyzing image');
    } finally {
      setIsAnalyzing(false);
    }
  }, [query]);

  const startAnalysis = useCallback((videoElement: HTMLVideoElement) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Immediately analyze once
    captureAndAnalyzeImage(videoElement);

    // Set up interval for periodic analysis
    const intervalId = window.setInterval(() => {
      captureAndAnalyzeImage(videoElement);
    }, intervalSeconds * 1000);

    intervalRef.current = intervalId;
  }, [captureAndAnalyzeImage, intervalSeconds]);

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
  };
};