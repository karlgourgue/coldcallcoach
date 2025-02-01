export interface FeedbackResult {
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

export type FeedbackSection = 'strengths' | 'improvements' | 'recommendations'; 