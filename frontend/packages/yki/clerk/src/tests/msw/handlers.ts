import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { ClerkOrganizerResponse } from 'interfaces/clerkOrganizer';
import {
  CreateEvaluationRequest,
  ExamDateLanguage,
  ExamDateResponse,
  LanguageEvaluationOverride,
} from 'interfaces/examDate';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { customerDetails } from 'tests/msw/fixtures/customerDetails';
import { allCustomers } from 'tests/msw/fixtures/customersSearch';
import { examDates } from 'tests/msw/fixtures/examDate';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { findByOidResponse } from 'tests/msw/fixtures/findByOid';
import { findByOidsResponse } from 'tests/msw/fixtures/findByOids';
import { findOrganizations } from 'tests/msw/fixtures/findOrganizations';
import { freeRegistrationDetails } from 'tests/msw/fixtures/freeRegistrationDetails';
import { freeRegistrations } from 'tests/msw/fixtures/freeRegistrations';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { organizers } from 'tests/msw/fixtures/organizers';
import { quarantineMatches } from 'tests/msw/fixtures/quarantineMatches';

interface FreeRegistrationRequest {
  approved: boolean;
}

const notFound = () => new HttpResponse(null, { status: 404 });

const adminUser = {
  identity: {
    username: 'ykitestaaja',
    oid: '1.2.246.562.24.98107285507',
    organizations: [
      {
        oid: '1.2.246.562.10.00000000001',
        permissions: [{ palvelu: 'YKI', oikeus: 'YLLAPITAJA' }],
      },
    ],
    lang: 'fi',
  },
};

