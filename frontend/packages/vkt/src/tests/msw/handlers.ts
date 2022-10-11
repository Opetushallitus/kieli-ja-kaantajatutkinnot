import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { clerkExamEvents9 } from 'tests/msw/fixtures/clerkExamEvents9';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

export const handlers = [
  rest.get(APIEndpoints.PublicExamEvent, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(publicExamEvents11));
  }),
  rest.get(APIEndpoints.ClerkExamEvent, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(clerkExamEvents9));
  }),
];
