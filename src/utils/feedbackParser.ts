/**
 * Parses a numerical score from a text section
 * @param text Text containing a score line
 * @returns Parsed score or 0 if no valid score found
 */
export function parseScore(text: string): number {
  const scoreMatch = text.match(/^SCORE:\s*(\d+(?:\.\d+)?)/m);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 0;
}

/**
 * Cleans and formats feedback content by removing headers, scores, and formatting
 * @param text Raw feedback text
 * @returns Array of cleaned feedback lines
 */
export function parseFeedbackLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line && 
      !line.match(/^SCORE:/i) &&
      !line.match(/^\d+\.\s+(?:Overall Score|Opener Analysis|Problem Proposition|Objection Handling|Engagement & Flow|Closing & Next Steps|Actionable Takeaways)/i)
    )
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(line => line);
}

/**
 * Extracts a specific section from the feedback text
 * @param text Complete feedback text
 * @param sectionHeader Header text that marks the start of the section
 * @param nextSectionHeader Optional header that marks the end of the section
 * @returns The extracted section text or empty string if not found
 */
export function extractSection(text: string, sectionHeader: string, nextSectionHeader?: string): string {
  const sectionRegex = new RegExp(
    `${sectionHeader}[:\\s]*(.*?)${nextSectionHeader ? `(?=${nextSectionHeader}|$)` : '$'}`,
    'si'
  );
  const match = text.match(sectionRegex);
  return match ? match[1].trim() : '';
}

/**
 * Extracts alternative suggestions from feedback text
 * @param text Section text containing alternatives
 * @param prefix The prefix that marks alternative suggestions (e.g., "Alternative:")
 * @returns The alternative suggestion or undefined if none found
 */
export function extractAlternative(text: string, prefix: string = 'Alternative:'): string | undefined {
  const match = text.match(new RegExp(`${prefix}\\s*(.+)`, 'i'));
  return match ? match[1].trim() : undefined;
}

/**
 * Parses a section of feedback into a structured format
 * @param text Section text to parse
 * @returns Object containing score, feedback lines, and optional alternative
 */
export function parseSectionFeedback(text: string, includeAlternative: boolean = true) {
  return {
    score: parseScore(text),
    feedback: parseFeedbackLines(text),
    ...(includeAlternative && {
      alternative: extractAlternative(text)
    })
  };
} 