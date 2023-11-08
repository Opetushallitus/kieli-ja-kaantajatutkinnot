import { http } from 'msw';

import { APIEndpoints } from 'enums/api';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';

export const handlers = [
  http.get(
    APIEndpoints.Evaluations,
    () => new Response(JSON.stringify(evaluationPeriods), { status: 200 }),
  ),
  http.get(APIEndpoints.Evaluation, ({ params }) => {
    const { evaluationId } = params;
    const evaluationPeriod = evaluationPeriods.evaluation_periods.filter(
      (ep) => ep.id === Number(evaluationId),
    )[0];
    if (evaluationPeriod) {
      return new Response(JSON.stringify(evaluationPeriod), { status: 200 });
    } else {
      return new Response(null, { status: 404 });
    }
  }),
  http.get(
    APIEndpoints.ExamSessions,
    () => new Response(JSON.stringify(examSessions), { status: 200 }),
  ),
  http.post(
    APIEndpoints.EvaluationOrder,
    () =>
      new Response(JSON.stringify(evaluationOrderPostResponse), {
        status: 200,
      }),
  ),
];
