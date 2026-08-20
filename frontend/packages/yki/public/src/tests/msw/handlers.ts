import { http, HttpResponse, PathParams, StrictRequest } from 'msw';

import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { ExamSessionResponse } from 'interfaces/examSessions';
import {
  PartialExamType,
  PublicRegistrationIdentifyRequest,
  PublicRegistrationInitRequest,
} from 'interfaces/publicRegistration';
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
import { registrationInitResponse } from 'tests/msw/fixtures/registrationInit/registrationInit';

const data = {
  personDetails,
  temporaryState: {} as Partial<{
    kind: ExamSessionResponse['available_registration_kind'];
    partial_exam_type: PartialExamType;
  }>,
};

// The "continue to registration" control is a link, so it triggers a full page
// reload. On the local dev server the app itself hosts MSW, so that reload
// re-imports this module and resets the in-memory temporaryState before
// /identify runs. Persist the init outcome in sessionStorage (survives a
// same-tab reload) so the refetch can restore the selected partial exam type
// and kind. (Under Cypress the handlers live in the persistent spec realm, so
// temporaryState survives reloads there and is cleared by resetData instead.)
const REGISTRATION_STATE_STORAGE_KEY = 'msw:registrationStateByExamSession';

type PersistedRegistrationState = {
  kind: ExamSessionResponse['available_registration_kind'];
  partial_exam_type: PartialExamType;
};

const persistRegistrationState = (
  examSessionId: number,
  state: PersistedRegistrationState,
) => {
  try {
    const all = JSON.parse(
      sessionStorage.getItem(REGISTRATION_STATE_STORAGE_KEY) || '{}',
    );
    all[examSessionId] = state;
    sessionStorage.setItem(REGISTRATION_STATE_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore sessionStorage failures; identify falls back to temporaryState.
  }
};

const readRegistrationState = (
  examSessionId: number,
): PersistedRegistrationState | undefined => {
  try {
    const all = JSON.parse(
      sessionStorage.getItem(REGISTRATION_STATE_STORAGE_KEY) || '{}',
    );

    return all[examSessionId];
  } catch {
    return undefined;
  }
};

export const resetData = () => {
  data.personDetails = personDetails;
  data.temporaryState = {};
  try {
    sessionStorage.removeItem(REGISTRATION_STATE_STORAGE_KEY);
  } catch {
    // ignore
  }
};

type SubmitRequest = {
  free_registration_id: number;
};

const notFound = () => new HttpResponse(null, { status: 404 });

const errorResponseForExamSession = (exam_session_id: number) => {
  switch (exam_session_id) {
    // exam sessions with ids 2 through 6 are for simulating different error conditions
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
      return undefined;
  }
};

const buildRegistrationResponse = (
  exam_session_id: number,
  kind: ExamSessionResponse['available_registration_kind'],
  partial_exam_type: PartialExamType,
) => {
  const {
    exam_session,
    registration_kind: _registration_kind,
    registration_id: _registration_id,
    partial_exam_type: _partial_exam_type,
    ...rest
  } = registrationInitResponse;
  const examSession =
    examSessions.exam_sessions.find((v) => v.id === exam_session_id) ||
    exam_session;
  const thirtyMinutesInSeconds = 1800;
  const expires_in =
    kind === RegistrationKind.Queue ? undefined : thirtyMinutesInSeconds;

  return {
    exam_session: {
      ...examSession,
      available_registration_kind: kind,
    },
    registration_kind: kind,
    partial_exam_type,
    registration_id: exam_session_id,
    expires_in,
    ...rest,
  };
};

const initRegistration = async ({
  request,
}: {
  request: StrictRequest<PublicRegistrationInitRequest>;
}) => {
  const { exam_session_id, to_queue, partial_exam_type } = await request.json();
  const errorResponse = errorResponseForExamSession(exam_session_id);
  if (errorResponse) {
    return errorResponse;
  }

  const kind = to_queue ? RegistrationKind.Queue : RegistrationKind.Admission;
  const resolvedPartialExamType = partial_exam_type ?? 'ALL_PARTS';

  data.temporaryState = {
    partial_exam_type: resolvedPartialExamType,
    kind,
  };
  persistRegistrationState(exam_session_id, {
    partial_exam_type: resolvedPartialExamType,
    kind,
  });

  return HttpResponse.json(
    buildRegistrationResponse(exam_session_id, kind, resolvedPartialExamType),
  );
};

const identifyRegistration = async ({
  request,
}: {
  request: StrictRequest<PublicRegistrationIdentifyRequest>;
}) => {
  const { exam_session_id } = await request.json();
  const errorResponse = errorResponseForExamSession(exam_session_id);
  if (errorResponse) {
    return errorResponse;
  }

  // /identify ignores the request's to_queue; the real backend derives the kind
  // from the registration created at init. Restore it from the init outcome
  // (persisted across the continue link's reload), falling back to the exam
  // session fixture so a QUEUE exam does not get an ADMISSION reservation timer.
  const persisted = readRegistrationState(exam_session_id);
  const examSession = examSessions.exam_sessions.find(
    (v) => v.id === exam_session_id,
  );
  const partialExamType =
    persisted?.partial_exam_type ??
    data.temporaryState.partial_exam_type ??
    'ALL_PARTS';
  const partialKinds = examSession?.partial_registration_kind as
    | Partial<Record<PartialExamType, RegistrationKind>>
    | undefined;
  const kind =
    persisted?.kind ??
    partialKinds?.[partialExamType] ??
    examSession?.available_registration_kind ??
    data.temporaryState.kind ??
    RegistrationKind.Admission;

  data.temporaryState = {
    partial_exam_type: partialExamType,
    kind,
  };

  return HttpResponse.json(
    buildRegistrationResponse(exam_session_id, kind, partialExamType),
  );
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
    // return HttpResponse.json(NoSessionResponse);
  }),
  http.post(APIEndpoints.EvaluationOrder, () =>
    HttpResponse.json(evaluationOrderPostResponse),
  ),
  http.get(APIEndpoints.CountryCodes, () =>
    HttpResponse.json(maatJaValtiot2Response),
  ),
  http.get(APIEndpoints.LanguageCodes, () => HttpResponse.json(kieliResponse)),
  http.post(APIEndpoints.SubmitRegistration, async ({ params, request }) => {
    const { registrationId } = params;
    const queued = Number(registrationId) % 2 === 1;
    const body = (await request.clone().json()) as SubmitRequest;
    const state =
      !queued && body && !!body.free_registration_id
        ? 'COMPLETED'
        : 'SUBMITTED';

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
  http.post<PathParams, PublicRegistrationIdentifyRequest>(
    APIEndpoints.IdentifyRegistration,
    identifyRegistration,
  ),
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
  http.get(APIEndpoints.Registration, ({ params }) => {
    const { registrationId } = params;
    const id = Number(registrationId);
    const persisted = readRegistrationState(id);

    return HttpResponse.json({
      id,
      kind: persisted?.kind ?? data.temporaryState.kind ?? 'ADMISSION',
      partial_exam_type:
        persisted?.partial_exam_type ??
        data.temporaryState.partial_exam_type ??
        'ALL_PARTS',
      exam_session_id: id,
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
