
import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Groq client
const groqClient = new Groq({
  apiKey: process.env.GROQ_API,
});

// API route for image analysis
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageDataUrl, query } = req.body;
    
    if (!imageDataUrl || !query) {
      return res.status(400).json({ error: 'Image data and query are required' });
    }

    const chatCompletion = await groqClient.chat.completions.create({
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

    res.json({ result: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'Error analyzing image' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
