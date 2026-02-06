import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';

import { APIEndpoints } from 'enums/api';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { customerDetails } from 'tests/msw/fixtures/customerDetails';
import { allCustomers } from 'tests/msw/fixtures/customersSearch';
import { examDates } from 'tests/msw/fixtures/examDate';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { findByOidsResponse } from 'tests/msw/fixtures/findByOids';
import { freeRegistrationDetails } from 'tests/msw/fixtures/freeRegistrationDetails';
import { freeRegistrations } from 'tests/msw/fixtures/freeRegistrations';
import { maatJaValtiot2Response } from 'tests/msw/fixtures/maatjavaltiot2';
import { organizers } from 'tests/msw/fixtures/organizers';

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
  http.get(APIEndpoints.ExamDate, () => {
    return HttpResponse.json(examDates);
  }),
  http.get(APIEndpoints.ClerkExamSession, () =>
    HttpResponse.json(clerkExamSession),
  ),
];
