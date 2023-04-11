export enum APIEndpoints {
  ExamSessions = '/yki/api/exam-session',
  ExamSession = '/yki/api/exam-session/:examSessionId',
  Evaluations = '/yki/api/evaluation',
  Evaluation = '/yki/api/evaluation/:evaluationId',
  EvaluationOrder = '/yki/api/evaluation/:evaluationId/order',
  InitRegistration = '/yki/api/registration/init',
  LoginLink = '/yki/api/login-link',
  SubmitRegistration = '/yki/api/registration/:registrationId/submit',
  SuomiFiAuthRedirect = '/yki/auth/',
}
