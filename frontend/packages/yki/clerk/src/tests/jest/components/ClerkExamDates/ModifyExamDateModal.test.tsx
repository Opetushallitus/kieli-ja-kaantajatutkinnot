import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';

import { ModifyExamDateModal } from 'components/ClerkExamDates/ModifyExamDateModal';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';

it.each([0, 1])(
  'restricts language editing only when sessions exist: %s',
  async (examSessionCount) => {
    const user = userEvent.setup();
    render(
      <DefaultProviders>
        <ModifyExamDateModal
          onClose={jest.fn()}
          examDateToEdit={{
            id: 1,
            examDate: dayjs('2030-10-15'),
            registrationStartDate: dayjs('2030-08-01'),
            registrationEndDate: dayjs('2030-09-30'),
            examType: 'FULL',
            examSessionCount,
            languages: [
              {
                id: 1,
                languageCode: 'fin',
                levelCode: 'KESKI',
                evaluationStartDate: null,
                evaluationEndDate: null,
              },
            ],
          }}
        />
      </DefaultProviders>,
    );
    const [basic, intermediate] = within(
      screen.getByTestId('modify-language-row-fin'),
    ).getAllByRole('checkbox');
    expect(intermediate).toBeChecked();
    if (examSessionCount) expect(intermediate).toBeDisabled();
    else expect(intermediate).toBeEnabled();
    for (const checkbox of within(
      screen.getByTestId('modify-language-row-swe'),
    ).getAllByRole('checkbox')) {
      if (examSessionCount) expect(checkbox).toBeDisabled();
      else expect(checkbox).toBeEnabled();
    }
    await user.click(basic);
    expect(basic).toBeChecked();
    expect(basic).toBeEnabled();
    await user.click(basic);
    expect(basic).not.toBeChecked();
  },
);
