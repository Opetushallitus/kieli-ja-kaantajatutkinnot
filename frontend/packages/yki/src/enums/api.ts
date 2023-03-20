export enum APIEndpoints {
  ExamSessions = '/yki/api/exam-session',
  ExamSession = '/yki/api/exam-session/:examSessionId',
  Evaluations = '/yki/api/evaluation',
  Evaluation = '/yki/api/evaluation/:evaluationId',
  EvaluationOrder = '/yki/api/evaluation/:evaluationId/order',
  EvaluationPaymentRedirect = '/yki/api/evaluation-payment/v2/:evaluationOrderId/redirect',
}
