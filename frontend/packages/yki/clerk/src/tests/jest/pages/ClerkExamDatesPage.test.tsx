import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamDatesPage } from 'pages/ClerkExamDatesPage';
import { storeAddExamDate } from 'redux/reducers/examDate';
import { setupStore } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';

const mockShowToast = jest.fn();
jest.mock('shared/hooks', () => ({
  ...jest.requireActual('shared/hooks'),
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock('components/ClerkExamDates/ClerkExamDates', () => ({
  ClerkExamDates: () => null,
}));

it('shows creation success once, closes the modal, and does not replay on return', async () => {
  const store = setupStore();
  const user = userEvent.setup();
  const renderPage = () =>
    render(
      <DefaultProviders store={store}>
        <ClerkExamDatesPage />
      </DefaultProviders>,
    );
  const page = renderPage();
  await user.click(
    screen.getByRole('button', { name: 'addNewExamDateButton' }),
  );
  expect(screen.getByRole('alertdialog')).toBeVisible();

  // A fast response may render Success without a preceding InProgress render.
  act(() => {
    store.dispatch(storeAddExamDate());
  });
  expect(mockShowToast).toHaveBeenCalledTimes(1);
  expect(mockShowToast).toHaveBeenCalledWith(
    expect.objectContaining({ description: 'toasts.examDateAdded' }),
  );
  expect(store.getState().examDate.addStatus).toBe(
    APIResponseStatus.NotStarted,
  );
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

  page.unmount();
  renderPage();
  expect(mockShowToast).toHaveBeenCalledTimes(1);

  act(() => {
    store.dispatch(storeAddExamDate());
  });
  expect(mockShowToast).toHaveBeenCalledTimes(2);
});
