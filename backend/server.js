const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// Secure endpoint for Gemini requests
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error: No API key provided' 
      });
    }

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Create the prompt with context about GeoHub Garissa
    const prompt = `
      You are a helpful assistant for GeoHub Garissa, an AI-driven resilience platform for Garissa County, Kenya.
      The platform monitors climate data, refugee camps, disaster risks, and provides insights for humanitarian planning.
      
      Context about GeoHub Garissa:
      - Monitors refugee camps in Dadaab, Hagadera, Ifo, and Dagahaley
      - Tracks vegetation health (NDVI), rainfall, flood risks
      - Provides early warning systems for disasters
      - Supports pastoralist communities with rangeland management
      - Serves Garissa County government and humanitarian organizations
      
      Current user question: ${message}
      
      Please provide a helpful response focused on Garissa County and the data available in the GeoHub platform.
    `;

    // Make request to Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    res.json({ response: responseText });
    
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    
    // Provide a fallback response if Gemini API fails
    res.json({ 
      response: "I'm currently unable to access the AI service. Please try again later or contact the system administrator.",
      error: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});