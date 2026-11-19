import { render, screen } from '@testing-library/react';

import { ClerkCustomersListing } from 'components/clerkCustomer/ClerkCustomersListing';
import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import { RouteType } from 'interfaces/user';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { allCustomers } from 'tests/msw/fixtures/customersSearch';
import { SerializationUtils } from 'utils/serialization';

const identifierCases = [
  { ssn: '020502E902X', birthdate: undefined, expected: '020502E902X' },
  { ssn: '020502E902X', birthdate: '2002-05-02', expected: '020502E902X' },
  { ssn: undefined, birthdate: '2002-05-02', expected: '2.5.2002' },
  { ssn: null, birthdate: '2002-05-02', expected: '2.5.2002' },
  { ssn: '', birthdate: '2002-05-02', expected: '2.5.2002' },
  { ssn: undefined, birthdate: undefined, expected: undefined },
  { ssn: null, birthdate: null, expected: undefined },
];

const expectIdentifier = (expected: string | undefined) => {
  if (expected) expect(screen.getByText(expected)).toBeVisible();
  for (const value of ['020502E902X', '2.5.2002', 'Invalid Date']) {
    if (value !== expected)
      expect(screen.queryByText(value)).not.toBeInTheDocument();
  }
};

describe.each<RouteType>(['clerk', 'organizer'])(
  '%s birthday display',
  (route) => {
    it.each(identifierCases)(
      'renders customer identifiers correctly: %j',
      ({ ssn, birthdate, expected }) => {
        render(
          <DefaultProviders>
            <ClerkCustomersListing
              customers={[
                {
                  ...allCustomers[0],
                  person: { ...allCustomers[0].person, ssn, birthdate },
                },
              ]}
              page={0}
              pageSize={10}
              totalCount={1}
              onPageChange={jest.fn()}
              route={route}
              oid="organizer"
            />
          </DefaultProviders>,
        );
        expectIdentifier(expected);
        expect(screen.getByText(allCustomers[0].person.oid)).toBeVisible();
        expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
      },
    );

    it.each(identifierCases)(
      'renders participant identifiers correctly: %j',
      ({ ssn, birthdate, expected }) => {
        const session = SerializationUtils.deserializeClerkExamSessionResponse({
          ...clerkExamSession,
          registrations: [
            {
              ...clerkExamSession.registrations[0],
              person: {
                ...clerkExamSession.registrations[0].person,
                socialSecurityNumber: ssn,
                birthdate,
              },
            },
          ],
        });
        render(
          <DefaultProviders>
            <ClerkExamSessionRegistrations
              examSession={session}
              route={route}
            />
          </DefaultProviders>,
        );
        expectIdentifier(expected);
        expect(
          screen.getByText(session.registrations[0].person.oid),
        ).toBeVisible();
      },
    );
  },
);
