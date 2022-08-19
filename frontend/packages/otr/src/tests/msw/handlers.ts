import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';
import { meetingDates10 } from 'tests/msw/fixtures/meetingDates10';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

export const handlers = [
  rest.get(APIEndpoints.PublicInterpreter, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(publicInterpreters10));
  }),
  rest.get(APIEndpoints.ClerkInterpreter, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(clerkInterpreters10));
  }),
  rest.get(APIEndpoints.MeetingDate, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(meetingDates10));
  }),
];
