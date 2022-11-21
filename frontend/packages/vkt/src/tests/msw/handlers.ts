import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { clerkExamEvent } from 'tests/msw/fixtures/clerkExamEvent';
import { clerkExamEvents9 } from 'tests/msw/fixtures/clerkExamEvents9';
import { person } from 'tests/msw/fixtures/person';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

export const handlers = [
  rest.get(APIEndpoints.PublicExamEvent, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(publicExamEvents11));
  }),
  rest.post(
    `${APIEndpoints.PublicExamEvent}/2/reservation`,
    (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({
          id: 1,
          expiresAt: Date.now() + 60 * 1000,
          examEvent: publicExamEvents11[1],
          person,
        })
      );
    }
  ),
  rest.post(
    `${APIEndpoints.PublicExamEvent}/5/reservation`,
    (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({
          id: 2,
          expiresAt: Date.now() + 60 * 1000,
          examEvent: publicExamEvents11[4],
          person,
        })
      );
    }
  ),
  rest.post(
    `${APIEndpoints.PublicExamEvent}/10/reservation`,
    (req, res, ctx) => {
      const errorCode = 'createReservationCongestion';

      return res(ctx.status(400), ctx.json({ errorCode }));
    }
  ),
  rest.post(
    `${APIEndpoints.PublicExamEvent}/11/reservation`,
    (req, res, ctx) => {
      const errorCode = 'createReservationRegistrationClosed';

      return res(ctx.status(400), ctx.json({ errorCode }));
    }
  ),
  rest.get(APIEndpoints.ClerkExamEvent, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(clerkExamEvents9));
  }),
  rest.get(`${APIEndpoints.ClerkExamEvent}/1`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(clerkExamEvent));
  }),
  rest.put(APIEndpoints.ClerkExamEvent, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...clerkExamEvent,
        language: 'SV',
      })
    );
  }),
];
