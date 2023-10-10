import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';

export const handlers = [
  rest.get(APIEndpoints.Evaluations, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(evaluationPeriods));
  }),
  rest.get(APIEndpoints.Evaluation, (req, res, ctx) => {
    const { evaluationId } = req.params;
    const evaluationPeriod = evaluationPeriods.evaluation_periods.filter(
      (ep) => ep.id === Number(evaluationId)
    )[0];
    if (evaluationPeriod) {
      return res(ctx.status(200), ctx.json(evaluationPeriod));
    } else {
      return res(ctx.status(404));
    }
  }),
  rest.get(APIEndpoints.ExamSessions, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(examSessions));
  }),
  rest.post(APIEndpoints.EvaluationOrder, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(evaluationOrderPostResponse));
  }),
];
