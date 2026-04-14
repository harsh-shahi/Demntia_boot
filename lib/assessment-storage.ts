const STORAGE_KEY = "assessment_results";

export interface AssessmentData {
  totalScore: number;
  breakdown: {
    digitSpan: number;
    delayedRecall: number;
    orientation: number;
  };
}

const defaultData: AssessmentData = {
  totalScore: 0,
  breakdown: { digitSpan: 0, delayedRecall: 0, orientation: 0 }
};

export const assessmentStorage = {
  // Get existing data or return a default empty state
  get: (): AssessmentData => {
    if (typeof window === "undefined") return defaultData;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultData;
  },

  // Update a specific test score and increment the total
  saveScore: (testType: keyof AssessmentData["breakdown"], score: number) => {
    const data = assessmentStorage.get();
    
    /**
     * LOGIC:
     * 1. Remove the previous score for THIS specific test from the totalScore 
     * (This prevents double-adding if the user retakes a section).
     * 2. Set the new score in the breakdown.
     * 3. Add the new score to the totalScore.
     */
    data.totalScore = (data.totalScore - data.breakdown[testType]) + score;
    data.breakdown[testType] = score;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Reset everything for a new test
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};