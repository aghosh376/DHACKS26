export interface RedditEvalResult {
  score: number;
  summary: string;
  commentCount: number;
  evaluatedAt: Date;
}

export declare function evaluateProfessorsFromReddit(
  redditOutput: Record<string, string[]>,
  geminiApiKey: string
): Promise<Record<string, RedditEvalResult>>;
