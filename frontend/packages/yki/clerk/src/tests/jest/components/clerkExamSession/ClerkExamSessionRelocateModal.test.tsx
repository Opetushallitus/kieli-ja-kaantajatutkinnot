import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { ClerkExamSessionRelocateModal } from 'components/clerkExamSession/ClerkExamSessionRelocateModal';
import { ClerkExamSessionSummary } from 'interfaces/clerkExamSession';
import {
  rejectRelocateExamSessions,
  relocateRegistration,
  storeRelocateExamSessions,
} from 'redux/reducers/clerkExamSession';
import { rootReducer } from 'redux/store';
import { clerkExamSession } from 'tests/msw/fixtures/clerkExamSession';

const props = {
  registrationId: 123,
  onClose: jest.fn(),
  examSessionId: clerkExamSession.id,
  language: clerkExamSession.language,
  level: clerkExamSession.level,
};

const summary: ClerkExamSessionSummary = {
  id: clerkExamSession.id,
  date: clerkExamSession.date,
  language: clerkExamSession.language,
  level: clerkExamSession.level,
  location: clerkExamSession.location,
};

const sessions = [
  { ...summary, id: 1, date: '2026-10-22' },
  { ...summary, id: 2, date: '2026-10-24' },
  { ...summary, id: 3, date: '2026-10-23' },
  { ...summary, id: 4, date: '2027-01-01' },
  { ...summary, date: '2027-02-01' },
];

const renderModal = () => {
  const store = configureStore({ reducer: rootReducer });
  const dispatch = jest.spyOn(store, 'dispatch');
  const result = render(<ClerkExamSessionRelocateModal {...props} />, {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return { store, dispatch, ...result };
};

describe('ClerkExamSessionRelocateModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-23T15:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('waits for destination sessions and lists today and future dates latest first', () => {
    const { store, dispatch } = renderModal();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('relocate.subTitle')).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'values.actions.relocate' }),
    ).not.toBeInTheDocument();

    act(() => {
      store.dispatch(storeRelocateExamSessions(sessions));
    });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('relocate.subTitle')).toBeInTheDocument();
    const destinationOptions = screen.getAllByRole('radio');
    expect(destinationOptions).toHaveLength(3);
    expect(destinationOptions[0]).toHaveAccessibleName(/^2027-01-01/);
    expect(destinationOptions[0]).toHaveAccessibleName(
      /languages.fin - languageLevel.YLIN — Jälkiedu, Jokukatu 4, Tampere$/,
    );
    expect(destinationOptions[1]).toHaveAccessibleName(/^2026-10-24/);
    expect(destinationOptions[2]).toHaveAccessibleName(/^2026-10-23/);
    expect(store.getState().clerkExamSession.relocateExamSessions).toEqual(
      sessions,
    );

    const transferButton = screen.getByRole('button', {
      name: 'values.actions.relocate',
    });
    expect(transferButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /2027-01-01/ }));
    fireEvent.click(transferButton);
    expect(dispatch).toHaveBeenCalledWith(
      relocateRegistration({
        registrationId: props.registrationId,
        targetExamSessionId: 4,
        currentExamSessionId: props.examSessionId,
      }),
    );
  });

  it('keeps sessions without locations selectable', () => {
    const { store } = renderModal();
    act(() => {
      store.dispatch(
        storeRelocateExamSessions([
          { ...summary, id: 4, date: '2027-01-01', location: [] },
        ]),
      );
    });
    const option = screen.getByRole('radio', {
      name: '2027-01-01 — languages.fin - languageLevel.YLIN',
    });
    fireEvent.click(option);
    expect(
      screen.getByRole('button', { name: 'values.actions.relocate' }),
    ).toBeEnabled();
  });

  it('stops loading when the request fails and keeps transfer disabled', () => {
    const { store } = renderModal();

    act(() => {
      store.dispatch(rejectRelocateExamSessions());
    });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'values.actions.relocate' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'cancel' })).toBeEnabled();
  });

  it('waits for fresh data and clears the selection when reopened', () => {
    const { store, rerender } = renderModal();
    act(() => {
      store.dispatch(storeRelocateExamSessions(sessions));
    });
    fireEvent.click(screen.getByRole('radio', { name: /2027-01-01/ }));

    rerender(
      <ClerkExamSessionRelocateModal {...props} registrationId={null} />,
    );
    rerender(<ClerkExamSessionRelocateModal {...props} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();

    act(() => {
      store.dispatch(storeRelocateExamSessions([]));
    });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'values.actions.relocate' }),
    ).toBeDisabled();
  });
});
