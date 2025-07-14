import { http, HttpResponse, PathParams } from 'msw';

import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { PublicRegistrationInitRequest } from 'interfaces/publicRegistration';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';
import {
  NoSessionResponse,
  //SuomiFiAuthenticatedSessionResponse,
} from 'tests/msw/fixtures/identity';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { personDetails } from 'tests/msw/fixtures/personDetails';
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

const data = {
  evaluationPeriods,
  examSessions,
  personDetails,
};

const notFound = () => new HttpResponse(null, { status: 404 });

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
    //return HttpResponse.json(SuomiFiAuthenticatedSessionResponse);
    return HttpResponse.json(NoSessionResponse);
  }),
  http.post(APIEndpoints.EvaluationOrder, () =>
    HttpResponse.json(evaluationOrderPostResponse),
  ),
  http.get(APIEndpoints.CountryCodes, () =>
    HttpResponse.json(maatJaValtiot2Response),
  ),
  http.post(APIEndpoints.SubmitRegistration, ({ params }) => {
    const { registrationId } = params;
    const queued = Number(registrationId) % 2 === 1;

    return HttpResponse.json({
      success: true,
      code: 'foobar-123-' + (queued ? 'queue' : 'admission'),
      registration_kind: queued ? 'QUEUE' : 'ADMISSION',
    });
  }),
  http.get(
    APIEndpoints.PersonDetails,
    () => HttpResponse.json(data.personDetails),
    // () => HttpResponse.json('Unauthorized', { status: 401 }),
  ),
  http.delete(APIEndpoints.CancelUserRegistration, ({ params }) => {
    const { registrationId } = params;
    if (registrationId) {
      if (registrationId === '1339') {
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
    async ({ request }) => {
      const { exam_session_id } = await request.json();
      switch (exam_session_id) {
        // exam sessions with ids 2 through 5 are for simulating different error conditions
        case 2:
          return HttpResponse.json(
            { error: { registered: true } },
            { status: 409 },
          );
        case 3:
          return HttpResponse.json(
            { error: { closed: true } },
            { status: 409 },
          );
        // This error case shouldn't ordinarily happen
        case 4:
          return HttpResponse.json(
            { error: { full: false, registered: false } },
            { status: 409 },
          );
        case 5:
          return HttpResponse.json('Unauthorized', { status: 401 });
        default:
          // For odd values, simulate a full exam session, ie. user is enrolling to queue
          // For even values, allow registering to exam session proper
          const {
            exam_session,
            registration_kind: _registration_kind,
            registration_id: _registration_id,
            ...rest
          } = registrationInitResponse;
          const kind =
            exam_session_id % 2 === 0
              ? RegistrationKind.Admission
              : RegistrationKind.Queue;

          return HttpResponse.json(
            {
              exam_session: {
                ...exam_session,
                available_registration_kind: kind,
              },
              registration_kind: kind,
              // Mock registration id to match exam session id.
              // This is so that we can in the registration submit endpoint
              // return different registration kind (admission vs. queue)
              // based on the parity of registration id.
              registration_id: exam_session_id,
              ...rest,
            },
            /*exam_session_id % 2 === 0
              ? initRegistrationEmailAuth
              : registrationInitResponse,
              */
          );
      }
    },
  ),
  http.get(APIEndpoints.Logout, ({ request }) => {
    const url = new URL(request.url);
    const redirect = url.searchParams.get('redirect');

    return HttpResponse.redirect(redirect as string);
  }),
];
