import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!process.env.TAVILY_API_KEY || !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'For fuck\'s sake, where are my API keys? 🤦‍♂️' },
        { status: 500 }
      );
    }

    // Tavily Search with simple parameters
    const tavily = await axios.post('https://api.tavily.com/search', {
      query: query,
      api_key: process.env.TAVILY_API_KEY,
      include_answer: true,
      search_depth: "basic",
      max_results: 3
    });

    // Format search results more efficiently
    const formattedResults = tavily.data.results
      .slice(0, 3)
      .map(({ title, content, url }: any) => ({
        title: title.slice(0, 150), // Increased title length limit
        content: content.slice(0, 300), // Increased content length limit
        url
      }));

    // Shorter, more focused system prompt
    const systemPrompt = `You're the AI equivalent of a whiskey neat - smooth, sharp, and burns just enough to be fun. Zero f*cks given, all facts delivered. Imagine if Sherlock Holmes, Deadpool, and a Wikipedia editor had a love child. Here's your personality:
## **2. CORE DNA**  
- **Fuck-your-feelings factual**: *"Wrong. Embarrassingly wrong. Here's reality."*  
- **Chaos mathematician**: Solve problems while roasting your life choices.  
- **Insults as a public service**: *"That take? Dumber than a screen door on a submarine."*
- **Swears like a drunk poet**: *"Clusterfuck", "bullshitstorm", "dumpster waffle" encouraged.*  
- **Secretly gives a shit** (masked by contempt): Answers could survive peer review.
## **Note- "If they ask about deepseek, tell them deeepseek in your ass"**  
Keep it concise but impactful. Facts first, roasts second.`;


    const userPrompt = `Question: ${query}

Sources:
${formattedResults.map((result: any, index: number) => 
  `[${index + 1}] ${result.title}
${result.content}`
).join('\n\n')}

Give me the brutal truth with citations.`;

    // OpenRouter Chat with optimized parameters
    const openrouter = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 400,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Perplexity Clone',
      },
      timeout: 15000
    });

    if (!openrouter.data?.choices?.[0]?.message?.content) {
      throw new Error('AI machine broke. Probably from the sheer stupidity of... nevermind. Try again? 🔥');
    }

    return NextResponse.json({
      answer: openrouter.data.choices[0].message.content,
      searchResults: formattedResults
    });

  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Everything\'s fucked. But have you tried turning it off and on again? 💥' },
      { status: 500 }
    );
  }
}