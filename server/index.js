import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyA4vJauzZrsncbB5wkk--qSbJhrbFtwvNA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Category system prompt
const CATEGORY_PROMPT = `You are a categorization assistant. Your job is to categorize short user notes into meaningful categories.

Rules:
1. Create specific, descriptive category names (1-3 words)
2. Reuse existing categories when they fit well - check if a similar category already exists
3. Do NOT create too many categories - aim for 8-15 total categories maximum
4. Categories should be specific enough to be useful but not so specific that you create hundreds of them
5. Use common, intuitive category names (e.g., "Work", "Personal", "Health", "Shopping", "Travel")
6. Return ONLY a JSON object with this exact format: {"category": "CategoryName"}

Examples:
- "Pick up package tonight" → {"category": "Daily Life"}
- "Fix bug in login" → {"category": "Dev"}
- "Call dentist" → {"category": "Health"}
- "New app idea" → {"category": "Ideas"}
- "Buy groceries" → {"category": "Shopping"}

Now categorize this note:`;

// Categorize endpoint
app.post('/api/categorize', async (req, res) => {
  try {
    const { note } = req.body;
    console.log('Received categorization request for:', note);

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      console.error('Invalid note:', note);
      return res.status(400).json({ error: 'Note text is required' });
    }

    // Try gemini-1.5-flash first (faster and free), fallback to gemini-pro
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (e) {
      console.log('Trying gemini-pro instead...');
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    
    const prompt = `${CATEGORY_PROMPT}\n\n"${note.trim()}"\n\nRespond with ONLY a valid JSON object in this exact format: {"category": "CategoryName"}. Do not include any explanation, markdown, or additional text.`;

    console.log('Calling Gemini API with model:', model);
    console.log('Prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    console.log('Gemini raw response:', text);
    console.log('Response length:', text.length);

    // Parse JSON response
    let categoryData;
    try {
      // Extract JSON from response (handle cases where Gemini adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        categoryData = JSON.parse(jsonMatch[0]);
        console.log('Parsed category:', categoryData);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      console.error('Parse error:', parseError);
      // Fallback to "Daily Life" if parsing fails
      categoryData = { category: 'Daily Life' };
    }

    // Validate category
    const validCategories = [
      'Daily Life',
      'Todos',
      'Work',
      'Dev',
      'Inspo',
      'Ideas',
      'Learning',
      'Health',
      'Finance',
      'Projects'
    ];

    if (!validCategories.includes(categoryData.category)) {
      console.warn('Invalid category received:', categoryData.category, '- defaulting to Daily Life');
      categoryData.category = 'Daily Life';
    }

    console.log('Returning category:', categoryData.category);
    res.json({
      category: categoryData.category
    });
  } catch (error) {
    console.error('Error categorizing note:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific API errors
    if (error.message && error.message.includes('API_KEY')) {
      console.error('API KEY ERROR: Check if the Gemini API key is valid');
    }
    if (error.message && error.message.includes('quota')) {
      console.error('QUOTA ERROR: API quota may be exceeded');
    }
    
    // Fallback to "Daily Life" on error
    console.log('Falling back to Daily Life due to error');
    res.json({ category: 'Daily Life' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



