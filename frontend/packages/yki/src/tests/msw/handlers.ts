import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { evaluationOrderResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';

export const handlers = [
  rest.get(APIEndpoints.Evaluations, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(evaluationPeriods));
  }),
  rest.get(APIEndpoints.ExamSessions, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(examSessions));
  }),
  rest.post(APIEndpoints.EvaluationOrder, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(evaluationOrderResponse));
  }),
];
