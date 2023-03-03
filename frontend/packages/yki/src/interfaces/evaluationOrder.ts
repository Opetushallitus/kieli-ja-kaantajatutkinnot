export interface ExaminationParts {
  readingComprehension: boolean;
  speechComprehension: boolean;
  speaking: boolean;
  writing: boolean;
}

// TODO Unused?
export interface EvaluationOrder {
  examinationParts: ExaminationParts;
}
