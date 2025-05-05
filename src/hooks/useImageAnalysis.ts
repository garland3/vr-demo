
import { useState, useRef, useCallback, useEffect } from 'react';

export const useImageAnalysis = (query: string, intervalSeconds: number = 5) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const captureAndAnalyzeImage = useCallback(async () => {
    try {
      // Create a canvas to capture the current video frame
      const video = document.querySelector('video');
      if (!video) {
        setError('No video element found');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setError('Could not create canvas context');
        return;
      }
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      // Send to backend API
      setIsAnalyzing(true);
      // Dispatch event for analysis starting
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analysisStarted', { detail: { time: Date.now() } }));
      }
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDataUrl,
          query
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisResult(data.result);
      setError(null);
      // Dispatch event for analysis completion
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analysisCompleted', { detail: { time: Date.now() } }));
      }
    } catch (err) {
      console.error('Error in image analysis:', err);
      setError(err instanceof Error ? err.message : 'Error analyzing image');
    } finally {
      setIsAnalyzing(false);
    }
  }, [query]);

  const startAnalysis = useCallback((immediate = true) => {
    // Clear any existing interval
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
    }
    
    // Run immediately if requested
    if (immediate) {
      captureAndAnalyzeImage();
    }
    
    // Set up the interval
    analyzeIntervalRef.current = setInterval(() => {
      captureAndAnalyzeImage();
    }, intervalSeconds * 1000);
  }, [captureAndAnalyzeImage, intervalSeconds]);
  
  const stopAnalysis = useCallback(() => {
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
      }
    };
  }, []);

  return {
    analysisResult,
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis
  };
};
