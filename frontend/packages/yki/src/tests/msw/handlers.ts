import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { examSessions } from 'tests/msw/fixtures/examSession';

export const handlers = [
  rest.get(APIEndpoints.ExamSessions, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(examSessions));
  }),
];
