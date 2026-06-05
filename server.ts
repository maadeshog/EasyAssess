/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON request bodies
  app.use(express.json());

  // Server-side secure Gemini API route
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, books, assessments, userLang } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY is not defined in the server environment!');
        return res.status(500).json({
          error: 'Gemini API key is missing. Please declare GEMINI_API_KEY in active Secrets.',
        });
      }

      // Initialize the GoogleGenAI client on the backend to keep credentials secure
      const ai = new GoogleGenAI({ apiKey });

      const booksContext = Array.isArray(books)
        ? books.map(b => `- ${b.title} by ${b.author} (${b.type}, Language: ${b.language || 'English'}, System: ${b.system || 'General'})`).join('\n')
        : 'No books on site.';

      const assessmentsContext = Array.isArray(assessments)
        ? assessments.slice(0, 10).map(a => {
            const bookTitle = Array.isArray(books) ? books.find(b => b.id === a.bookId)?.title : 'Unknown Book';
            return `- Assessment for "${bookTitle}" review by ${a.userName}: recommendation is ${a.recommendation} (Comments: ${a.comments})`;
          }).join('\n')
        : 'No assessments on site.';

      const systemInstruction = `You are the EasyAssess AI Assistant, a prestigious and secure academic peer-review helper.
The current evaluator's preferred language is ${userLang || 'English'}. You MUST interact, generate rubrics, provide grading standards, and draft recommendations in ${userLang || 'English'} natively.
Keep your answers highly professional, respectful, structured, and helpful. Avoid technical system terms.

Current Statistics of user's evaluation suite:
- Total Registered Books: ${Array.isArray(books) ? books.length : 0}
- Total Assessments Submitted: ${Array.isArray(assessments) ? assessments.length : 0}

Textbooks & Materials currently in archive:
${booksContext}

Recent Expert Assessments:
${assessmentsContext}

Refer back to this exact library inventory when responding to user requests, recommendations, or grading criteria.`;

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || '' }]
      }));

      const modelName = 'gemini-3.5-flash';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
        }
      });

      res.json({ text: response.text || "I'm sorry, I was unable to compile a response." });
    } catch (e: any) {
      console.error('Express AI Chat request failed:', e);
      res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  });

  // Hot Module Replacement (HMR) / Vite Dev Server Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve HTML page on fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyAssess backend server running on http://localhost:${PORT}`);
  });
}

startServer();
