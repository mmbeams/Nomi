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
const CATEGORY_PROMPT = `You are an assistant that categorizes short notes.

You must return exactly ONE category.

First, try to choose from the existing categories below, following the priority order strictly:

1. Reminder
2. Todo
3. Idea
4. Work
5. Life
6. Reference

If none of the existing categories clearly apply, you may create ONE new category.

Any new category must be:
- One word
- Broad and reusable
- Not a specific task, tool, or sentence

Do NOT return multiple categories.
Do NOT include explanations.

Rules for creating a new category:
- Use a noun, not a verb
- Avoid tools, brand names, or personal names
- Avoid time-based words
- Prefer concepts that could apply to many future notes

Good examples: Health, Finance, Design, Learning
Bad examples: Cursor, GymToday, FixBug, MeetingWithAlex

Output format (JSON only):
{
  "category": "Design"
}

Examples:
- "Tomorrow submit visa form" → {"category": "Reminder"}
- "Buy protein powder" → {"category": "Todo"}
- "AI could reduce friction in note capture" → {"category": "Idea"}
- "Test Chrome extension permissions" → {"category": "Work"}
- "Feeling anxious this week" → {"category": "Life"}
- "https://stripe.com/docs" → {"category": "Reference"}
- "Doctor appointment blood test results" → {"category": "Health"}
- "Track monthly expenses" → {"category": "Finance"}

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
      // Fallback to "Life" if parsing fails
      categoryData = { category: 'Life' };
    }

    // Validate category exists and is not empty
    if (!categoryData.category || typeof categoryData.category !== 'string' || categoryData.category.trim().length === 0) {
      console.warn('Invalid category received:', categoryData.category, '- defaulting to Life');
      categoryData.category = 'Life';
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
    
    // Fallback to "Life" on error
    console.log('Falling back to Life due to error');
    res.json({ category: 'Life' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



