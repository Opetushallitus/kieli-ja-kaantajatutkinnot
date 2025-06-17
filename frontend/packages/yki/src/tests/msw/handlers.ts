import { http, HttpResponse, PathParams } from 'msw';

import { APIEndpoints } from 'enums/api';
import { PublicRegistrationInitRequest } from 'interfaces/publicRegistration';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { NoSessionResponse } from 'tests/msw/fixtures/identity';
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
    return HttpResponse.json(NoSessionResponse);
  }),
  http.post(APIEndpoints.EvaluationOrder, () =>
    HttpResponse.json(evaluationOrderPostResponse),
  ),
  http.get(APIEndpoints.CountryCodes, () =>
    HttpResponse.json(maatJaValtiot2Response),
  ),
  http.post(APIEndpoints.SubmitRegistration, () =>
    HttpResponse.json({ success: true }),
  ),
  http.get(APIEndpoints.PersonDetails, () =>
    HttpResponse.json(data.personDetails),
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
        case 11:
          return HttpResponse.json(
            { error: { registered: true } },
            { status: 409 },
          );
        case 12:
          // TODO
          // return HttpResponse.json(initRegistrationQueueEmailAuth);
          return HttpResponse.json(registrationInitResponse);
        case 13:
          return HttpResponse.json(
            { error: { closed: true } },
            { status: 409 },
          );
        // This error case shouldn't ordinarily happen
        case 14:
          return HttpResponse.json(
            { error: { full: false, registered: false } },
            { status: 409 },
          );
        case 16:
          return HttpResponse.json('Unauthorized', { status: 401 });
        case 17:
          // TODO
          // return HttpResponse.json(initRegistrationQueue);
          return HttpResponse.json(registrationInitResponse);
        default:
          // TODO
          return HttpResponse.json(
            registrationInitResponse,
            /*exam_session_id % 2 === 0
              ? initRegistrationEmailAuth
              : registrationInitResponse,
              */
          );
      }
    },
  ),
];
