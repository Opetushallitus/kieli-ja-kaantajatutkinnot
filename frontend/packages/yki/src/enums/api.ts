export enum APIEndpoints {
  CountryCodes = '/yki/api/code/maatjavaltiot2',
  ExamSessions = '/yki/api/exam-session',
  ExamSession = '/yki/api/exam-session/:examSessionId',
  ExamSessionQueue = '/yki/api/exam-session/:examSessionId/queue',
  Evaluations = '/yki/api/evaluation',
  Evaluation = '/yki/api/evaluation/:evaluationId',
  EvaluationOrder = '/yki/api/evaluation/:evaluationId/order',
  EvaluationOrderDetails = '/yki/api/evaluation/order/:evaluationOrderId',
  InitRegistration = '/yki/api/registration/init',
  LoginLink = '/yki/api/login-link',
  Logout = '/yki/auth/logout',
  SubmitRegistration = '/yki/api/registration/:registrationId/submit',
  SuomiFiAuthRedirect = '/yki/auth/',
}

export enum PaymentStatus {
  Success = 'payment-success',
  Cancel = 'payment-cancel',
  Error = 'payment-error',
}
