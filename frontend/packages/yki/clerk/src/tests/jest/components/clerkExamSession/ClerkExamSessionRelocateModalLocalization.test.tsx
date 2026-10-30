import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { changeLanguage, use } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ClerkExamSessionRelocateModal } from 'components/clerkExamSession/ClerkExamSessionRelocateModal';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import {
  relocateRegistration,
  storeRelocateExamSessions,
} from 'redux/reducers/clerkExamSession';
import { rootReducer } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';

jest.unmock('configs/i18n');

beforeEach(async () => {
  await use(initReactI18next).init({
    lng: 'fi-FI',
    fallbackLng: 'fi-FI',
    resources: { 'fi-FI': { public: publicFI, common: commonFI } },
  });
});

const names = {
  fi: 'Suomalainen testipaikka',
  sv: 'Svensk provplats',
  en: 'English test venue',
};
const targetSession = {
  ...clerkExamSession,
  id: 1000,
  location: clerkExamSession.location.map((location) => ({
    ...location,
    name: names[location.lang as keyof typeof names],
  })),
};

const renderModal = (location = targetSession.location) => {
  const store = configureStore({ reducer: rootReducer });
  render(
    <DefaultProviders store={store}>
      <ClerkExamSessionRelocateModal
        registrationId={123}
        onClose={jest.fn()}
        examSessionId={clerkExamSession.id}
        language={clerkExamSession.language}
        level={clerkExamSession.level}
      />
    </DefaultProviders>,
  );
  act(() => {
    store.dispatch(
      storeRelocateExamSessions([
        clerkExamSession,
        { ...targetSession, location },
      ]),
    );
  });

  return store;
};

it.each([
  ['fi-FI', names.fi, 'Tampere'],
  ['sv-SE', names.sv, 'Tammerfors'],
  ['en-GB', names.en, 'Tampere'],
])(
  'uses the location name and address for UI language %s',
  async (language, name, postOffice) => {
    const user = userEvent.setup();
    const store = renderModal();
    await act(async () => {
      await changeLanguage(language);
    });

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveAccessibleName(
      `suomi - ylin taso 1.1.2035: ${name}, Jokukatu 4, ${postOffice}`,
    );
    for (const otherName of Object.values(names).filter(
      (value) => value !== name,
    )) {
      expect(options[0]).not.toHaveAccessibleName(
        expect.stringContaining(otherName),
      );
    }

    const dispatch = jest.spyOn(store, 'dispatch');
    await user.click(options[0]);
    await user.click(
      screen.getByRole('button', { name: 'Siirrä tilaisuuteen' }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      relocateRegistration({
        registrationId: 123,
        targetExamSessionId: targetSession.id,
        currentExamSessionId: clerkExamSession.id,
      }),
    );
  },
);

it('falls back to the first location when the selected language and Finnish are missing', () => {
  renderModal(targetSession.location.filter(({ lang }) => lang !== 'fi'));

  expect(screen.getByRole('radio')).toHaveAccessibleName(
    `suomi - ylin taso 1.1.2035: ${names.sv}, Jokukatu 4, Tammerfors`,
  );
});
