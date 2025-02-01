import OpenAI from 'openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Debug logging (will only show first few characters for security)
console.log('Initializing OpenAI client with key:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verify the API key is set
if (!openai.apiKey) {
  throw new Error('OpenAI API key is not set');
}

interface FeedbackResult {
  overallScore: {
    score: number;
    summary: string;
  };
  openerAnalysis: {
    score: number;
    feedback: string[];
    alternativeOpener?: string;
  };
  problemProposition: {
    score: number;
    feedback: string[];
    alternativeProposition?: string;
  };
  objectionHandling: {
    score: number;
    feedback: string[];
    alternativeFramework?: string;
  };
  engagementAndFlow: {
    score: number;
    feedback: string[];
    recommendations: string[];
  };
  closingAndNextSteps: {
    score: number;
    feedback: string[];
    alternativeClosing?: string;
  };
  actionableTakeaways: {
    improvements: string[];
    scriptExample: string;
  };
}

function parseScore(text: string): number {
  // Look for a line that starts with "SCORE:" followed by a number
  const scoreMatch = text.match(/^SCORE:\s*(\d+(?:\.\d+)?)/m);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 0;
}

function parseSectionContent(text: string): string[] {
  return text
    .split(/\n+/)
    .map(line => line.trim())
    // Filter out score lines and section headers
    .filter(line => line && 
      !line.match(/^SCORE:/i) &&
      !line.match(/^\d+\.\s+(?:Overall Score|Opener Analysis|Problem Proposition|Objection Handling|Engagement & Flow|Closing & Next Steps|Actionable Takeaways)/i)
    )
    // Remove bullet points and trim
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    // Filter out empty lines after processing
    .filter(line => line);
}

export async function analyzeAudio(audioFile: File) {
  try {
    console.log('Starting transcription...');
    // First, transcribe the audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "text"
    });

    console.log('Transcription complete. Length:', transcription.length);
    console.log('Sample of transcription:', transcription.slice(0, 100) + '...');

    const systemPrompt = `Analyze the following cold call transcript and provide a structured assessment based on the framework from Cold Calling Sucks (And That's Why It Works) by Armand Farrokh and Nick Cegelski. 

Context: The caller represents Opus Training, a mobile-first learning management system (LMS) designed for deskless workers in industries like hospitality, retail, and manufacturing. Opus Training helps businesses streamline onboarding, upskill employees, and ensure compliance through bite-sized, easy-to-access training modules delivered directly to workers' phones. The platform emphasizes simplicity, speed, and real-time tracking to meet the unique needs of frontline teams, driving productivity and reducing turnover.

Break down the analysis into the following sections. For each section, start with "SCORE: X" on its own line where X is the score out of 10:

1. Overall Score & Summary
SCORE: X
• Brief summary of the call's strengths and weaknesses in 2-3 sentences.

2. Opener Analysis
SCORE: X
• Did the rep establish context and credibility quickly?
• Was the opening question engaging, or did it lead to immediate resistance?
• Suggest a stronger alternative opener if needed.

3. Problem Proposition
SCORE: X
• Did the rep introduce a compelling problem that resonates with the prospect?
• Was the problem framed in a way that made the solution feel necessary and urgent?
• Provide a more effective problem proposition statement if applicable.

4. Objection Handling
SCORE: X
• Did the rep acknowledge, explore, and reframe objections effectively?
• Were objections handled with curiosity and control, or did the conversation stall?
• Suggest a better response framework for any missed objections.

5. Engagement & Flow
SCORE: X
• Did the prospect actively engage, or did they shut down quickly?
• Were there moments of rapport-building or did the call feel transactional?
• Recommend ways to make the call more conversational and prospect-driven.

6. Closing & Next Steps
SCORE: X
• Did the rep secure a clear next step (e.g., meeting, follow-up, interest confirmation)?
• Was there a sense of urgency and value in the ask?
• Suggest a stronger closing statement if needed.

7. Actionable Takeaways
• Provide three concise recommendations the rep can implement immediately.
• Offer one alternative script example for a key section that needs improvement.

Be direct, tactical, and specific. Focus on actionable feedback rather than generic advice. The caller's name is Karl, and you should refer to him as Karl and you in your notes. When suggesting alternatives, make sure they specifically reference Opus Training's unique value propositions around mobile-first learning, bite-sized modules, and real-time tracking for frontline teams.

Format your response with clear section headings and bullet points for easy parsing. Remember to start each scored section with "SCORE: X" on its own line.`;

    const userPrompt = `Please analyze this cold call transcription:\n\n${transcription}`;

    console.log('\nPrompts being sent to OpenAI:');
    console.log('System prompt:', systemPrompt);
    console.log('User prompt:', userPrompt);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    console.log('Starting analysis with GPT-4...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content;
    if (!analysis) {
      throw new Error('No analysis generated');
    }
    
    console.log('Analysis complete. Raw response:', analysis);

    // Split the analysis into sections
    const sections = analysis.split(/\n(?=\d+\.\s+(?:Overall|Opener|Problem|Objection|Engagement|Closing|Actionable))/);
    
    const feedback: FeedbackResult = {
      overallScore: { score: 0, summary: '' },
      openerAnalysis: { score: 0, feedback: [] },
      problemProposition: { score: 0, feedback: [] },
      objectionHandling: { score: 0, feedback: [] },
      engagementAndFlow: { score: 0, feedback: [], recommendations: [] },
      closingAndNextSteps: { score: 0, feedback: [] },
      actionableTakeaways: { improvements: [], scriptExample: '' }
    };

    sections.forEach(section => {
      const trimmedSection = section.trim();
      if (trimmedSection.match(/Overall Score/i)) {
        const lines = parseSectionContent(trimmedSection);
        feedback.overallScore.score = parseScore(trimmedSection);
        feedback.overallScore.summary = lines.join(' ');
      } else if (trimmedSection.match(/Opener Analysis/i)) {
        feedback.openerAnalysis.score = parseScore(trimmedSection);
        feedback.openerAnalysis.feedback = parseSectionContent(trimmedSection);
        const altOpener = trimmedSection.match(/Suggest(?:ed)? (?:a )?stronger alternative opener:?\s*([^\n]+)/i);
        if (altOpener) feedback.openerAnalysis.alternativeOpener = altOpener[1];
      } else if (trimmedSection.match(/Problem Proposition/i)) {
        feedback.problemProposition.score = parseScore(trimmedSection);
        feedback.problemProposition.feedback = parseSectionContent(trimmedSection);
        const altProp = trimmedSection.match(/(?:Provide|Suggest)(?:ed)? (?:a )?more effective (?:problem )?proposition:?\s*([^\n]+)/i);
        if (altProp) feedback.problemProposition.alternativeProposition = altProp[1];
      } else if (trimmedSection.match(/Objection Handling/i)) {
        feedback.objectionHandling.score = parseScore(trimmedSection);
        feedback.objectionHandling.feedback = parseSectionContent(trimmedSection);
        const altFrame = trimmedSection.match(/Suggest(?:ed)? (?:a )?better response framework:?\s*([^\n]+)/i);
        if (altFrame) feedback.objectionHandling.alternativeFramework = altFrame[1];
      } else if (trimmedSection.match(/Engagement & Flow/i)) {
        feedback.engagementAndFlow.score = parseScore(trimmedSection);
        const content = parseSectionContent(trimmedSection);
        feedback.engagementAndFlow.feedback = content.filter(item => !item.startsWith('Recommend'));
        feedback.engagementAndFlow.recommendations = content.filter(item => item.startsWith('Recommend')).map(item => item.replace(/^Recommend:?\s*/, ''));
      } else if (trimmedSection.match(/Closing & Next Steps/i)) {
        feedback.closingAndNextSteps.score = parseScore(trimmedSection);
        feedback.closingAndNextSteps.feedback = parseSectionContent(trimmedSection);
        const altClose = trimmedSection.match(/Suggest(?:ed)? (?:a )?stronger closing:?\s*([^\n]+)/i);
        if (altClose) feedback.closingAndNextSteps.alternativeClosing = altClose[1];
      } else if (trimmedSection.match(/Actionable Takeaways/i)) {
        const content = parseSectionContent(trimmedSection);
        feedback.actionableTakeaways.improvements = content.filter(item => !item.includes('script'));
        const scriptExample = content.find(item => item.includes('script'));
        if (scriptExample) feedback.actionableTakeaways.scriptExample = scriptExample;
      }
    });

    console.log('Feedback parsed successfully');
    return feedback;
  } catch (error) {
    console.error('Error in analyzeAudio:', error);
    throw error;
  }
} 