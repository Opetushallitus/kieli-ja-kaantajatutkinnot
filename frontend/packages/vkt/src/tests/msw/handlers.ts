import { http } from 'msw';

import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { ClerkEnrollmentStatusChange } from 'interfaces/clerkEnrollment';
import { ClerkUser } from 'interfaces/clerkUser';
import { PublicReservationDetailsResponse } from 'interfaces/publicEnrollment';
import { PublicPerson } from 'interfaces/publicPerson';
import { fixedDateForTests } from 'tests/cypress/support/utils/date';
import { clerkExamEvent } from 'tests/msw/fixtures/clerkExamEvent';
import { clerkExamEvents9 } from 'tests/msw/fixtures/clerkExamEvents9';
import { clerkPaymentRefunded } from 'tests/msw/fixtures/clerkPaymentRefunded';
import { person } from 'tests/msw/fixtures/person';
import {
  examEventIdWithKoskiEducationDetailsFound,
  publicEnrollmentInitialisation,
  publicEnrollmentInitialisationWithFreeEnrollments,
} from 'tests/msw/fixtures/publicEnrollmentInitialisation';
import { publicExamEvents11 } from 'tests/msw/fixtures/publicExamEvents11';

export const handlers = [
  http.get(APIEndpoints.ClerkUser, ({ cookies }) => {
    const user: ClerkUser = {
      oid: '1.2.246.562.10.00000000001',
    };

    return new Response(cookies.noAuth ? 'null' : JSON.stringify(user));
  }),
  http.get(APIEndpoints.PublicUser, ({ cookies }) => {
    const person: PublicPerson = {
      id: 1,
      lastName: 'Demo',
      firstName: 'Nordea',
    };

    return new Response(cookies.noAuth ? 'null' : JSON.stringify(person));
  }),
  http.get(APIEndpoints.PublicEducation, ({ request }) => {
    if (
      request.referrer.endsWith(
        AppRoutes.PublicEnrollmentEducationDetails.replace(
          /:examEventId/,
          `${examEventIdWithKoskiEducationDetailsFound}`,
        ),
      )
    ) {
      return new Response(
        JSON.stringify([
          {
            educationType: 'ylioppilastutkinto',
            isActive: false,
          },
          {
            educationType: 'korkeakoulutus',
            isActive: false,
          },
        ]),
      );
    } else {
      return new Response(JSON.stringify([]));
    }
  }),
  http.get(APIEndpoints.PublicExamEvent, () => {
    return new Response(JSON.stringify(publicExamEvents11));
  }),
  http.post(`${APIEndpoints.PublicExamEvent}/2/reservation`, () => {
    const response: PublicReservationDetailsResponse = {
      examEvent: publicExamEvents11[1],
      reservation: {
        id: 1,
        expiresAt: fixedDateForTests.add(30, 'minute').format(),
        createdAt: fixedDateForTests.format(),
        isRenewable: true,
      },
      person,
    };

    return new Response(JSON.stringify(response), { status: 201 });
  }),
  http.post(`${APIEndpoints.PublicExamEvent}/5/queue`, () => {
    return new Response(
      JSON.stringify({
        id: 2,
        expiresAt: Date.now() + 60 * 1000,
        examEvent: publicExamEvents11[4],
        person,
      }),
      { status: 201 },
    );
  }),
  http.post(`${APIEndpoints.PublicExamEvent}/10/reservation`, () => {
    const errorCode = 'initialiseEnrollmentHasCongestion';

    return new Response(JSON.stringify({ errorCode }), { status: 400 });
  }),
  http.post(`${APIEndpoints.PublicExamEvent}/11/reservation`, () => {
    const errorCode = 'initialiseEnrollmentRegistrationClosed';

    return new Response(JSON.stringify({ errorCode }), { status: 400 });
  }),
  http.get(APIEndpoints.ClerkExamEvent, () => {
    return new Response(JSON.stringify(clerkExamEvents9), { status: 200 });
  }),
  http.get(`${APIEndpoints.ClerkExamEvent}/1`, () => {
    return new Response(JSON.stringify(clerkExamEvent), { status: 200 });
  }),
  http.put(APIEndpoints.ClerkExamEvent, () => {
    return new Response(
      JSON.stringify({
        ...clerkExamEvent,
        language: 'SV',
      }),
      { status: 200 },
    );
  }),
  http.put(`${APIEndpoints.ClerkEnrollment}/status`, async ({ request }) => {
    const statusChange = (await request.json()) as ClerkEnrollmentStatusChange;
    const enrollment =
      statusChange.id && clerkExamEvent.enrollments[statusChange.id - 1];

    if (enrollment) {
      return new Response(
        JSON.stringify({
          ...enrollment,
          status: statusChange.newStatus,
        }),
        { status: 200 },
      );
    }

    return new Response(null, { status: 400 });
  }),
  http.get(`${APIEndpoints.PublicExamEvent}/2/enrollment`, () => {
    return new Response(JSON.stringify(publicEnrollmentInitialisation), {
      status: 200,
    });
  }),
  http.get(
    `${APIEndpoints.PublicExamEvent}/${examEventIdWithKoskiEducationDetailsFound}/enrollment`,
    () => {
      return new Response(
        JSON.stringify(publicEnrollmentInitialisationWithFreeEnrollments),
        {
          status: 200,
        },
      );
    },
  ),
  http.put(`${APIEndpoints.ClerkPayment}/1/refunded`, () => {
    return new Response(JSON.stringify(clerkPaymentRefunded), { status: 200 });
  }),
  http.get(APIEndpoints.FeatureFlags, () => {
    return new Response(JSON.stringify({ freeEnrollmentAllowed: true }), {
      status: 200,
    });
  }),
];
