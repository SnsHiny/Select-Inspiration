
export interface DecisionOption {
  id: string;
  text: string;
}

export interface AIRecommendation {
  choice: string;
  reason: string;
  pros: string[];
  cons: string[];
}

export enum AppMode {
  RANDOM = 'RANDOM',
  AI_EXPERT = 'AI_EXPERT'
}
