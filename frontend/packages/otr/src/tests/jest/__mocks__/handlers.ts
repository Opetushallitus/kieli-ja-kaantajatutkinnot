import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { publicInterpreters10 } from 'tests/jest/__fixtures__/publicInterpreters10';

export const handlers = [
  rest.get(APIEndpoints.PublicInterpreter, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(publicInterpreters10));
  }),
];
