import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { useState } from 'react';
import { AppLanguage } from 'shared/enums';

import { CancelRegistrationModal } from 'components/userDetails/CancelRegistrationModal';
import { changeLang } from 'configs/i18n';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';
import { cancelUserRegistration } from 'redux/reducers/userDetails';
import { setupStore } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';
import { personDetails } from 'tests/msw/fixtures/personDetails';
import { SerializationUtils } from 'utils/serialization';

jest.unmock('configs/i18n');

const renderModal = (overrides: Partial<PersonRegistrations> = {}) => {
  const registration = {
    ...SerializationUtils.deserializePersonDetails(personDetails)
      .registrations[0],
    examDate: dayjs('2026-11-17'),
    paidAt: dayjs('2026-10-20'),
    evaluationState: undefined,
    isFreeRegistration: false,
    ...overrides,
  };
  const store = setupStore();
  const dispatch = jest.spyOn(store, 'dispatch');
  const Modal = () => {
    const [open, setOpen] = useState(true);

    return (
      <CancelRegistrationModal
        registrationToCancel={registration}
        modalOpen={open}
        setModalOpen={setOpen}
      />
    );
  };

  render(
    <DefaultProviders store={store}>
      <Modal />
    </DefaultProviders>,
  );

  return { dispatch, registration };
};

describe('CancelRegistrationModal', () => {
  beforeEach(async () => {
    await changeLang(AppLanguage.Finnish);
  });

  it('identifies the registration in the title and shows payment below its state', () => {
    renderModal();

    const title =
      'Haluatko perua ilmoittautumisen suomi, keskitaso, 17.11.2026?';
    const dialog = screen.getByRole('alertdialog', { name: title });
    expect(within(dialog).getByRole('heading', { name: title })).toBeVisible();
    expect(within(dialog).getByText('Maksettu 20.10.2026')).toBeVisible();

    const state = within(dialog).getByText('Tila');
    const payment = within(dialog).getByText('Tutkintomaksu');
    const details = within(dialog).getByText('Osakokeet');
    expect(state.compareDocumentPosition(payment)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(payment.compareDocumentPosition(details)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
    expect(
      within(dialog).queryByText('ja', { exact: true }),
    ).not.toBeInTheDocument();
  });

  it.each(['Sulje', 'En halua perua'])(
    'closes with %s without cancelling the registration',
    async (name) => {
      const user = userEvent.setup();
      const { dispatch, registration } = renderModal();

      await user.click(screen.getByRole('button', { name }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(dispatch).not.toHaveBeenCalledWith(
        cancelUserRegistration(registration.id),
      );
    },
  );

  it('shows the unpaid fee and due date', () => {
    renderModal({
      state: RegistrationStates.Submitted,
      paidAt: undefined,
      expiresAt: dayjs('2026-11-01'),
      examFee: 100,
    });

    expect(screen.getByText('Maksamatta 100€')).toBeVisible();
    expect(screen.getByText('Eräpäivä 1.11.2026')).toBeVisible();
  });

  it('shows free registration instead of payment information', () => {
    renderModal({ isFreeRegistration: true, paidAt: undefined });

    expect(screen.getByText('Maksuton')).toBeVisible();
    expect(screen.queryByText(/Maksamatta/)).not.toBeInTheDocument();
  });

  it('omits payment information for a queued registration, as on its card', () => {
    renderModal({
      kind: RegistrationKind.Queue,
      state: RegistrationStates.Submitted,
      paidAt: undefined,
    });

    expect(screen.queryByText('Tutkintomaksu')).not.toBeInTheDocument();
  });
});
