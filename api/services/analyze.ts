import OpenAI from 'openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import env from '../../src/config/env';
import { extractSection, parseSectionFeedback } from '../../src/utils/feedbackParser';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

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
    // ... transcription logic ...

    const feedbackText = ''; // Your feedback text from OpenAI
    
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

    return result;
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw error;
  }
} 