import OpenAI from 'openai';

// Get OpenAI API key from environment
const openaiApiKey = process.env.OPENAI_API_KEY;

let openai = null;

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey
  });
  console.log('✅ OpenAI configured');
} else {
  console.warn('⚠️ OpenAI API key not set. AI features unavailable.');
}

export const ai = {
  // Check if AI is configured
  isConfigured: () => openai !== null,

  // Generate personalized value proposition
  async generateValueProposition(role) {
    if (!openai) {
      return `Scedge adapts to your workflow as a ${role}, optimizing resources and predicting bottlenecks before they happen.`;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Fast and cost-effective
        messages: [
          {
            role: 'system',
            content: 'You are the marketing AI for "Scedge", a futuristic AI-powered project scheduling and resource optimization app. Write concise, impressive sentences (max 25 words) explaining why Scedge is valuable for specific roles. Focus on pain points like conflict resolution, timeline slippage, or resource burnout. Be professional yet visionary.'
          },
          {
            role: 'user',
            content: `Write a single, punchy sentence explaining why Scedge is a game-changer for a "${role}".`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating value proposition:', error);
      return `Scedge adapts to your workflow as a ${role}, optimizing resources and predicting bottlenecks before they happen.`;
    }
  },

  // Analyze text/content
  async analyzeContent(content, analysisType = 'summary') {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const prompts = {
        summary: 'Provide a concise summary of the following content:',
        sentiment: 'Analyze the sentiment of the following text (positive, negative, or neutral):',
        keyPoints: 'Extract the key points from the following content:'
      };

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides clear, concise analysis.'
          },
          {
            role: 'user',
            content: `${prompts[analysisType] || prompts.summary}\n\n${content}`
          }
        ],
        max_tokens: 200,
        temperature: 0.5
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  },

  // Generate insights from data
  async generateInsights(data, context = '') {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI analyst that provides actionable insights from data.'
          },
          {
            role: 'user',
            content: `Based on this data: ${JSON.stringify(data)}\n\nContext: ${context}\n\nProvide 3 key insights in bullet points.`
          }
        ],
        max_tokens: 300,
        temperature: 0.6
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }
};

