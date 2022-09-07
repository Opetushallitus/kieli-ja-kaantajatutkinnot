import { rest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { clerkInterpreter } from 'tests/msw/fixtures/clerkInterpreter';
import { clerkInterpreterIndividualised } from 'tests/msw/fixtures/clerkInterpreterIndividualised';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';
import { meetingDates10 } from 'tests/msw/fixtures/meetingDates10';
import { person1, person2 } from 'tests/msw/fixtures/person';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';
import { qualification } from 'tests/msw/fixtures/qualification';
import {
  publishPermissionChangeResponse,
  qualificationRemoveResponse,
} from 'tests/msw/utils/clerkInterpreterOverview';

export const handlers = [
  rest.get(APIEndpoints.PublicInterpreter, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(publicInterpreters10));
  }),
  rest.get(APIEndpoints.ClerkInterpreter, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(clerkInterpreters10));
  }),
  rest.put(APIEndpoints.ClerkInterpreter, async (req, res, ctx) => {
    const interpreterDetails = await req.json();

    return res(
      ctx.status(200),
      ctx.json({
        ...interpreterDetails,
        qualifications: clerkInterpreter.qualifications,
      })
    );
  }),
  rest.get(
    `${APIEndpoints.ClerkInterpreter}/${clerkInterpreterIndividualised.id}`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(clerkInterpreterIndividualised));
    }
  ),
  rest.get(
    `${APIEndpoints.ClerkInterpreter}/${clerkInterpreter.id}`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(clerkInterpreter));
    }
  ),
  rest.post(
    `${APIEndpoints.ClerkInterpreter}/${clerkInterpreter.id}/qualification`,
    (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({
          ...clerkInterpreter,
          qualifications: [...clerkInterpreter.qualifications, qualification],
        })
      );
    }
  ),
  rest.put(APIEndpoints.Qualification, async (req, res, ctx) => {
    const { id, permissionToPublish } = await req.json();

    return res(
      ctx.status(200),
      ctx.json(
        publishPermissionChangeResponse(
          clerkInterpreter,
          id,
          !permissionToPublish
        )
      )
    );
  }),
  rest.delete(`${APIEndpoints.Qualification}/:id`, async (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json(
        qualificationRemoveResponse(clerkInterpreter, parseInt(id as string))
      )
    );
  }),
  rest.get(APIEndpoints.ClerkPersonSearch, (req, res, ctx) => {
    const identityNumber = req.url.searchParams.get('identityNumber');

    if (identityNumber === person1.identityNumber) {
      return res(ctx.status(200), ctx.json(person1));
    } else if (identityNumber === person2.identityNumber) {
      return res(ctx.status(200), ctx.json(person2));
    } else {
      return res(ctx.status(200));
    }
  }),
  rest.post(APIEndpoints.ClerkInterpreter, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(clerkInterpreter));
  }),
  rest.get(APIEndpoints.MeetingDate, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(meetingDates10));
  }),
];
