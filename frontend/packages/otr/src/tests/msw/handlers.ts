import { http } from 'msw';

import { APIEndpoints } from 'enums/api';
import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';
import { MeetingDateResponse } from 'interfaces/meetingDate';
import { clerkInterpreter } from 'tests/msw/fixtures/clerkInterpreter';
import { clerkInterpreterIndividualised } from 'tests/msw/fixtures/clerkInterpreterIndividualised';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';
import { meetingDates10 } from 'tests/msw/fixtures/meetingDates10';
import { newMeetingDate } from 'tests/msw/fixtures/newMeetingDate';
import { newQualification } from 'tests/msw/fixtures/newQualification';
import { person1, person2 } from 'tests/msw/fixtures/person';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';
import { qualificationRemoveResponse } from 'tests/msw/utils/clerkInterpreterOverview';

export const handlers = [
  http.get(
    APIEndpoints.PublicInterpreter,
    () => new Response(JSON.stringify(publicInterpreters10), { status: 200 }),
  ),
  http.get(
    APIEndpoints.ClerkInterpreter,
    () => new Response(JSON.stringify(clerkInterpreters10), { status: 200 }),
  ),
  http.get(
    APIEndpoints.ClerkMissingInterpreters,
    () => new Response(JSON.stringify([]), { status: 200 }),
  ),
  http.put(APIEndpoints.ClerkInterpreter, async ({ request }) => {
    const interpreterDetails =
      (await request.json()) as ClerkInterpreterResponse;

    return new Response(
      JSON.stringify({
        ...interpreterDetails,
        qualifications: clerkInterpreter.qualifications,
      }),
      { status: 200 },
    );
  }),
  http.get(
    `${APIEndpoints.ClerkInterpreter}/${clerkInterpreterIndividualised.id}`,
    () =>
      new Response(JSON.stringify(clerkInterpreterIndividualised), {
        status: 200,
      }),
  ),
  http.get(
    `${APIEndpoints.ClerkInterpreter}/${clerkInterpreter.id}`,
    () => new Response(JSON.stringify(clerkInterpreter), { status: 200 }),
  ),
  http.post(
    `${APIEndpoints.ClerkInterpreter}/${clerkInterpreter.id}/qualification`,
    () => {
      const effective = [
        ...clerkInterpreter.qualifications.effective,
        newQualification,
      ];

      return new Response(
        JSON.stringify({
          ...clerkInterpreter,
          qualifications: {
            ...clerkInterpreter.qualifications,
            effective,
          },
        }),
        { status: 201 },
      );
    },
  ),
  http.delete(`${APIEndpoints.Qualification}/:id`, async ({ params }) => {
    const { id } = params;

    return new Response(
      JSON.stringify(
        qualificationRemoveResponse(clerkInterpreter, parseInt(id as string)),
      ),
      { status: 200 },
    );
  }),
  http.get(APIEndpoints.ClerkPersonSearch, ({ request }) => {
    const url = new URL(request.url);
    const identityNumber = url.searchParams.get('identityNumber');

    if (identityNumber === person1.identityNumber) {
      return new Response(JSON.stringify(person1), { status: 200 });
    } else if (identityNumber === person2.identityNumber) {
      return new Response(JSON.stringify(person2), { status: 200 });
    } else {
      return new Response(null, { status: 200 });
    }
  }),
  http.post(
    APIEndpoints.ClerkInterpreter,
    () => new Response(JSON.stringify(clerkInterpreter), { status: 200 }),
  ),
  http.get(
    APIEndpoints.MeetingDate,
    () => new Response(JSON.stringify(meetingDates10), { status: 200 }),
  ),
  http.post(APIEndpoints.MeetingDate, async ({ request }) => {
    const { date } = (await request.json()) as MeetingDateResponse;

    if (date === newMeetingDate.date) {
      return new Response(JSON.stringify(newMeetingDate), { status: 201 });
    } else {
      return new Response(null, { status: 500 });
    }
  }),
  http.delete(`${APIEndpoints.MeetingDate}/:id`, ({ params }) => {
    const { id } = params;
    const deletableMeetingDateId = meetingDates10.find(
      (m) => m.date === '2022-01-01',
    )?.id;

    if (parseInt(id as string) === deletableMeetingDateId) {
      return new Response(null, { status: 200 });
    } else {
      return new Response(null, { status: 500 });
    }
  }),
];
