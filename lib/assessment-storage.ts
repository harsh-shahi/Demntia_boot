const STORAGE_KEY = "assessment_results";

export interface AssessmentData {
  totalScore: number;
  breakdown: {
    // Current breakdown keys matching your Home page handleNext calls
    orientation: number;
    memory: number;
    digitSpan: number;
    recall: number;
    naming: number;
    fluency: number;
    command: number;
    drawing: number;
    stroop: number;
  };
}

const defaultData: AssessmentData = {
  totalScore: 0,
  breakdown: {
    orientation: 0,
    memory: 0,
    digitSpan: 0,
    recall: 0,
    naming: 0,
    fluency: 0,
    command: 0,
    drawing: 0,
    stroop: 0,
  }
};

export const assessmentStorage = {
  get: (): AssessmentData => {
    if (typeof window === "undefined") return defaultData;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultData;
  },

  saveScore: (testType: keyof AssessmentData["breakdown"], score: number) => {
    const data = assessmentStorage.get();
    
    /**
     * LOGIC:
     * We subtract the old value for this specific key and add the new one.
     * This ensures if a user hits "Back" or "Restart" within a session, 
     * the total score remains accurate.
     */
    const oldScore = data.breakdown[testType] || 0;
    data.totalScore = (data.totalScore - oldScore) + score;
    data.breakdown[testType] = score;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};