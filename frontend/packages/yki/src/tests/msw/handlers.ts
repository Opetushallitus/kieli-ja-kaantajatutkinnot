import dayjs from 'dayjs';
import { http, HttpResponse, PathParams, StrictRequest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { PublicRegistrationInitRequest } from 'interfaces/publicRegistration';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { customerDetails } from 'tests/msw/fixtures/customerDetails';
import { allCustomers } from 'tests/msw/fixtures/customersSearch';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { findByOidsResponse } from 'tests/msw/fixtures/findByOids';
import { freeRegistrationDetails } from 'tests/msw/fixtures/freeRegistrationDetails';
import { freeRegistrations } from 'tests/msw/fixtures/freeRegistrations';
import {
  //NoSessionResponse,
  SuomiFiAuthenticatedSessionResponse,
} from 'tests/msw/fixtures/identity';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { organizers } from 'tests/msw/fixtures/organizers';
import { personDetails } from 'tests/msw/fixtures/personDetails';
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

interface FreeRegistrationRequest {
  approved: boolean;
}

const data = {
  evaluationPeriods,
  examSessions,
  personDetails,
};

const notFound = () => new HttpResponse(null, { status: 404 });

const initRegistration = async ({
  request,
}: {
  request: StrictRequest<PublicRegistrationInitRequest>;
}) => {
  const { exam_session_id } = await request.json();
  switch (exam_session_id) {
    // exam sessions with ids 2 through 7 are for simulating different error conditions
    case 2:
      return HttpResponse.json(
        {
          error: {
            'other-exam-session-registration': {
              id: 99,
              state: 'SUBMITTED',
            },
          },
        },
        { status: 409 },
      );
    case 3:
      return HttpResponse.json({ error: { closed: true } }, { status: 409 });
    // This error case shouldn't ordinarily happen
    case 4:
      return HttpResponse.json(
        { error: { full: false, registered: false } },
        { status: 409 },
      );
    case 5:
      return HttpResponse.json('Unauthorized', { status: 401 });
    case 6:
      return HttpResponse.json({ error: { full: true } }, { status: 409 });
    default:
      // For odd values, simulate a full exam session, ie. user is enrolling to queue
      // For even values, allow registering to exam session proper
      const {
        exam_session,
        registration_kind: _registration_kind,
        registration_id: _registration_id,
        ...rest
      } = registrationInitResponse;
      const examSession =
        examSessions.exam_sessions.find((v) => v.id === exam_session_id) ||
        exam_session;
      const kind =
        exam_session_id % 2 === 0
          ? RegistrationKind.Admission
          : RegistrationKind.Queue;
      const thirtyMinutesInSeconds = 1800;
      const expires_in =
        exam_session_id % 2 === 0 ? thirtyMinutesInSeconds : undefined;

      return HttpResponse.json(
        {
          exam_session: {
            ...examSession,
            available_registration_kind: kind,
          },
          registration_kind: kind,
          // Mock registration id to match exam session id.
          // This is so that we can in the registration submit endpoint
          // return different registration kind (admission vs. queue)
          // based on the parity of registration id.
          registration_id: exam_session_id,
          expires_in,
          ...rest,
        },
        /*exam_session_id % 2 === 0
              ? initRegistrationEmailAuth
              : registrationInitResponse,
              */
      );
  }
};

export const handlers = [
  http.get(APIEndpoints.Evaluations, () =>
    HttpResponse.json(evaluationPeriods),
  ),
  http.get(APIEndpoints.Evaluation, ({ params }) => {
    const { evaluationId } = params;
    const evaluationPeriod = evaluationPeriods.evaluation_periods.filter(
      (ep) => ep.id === Number(evaluationId),
    )[0];
    if (evaluationPeriod) {
      return HttpResponse.json(evaluationPeriod);
    } else {
      return notFound();
    }
  }),
  http.get(
    APIEndpoints.ExamSessions,
    () => new Response(JSON.stringify(examSessions), { status: 200 }),
  ),
  http.get(APIEndpoints.ExamSession, ({ params }) => {
    const { examSessionId } = params;
    const examSession = examSessions.exam_sessions.find(
      (es) => es.id === Number(examSessionId),
    );
    if (examSession) {
      return HttpResponse.json(examSession);
    } else {
      return notFound();
    }
  }),
  http.get(APIEndpoints.User, () => {
    return HttpResponse.json(SuomiFiAuthenticatedSessionResponse);
    //return HttpResponse.json(NoSessionResponse);
  }),
  http.post(APIEndpoints.EvaluationOrder, () =>
    HttpResponse.json(evaluationOrderPostResponse),
  ),
  http.get(APIEndpoints.CountryCodes, () =>
    HttpResponse.json(maatJaValtiot2Response),
  ),
  http.post(APIEndpoints.SubmitRegistration, async ({ params, request }) => {
    const { registrationId } = params;
    const queued = Number(registrationId) % 2 === 1;
    const body = await request.clone().json();
    const state =
      !queued && !!body.free_registration_id ? 'COMPLETED' : 'SUBMITTED';

    return HttpResponse.json({
      success: true,
      code: 'foobar-123-' + (queued ? 'queue' : 'admission'),
      registration_kind: queued ? 'QUEUE' : 'ADMISSION',
      state,
    });
  }),
  http.get(
    APIEndpoints.PersonDetails,
    () => HttpResponse.json(data.personDetails),
    // () => HttpResponse.json('Unauthorized', { status: 401 }),
  ),
  http.post(APIEndpoints.PersonDetails, () =>
    HttpResponse.json({ success: true }),
  ),
  http.delete(APIEndpoints.CancelUserRegistration, ({ params }) => {
    const { registrationId } = params;
    if (registrationId) {
      if (registrationId === '1338') {
        return HttpResponse.json({ success: false });
      }

      data.personDetails = {
        ...data.personDetails,
        registrations: data.personDetails.registrations.filter(
          (r) => `${r.id}` !== registrationId,
        ),
      };
    }

    return HttpResponse.json({ success: true });
  }),
  http.post<PathParams, PublicRegistrationInitRequest>(
    APIEndpoints.InitRegistration,
    initRegistration,
  ),
  http.post<PathParams, PublicRegistrationInitRequest>(
    APIEndpoints.IdentifyRegistration,
    initRegistration,
  ),
  http.get(APIEndpoints.Logout, ({ request }) => {
    const url = new URL(request.url);
    const redirect = url.searchParams.get('redirect');

    return HttpResponse.redirect(redirect as string);
  }),
  http.get(APIEndpoints.ClerkOrganizer, () => HttpResponse.json(organizers)),
  http.put(
    `${APIEndpoints.ClerkOrganizer}/:id`,
    async ({ params, request }) => {
      const organizerId = Number(params.id);
      const updatedData = (await request.json()) as Record<string, unknown>;
      const organizerIndex = organizers.findIndex((o) => o.id === organizerId);

      if (organizerIndex !== -1) {
        organizers[organizerIndex] = {
          ...organizers[organizerIndex],
          ...updatedData,
        };

        return HttpResponse.json(organizers[organizerIndex]);
      } else {
        return notFound();
      }
    },
  ),
  http.get(APIEndpoints.ClerkFreeRegistration, ({ cookies }) => {
    if (cookies['free-registration-error-500'] === '1') {
      return HttpResponse.json({ error: 'forced error' }, { status: 500 });
    }

    return HttpResponse.json(freeRegistrations);
  }),
  http.get(APIEndpoints.ClerkFreeRegistrationDetails, ({ params }) => {
    const index = params?.id ? Number(params.id) - 1 : NaN;
    if (index >= 0) {
      return HttpResponse.json(freeRegistrationDetails[index]);
    } else {
      return notFound();
    }
  }),
  http.put(
    APIEndpoints.ClerkFreeRegistrationDetails,
    async ({ params, request }) => {
      const index = params?.id ? Number(params.id) - 1 : NaN;
      const { approved } = (await request.json()) as FreeRegistrationRequest;
      const response = freeRegistrationDetails[index];

      if (index >= 0) {
        return HttpResponse.json({
          ...response,
          status: approved ? 'APPROVED' : 'REJECTED',
        });
      } else {
        return notFound();
      }
    },
  ),
  http.post(APIEndpoints.ClerkFreeRegistrationSupplementRequest, () => {
    return HttpResponse.json({ success: true });
  }),
  http.post(
    APIEndpoints.ClerkFreeRegistrationDetailsMessages,
    ({ cookies }) => {
      if (cookies['error'] === '1') {
        return HttpResponse.json({ error: 'forced error' }, { status: 500 });
      }

      return HttpResponse.json({ success: true });
    },
  ),
  http.get(APIEndpoints.ClerkCustomerDetails, ({ params }) => {
    const oid = params?.oid as string | undefined;
    const details = customerDetails.find((cd) => cd.person.oid === oid);
    if (details) {
      return HttpResponse.json(details);
    } else {
      return notFound();
    }
  }),
  http.get(APIEndpoints.ClerkExamSession, () =>
    HttpResponse.json(clerkExamSession),
  ),
  http.post(APIEndpoints.ClerkCustomersSearch, async ({ request }) => {
    const url = new URL(request.url);
    const getNumberParam = (urlParam: string, fallback: number) => {
      const param = Number(url.searchParams.get(urlParam));

      return Number.isFinite(param) && param >= 0 ? param : fallback;
    };

    const page = getNumberParam('page', 0);
    const size = getNumberParam('size', 20);

    // Emulating pagination
    const filtered = allCustomers; // return every customer, for testing
    const start = page * size;
    const paged = filtered.slice(start, start + size);
    const totalElements = filtered.length;
    const totalPages = size > 0 ? Math.ceil(totalElements / size) : 0;
    const sort = { empty: true, unsorted: true, sorted: false };

    return HttpResponse.json({
      content: paged,
      pageable: {
        sort,
        offset: start,
        pageNumber: page,
        pageSize: size,
        paged: true,
        unpaged: false,
      },
      last: totalPages === 0 ? true : page >= totalPages - 1,
      totalElements,
      totalPages,
      size,
      number: page,
      sort,
      first: page === 0,
      numberOfElements: paged.length,
      empty: paged.length === 0,
    });
  }),
  http.get(APIEndpoints.PublicKoskiEducations, async () => {
    return HttpResponse.json({
      educations: [{ educationType: 'ylioppilastutkinto', isActive: true }],
      usedFreeRegistrations: 2,
    });
  }),
  http.post(APIEndpoints.PublicFreeRegistrationEducation, () => {
    return HttpResponse.json({ id: 1337 }, { status: 201 });
  }),
  http.post('/organisaatio-service/rest/organisaatio/v3/findbyoids', () => {
    return HttpResponse.json(findByOidsResponse);
  }),

  http.get('/yki/api/clerk/organizer/:oid/exam-session', ({ params }) => {
    const { from } = params;

    const filteredExamSessions = from
      ? examSessions.exam_sessions.filter((e) => {
          return (
            dayjs().isSame(dayjs(e.session_date), 'day') ||
            dayjs().isAfter(dayjs(e.session_date), 'day')
          );
        })
      : examSessions.exam_sessions;

    return HttpResponse.json({ exam_sessions: filteredExamSessions });
    // all exam dates
    // return HttpResponse.json({ dates: examDates.dates });
  }),
];
