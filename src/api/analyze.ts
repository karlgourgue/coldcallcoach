import OpenAI from 'openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import env from '../config/env';
import { extractSection, parseSectionFeedback } from '../utils/feedbackParser';

// Debug logging (will only show first few characters for security)
console.log('Initializing OpenAI client with key:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
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

    const feedbackText = analysis;
    
    // Parse each section using the utility functions
    const overallSection = extractSection(feedbackText, '1. Overall Score', '2.');
    const openerSection = extractSection(feedbackText, '2. Opener Analysis', '3.');
    const propositionSection = extractSection(feedbackText, '3. Problem Proposition', '4.');
    const objectionSection = extractSection(feedbackText, '4. Objection Handling', '5.');
    const engagementSection = extractSection(feedbackText, '5. Engagement & Flow', '6.');
    const closingSection = extractSection(feedbackText, '6. Closing & Next Steps', '7.');
    const takeawaysSection = extractSection(feedbackText, '7. Actionable Takeaways');

    const result: FeedbackResult = {
      overallScore: {
        ...parseSectionFeedback(overallSection, false),
        summary: overallSection
      },
      openerAnalysis: {
        ...parseSectionFeedback(openerSection),
        alternativeOpener: parseSectionFeedback(openerSection).alternative
      },
      problemProposition: {
        ...parseSectionFeedback(propositionSection),
        alternativeProposition: parseSectionFeedback(propositionSection).alternative
      },
      objectionHandling: {
        ...parseSectionFeedback(objectionSection),
        alternativeFramework: parseSectionFeedback(objectionSection).alternative
      },
      engagementAndFlow: {
        ...parseSectionFeedback(engagementSection),
        recommendations: parseSectionFeedback(engagementSection).feedback
      },
      closingAndNextSteps: {
        ...parseSectionFeedback(closingSection),
        alternativeClosing: parseSectionFeedback(closingSection).alternative
      },
      actionableTakeaways: {
        improvements: parseSectionFeedback(takeawaysSection, false).feedback,
        scriptExample: extractSection(takeawaysSection, 'Example Script:')
      }
    };

    console.log('Feedback parsed successfully');
    return result;
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw error;
  }
} 