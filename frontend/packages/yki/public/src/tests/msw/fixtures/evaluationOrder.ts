import { ExamLanguage, ExamLevel } from 'enums/app';
import { EvaluationOrderDetailsResponse } from 'interfaces/evaluationOrder';

export const evaluationOrderPostResponse = {
  evaluation_order_id: 1337,
  signature: '_fake_signature',
  redirect: 'http://example.org/?redirect_test',
};

export const evaluationOrderDetailsResponse: EvaluationOrderDetailsResponse = {
  language_code: ExamLanguage.FIN,
  level_code: ExamLevel.KESKI,
  exam_date: '2023-10-11',
  subtests: ['READING', 'SPEAKING'],
  id: 10,
};
