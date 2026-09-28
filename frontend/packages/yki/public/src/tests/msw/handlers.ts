import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';
import {
  // NoSessionResponse,
  SuomiFiAuthenticatedSessionResponse,
} from 'tests/msw/fixtures/identity';
import { kieliResponse } from 'tests/msw/fixtures/kieli';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { personDetails } from 'tests/msw/fixtures/personDetails';
import {
  registrationHandlers,
  resetRegistrationMocks,
} from 'tests/msw/registrationHandlers';

const data = { personDetails };
export const resetData = () => {
  resetRegistrationMocks();
  data.personDetails = personDetails;
};
const notFound = () => new HttpResponse(null, { status: 404 });

export const handlers = [
  ...registrationHandlers,
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
    // return HttpResponse.json(NoSessionResponse);
  }),
  http.post(APIEndpoints.EvaluationOrder, () =>
    HttpResponse.json(evaluationOrderPostResponse),
  ),
  http.get(APIEndpoints.CountryCodes, () =>
    HttpResponse.json(maatJaValtiot2Response),
  ),
  http.get(APIEndpoints.LanguageCodes, () => HttpResponse.json(kieliResponse)),
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
  http.get(APIEndpoints.Logout, ({ request }) => {
    const url = new URL(request.url);
    const redirect = url.searchParams.get('redirect');

    return HttpResponse.redirect(redirect as string);
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
  http.get(APIEndpoints.LoginLinkInfo, () => {
    return HttpResponse.json({
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  }),
  http.get(APIEndpoints.ConfirmRegistration, ({ params }) => {
    const { registrationId } = params;

    const registration = data.personDetails.registrations.find(
      (r) => `${r.id}` === registrationId,
    );

    if (registration) {
      return HttpResponse.json(registration);
    } else {
      return notFound();
    }
  }),
];
