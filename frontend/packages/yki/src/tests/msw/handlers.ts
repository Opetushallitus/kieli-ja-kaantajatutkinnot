import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { evaluationOrderPostResponse } from 'tests/msw/fixtures/evaluationOrder';
import { evaluationPeriods } from 'tests/msw/fixtures/evaluationPeriods';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { maatJaValtiot2Response } from './fixtures/maatjavaltiot2';
import { SuomiFiAuthenticatedSessionResponse } from './fixtures/identity';

const notFound = () => new HttpResponse(null, { status: 404 });

export const handlers = [
  http.get(APIEndpoints.Evaluations, () =>
    HttpResponse.json(evaluationPeriods)
  ),
  http.get(APIEndpoints.Evaluation, ({ params }) => {
    const { evaluationId } = params;
    const evaluationPeriod = evaluationPeriods.evaluation_periods.filter(
      (ep) => ep.id === Number(evaluationId)
    )[0];
    if (evaluationPeriod) {
      return HttpResponse.json(evaluationPeriod);
    } else {
      return notFound();
    }
  }),
  http.get(
    APIEndpoints.ExamSessions,
    () => new Response(JSON.stringify(examSessions), { status: 200 })
  ),
  http.get(APIEndpoints.ExamSession, ({ params }) => {
    const { examSessionId } = params;
    const examSession = examSessions.exam_sessions.find(
      (es) => es.id === Number(examSessionId)
    );
    if (examSession) {
      return HttpResponse.json(examSession);
    } else {
      return notFound();
    }
  }),
  http.get(APIEndpoints.User, () => {
    return HttpResponse.json(SuomiFiAuthenticatedSessionResponse);
  }),
  http.post(APIEndpoints.EvaluationOrder, () => {
    return HttpResponse.json(evaluationOrderPostResponse);
  }),
  http.get(APIEndpoints.CountryCodes, () => {
    return HttpResponse.json(maatJaValtiot2Response);
  }),
  http.post(APIEndpoints.SubmitRegistration, () => {
    return HttpResponse.json({ success: true });
  }),
  http.get(APIEndpoints.Logout, ({ params }) => {
    const redirect = params.redirect as string;
    return new HttpResponse(null, {
      status: 301,
      headers: { Location: redirect },
    });
  }),
];