export const handlers = [
  http.get(APIEndpoints.User, () => {
    return HttpResponse.json(adminUser);
    //return HttpResponse.json(NoSessionResponse);
  }),
  http.get(APIEndpoints.CountryCodes, () =>
    HttpResponse.json(maatJaValtiot2Response),
  ),
  http.get(APIEndpoints.ClerkOrganizer, () => HttpResponse.json(organizers)),
  http.put(
    `${APIEndpoints.ClerkOrganizer}/:oid`,
    async ({ params, request }) => {
      const organizerOid = params.oid as string;
      const updatedData = (await request.json()) as Record<string, unknown>;
      const organizerIndex = organizers.organizers.findIndex(
        (o) => o.oid === organizerOid,
      );
      if (organizerIndex !== -1) {
        organizers.organizers[organizerIndex] = {
          ...organizers.organizers[organizerIndex],
          ...updatedData,
        };

        return HttpResponse.json(organizers.organizers[organizerIndex]);
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
  http.post(
    APIEndpoints.ClerkPersonContactUpdate,
    async ({ params, request }) => {
      const oid = params?.oid as string | undefined;
      const body = (await request.json()) as Record<string, string>;
      const details = customerDetails.find((cd) => cd.person.oid === oid);
      if (details) {
        Object.assign(details.person, body);

        return new HttpResponse(null, { status: 200 });
      } else {
        return notFound();
      }
    },
  ),
  http.post(APIEndpoints.ClerkCustomersSearch, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as {
      personQuery?: string;
      organizerId?: number;
      examDateId?: number;
      languageCode?: string;
      levelCode?: string;
    };

    const getNumberParam = (urlParam: string, fallback: number) => {
      const param = Number(url.searchParams.get(urlParam));

      return Number.isFinite(param) && param >= 0 ? param : fallback;
    };

    const page = getNumberParam('page', 0);
    const size = getNumberParam('size', 20);

    const personQuery = body.personQuery?.trim() ?? '';
    if (personQuery.length > 0 && personQuery.length <= 2) {
      return HttpResponse.json(
        {
          error:
            'When given the person query, it must have atleast three characters',
        },
        { status: 400 },
      );
    }

    const searchTerms = personQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const matchesSearchTerms = (customer: (typeof allCustomers)[0]) => {
      if (searchTerms.length === 0) {
        return true;
      }

      const searchableText = [
        customer.person.oid,
        customer.person.firstName,
        customer.person.lastName,
        customer.person.email ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    };

    const filtered = allCustomers.filter(matchesSearchTerms);
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
  http.post(
    '/organisaatio-service/rest/organisaatio/v3/findbyoids',
    async ({ request }) => {
      const requestBody = (await request.json()) as Array<string>;

      if (requestBody.length === 0) {
        return HttpResponse.json([]);
      } else if (requestBody.length === 1) {
        const oid = requestBody[0];
        const organization = findByOidsResponse.find((org) => org.oid === oid);
        if (organization) {
          return HttpResponse.json([organization]);
        }
      } else {
        // return all organizations by default for multiple oids
        return HttpResponse.json(findByOidsResponse);
      }
    },
  ),
  http.get(
    '/organisaatio-service/rest/organisaatio/v4/1.2.246.562.10.28646781493',
    async ({ request }) => {
      const requestBody = (await request.json()) as Array<string>;

      if (requestBody.length === 0) {
        return HttpResponse.json([]);
      } else if (requestBody.length === 1) {
        const oid = requestBody[0];
        const organization = findByOidResponse.find((org) => org.oid === oid);
        if (organization) {
          return HttpResponse.json([organization]);
        }
      } else {
        // return all organizations by default for multiple oids
        return HttpResponse.json(findByOidResponse);
      }
    },
  ),
  http.get(APIEndpoints.ClerkOrganizer + '/:oid/exam-session', ({ params }) => {
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
  http.get(`${APIEndpoints.ClerkExamDate}/all`, () => {
    return HttpResponse.json(examDates);
  }),
  http.get(APIEndpoints.ClerkExamSessions, () =>
    HttpResponse.json([clerkExamSession]),
  ),
  http.post(APIEndpoints.ClerkExamDate, async ({ request }) => {
    const body = (await request.json()) as Omit<
      ExamDateResponse,
      'id' | 'languages'
    > & {
      languages: Array<Omit<ExamDateLanguage, 'id'>>;
    };

    const {
      languages,
      examDate,
      registrationStartDate,
      registrationEndDate,
      examType,
    } = body;
    const newId = Math.max(...examDates.map((ed) => ed.id)) + 1;
    examDates.push({
      id: newId,
      examDate,
      languages:
        { [newId]: languages.map((l, index) => ({ id: index + 1, ...l })) }[
          newId
        ] ?? [],
      registrationStartDate,
      registrationEndDate,
      examType,
      examSessionCount: 0,
    });

    return HttpResponse.json({ id: newId, ...body });
  }),
  http.post(APIEndpoints.ClerkExamSessions, () =>
    HttpResponse.json(clerkExamSession),
  ),
  http.post(
    `${APIEndpoints.ClerkExamDate}/:examDateId/evaluation`,
    async ({ params, request }) => {
      const examDateId = Number(params.examDateId);
      const body = (await request.json()) as CreateEvaluationRequest;
      const examDate = examDates.find((ed) => ed.id === examDateId);
      if (!examDate) {
        return new HttpResponse(null, { status: 404 });
      }

      examDate.languages.forEach((lang) => {
        const override = body.overrides?.find(
          (o: LanguageEvaluationOverride) => o.examDateLanguageId === lang.id,
        );
        lang.evaluationStartDate =
          override?.evaluationStartDate ?? body.evaluationStartDate;
        lang.evaluationEndDate =
          override?.evaluationEndDate ?? body.evaluationEndDate;
      });

      return HttpResponse.json(examDate);
    },
  ),
  http.delete(`${APIEndpoints.ClerkExamDate}/:id`, ({ params }) => {
    const id = Number(params.id);
    const index = examDates.findIndex((ed) => ed.id === id);
    if (index === -1) {
      return notFound();
    }
    examDates.splice(index, 1);

    return new HttpResponse(null, { status: 200 });
  }),
  http.get(APIEndpoints.ClerkExamSession, () =>
    HttpResponse.json(clerkExamSession),
  ),
  http.put(
    APIEndpoints.ClerkRegistrationMove,
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.put(
    APIEndpoints.ClerkRegistrationCancel,
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.get(
    '/organisaatio-service/rest/organisaatio/v4/hae?searchStr=&aktiiviset=true&suunnitellut=true&lakkautetut=false&lang=fi',
    () => {
      return HttpResponse.json(findOrganizations);
    },
  ),
  http.get(APIEndpoints.ClerkPaymentReportExcel, ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (!from || !to) {
      return new HttpResponse(null, { status: 400 });
    }

    return new HttpResponse(new Blob(['mock-excel-content']), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="YKI_tutkintomaksut_${from}_${to}.xlsx"`,
      },
    });
  }),
  http.get(APIEndpoints.ClerkQuarantineMatches, () =>
    HttpResponse.json({ quarantineMatches }),
  ),
  http.put(APIEndpoints.ClerkQuarantineSetReview, ({ params }) => {
    const id = Number(params.id);
    const regId = Number(params.regId);
    const idx = quarantineMatches.findIndex(
      (m) => m.id === id && m.registrationId === regId,
    );
    if (idx !== -1) quarantineMatches.splice(idx, 1);

    return new HttpResponse(null, { status: 200 });
  }),
  http.post(APIEndpoints.AddClerkOrganizer, async ({ request }) => {
    const requestBody = (await request.json()) as Omit<
      ClerkOrganizerResponse,
      'id'
    >;
    organizers.organizers.push({
      ...requestBody,
      id: organizers.organizers.length + 1,
    });

    return HttpResponse.json({ success: true });
  }),
];
