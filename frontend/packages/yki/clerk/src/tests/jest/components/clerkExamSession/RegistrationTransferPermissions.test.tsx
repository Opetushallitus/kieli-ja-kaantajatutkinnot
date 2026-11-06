import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { CustomerExamListings } from 'components/clerkCustomer/CustomerExamListings';
import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import { RouteType } from 'interfaces/user';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import { acceptUser } from 'redux/reducers/user';
import { rootReducer } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';
import { customerDetails } from 'tests/msw/fixtures/customerDetails';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

beforeAll(async () => {
  await use(initReactI18next).init({
    lng: 'fi-FI',
    fallbackLng: 'fi-FI',
    resources: { 'fi-FI': { public: publicFI, common: commonFI } },
  });
});

const examSession =
  SerializationUtils.deserializeClerkExamSessionResponse(clerkExamSession);
const customer = SerializationUtils.deserializeClerkCustomerDetailsResponse(
  customerDetails[0],
);

const permissions: {
  description: string;
  route: RouteType;
  isAdmin: boolean;
  isOrganizer: boolean;
  canTransfer: boolean;
  canCancel: boolean;
}[] = [
  {
    description: 'clerk administrator',
    route: 'clerk',
    isAdmin: true,
    isOrganizer: false,
    canTransfer: true,
    canCancel: true,
  },
  {
    description: 'customer service clerk',
    route: 'clerk',
    isAdmin: false,
    isOrganizer: false,
    canTransfer: false,
    canCancel: false,
  },
  {
    description: 'organizer',
    route: 'organizer',
    isAdmin: false,
    isOrganizer: true,
    canTransfer: false,
    canCancel: true,
  },
  {
    description: 'administrator using the organizer UI',
    route: 'organizer',
    isAdmin: true,
    isOrganizer: true,
    canTransfer: false,
    canCancel: true,
  },
];

describe.each(['exam session', 'customer'] as const)(
  '%s registration transfer permissions',
  (view) => {
    it.each(permissions)(
      '$description has the correct transfer and cancellation actions',
      async ({ route, isAdmin, isOrganizer, canTransfer, canCancel }) => {
        const user = userEvent.setup();
        const store = configureStore({ reducer: rootReducer });
        store.dispatch(
          acceptUser({
            oid: '1.2.3',
            isAdmin,
            isOrganizer,
            isCustomerService: !isAdmin && !isOrganizer,
          }),
        );
        render(
          <DefaultProviders store={store}>
            {view === 'exam session' ? (
              <ClerkExamSessionRegistrations
                examSession={examSession}
                route={route}
              />
            ) : (
              <CustomerExamListings customerDetails={customer} route={route} />
            )}
          </DefaultProviders>,
        );

        const transferButtons = screen.queryAllByRole('button', {
          name: 'Siirrä tilaisuuteen',
        });
        const cancelButtons = screen.queryAllByRole('button', {
          name: 'Peru osallistuminen',
        });
        expect(cancelButtons.length > 0).toBe(canCancel);
        expect(transferButtons.length > 0).toBe(canTransfer);

        if (view === 'exam session') {
          await user.click(screen.getByRole('button', { name: /^Jonossa/ }));
          expect(
            screen.queryAllByRole('button', { name: 'Siirrä tilaisuuteen' })
              .length > 0,
          ).toBe(canTransfer);
          await user.click(
            screen.getByRole('button', { name: /^Ilmoittautuneet/ }),
          );
        }

        if (canTransfer) {
          await user.click(
            screen.getAllByRole('button', { name: 'Siirrä tilaisuuteen' })[0],
          );
          expect(screen.getByRole('alertdialog')).toBeInTheDocument();
          expect(screen.getByText('Vahvista siirto')).toBeInTheDocument();

          act(() => {
            store.dispatch(
              acceptUser({
                oid: '1.2.3',
                isAdmin: false,
                isOrganizer: false,
                isCustomerService: true,
              }),
            );
          });
          expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        } else {
          expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        }
      },
    );
  },
);
