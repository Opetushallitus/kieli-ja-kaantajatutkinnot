// exported in cypress which is excluded from root tsconfig.json
// so would give error otherwise
// ts-unused-exports:disable-next-line
export type FreeRegistrationBasis =
  | 'MatriculationExam'
  | 'HigherEducationDegree'
  | 'HigherEducationStudies'
  | 'ComparableMatriculation'
  | 'ComparableHigherEducationDegree'
  | 'ComparableHigherEducationStudies';
  