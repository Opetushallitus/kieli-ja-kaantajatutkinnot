import { screen } from '@testing-library/dom';
import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { PublicHomePage } from 'pages/PublicHomePage';
import { render } from 'tests/jest/test-utils';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

describe('PublicHomePage', () => {
  it('should show number of loaded interpreters in the search button', async () => {
    await waitFor(() => render(<PublicHomePage />));
    const searchBtnEl = await screen.findByRole('button', {
      name: `buttons.search (${publicInterpreters10.length})`,
    });

    expect(searchBtnEl).toBeInTheDocument();
  });

  it('should filter data based on active filters', async () => {
    await waitFor(() => render(<PublicHomePage />));

    // Check initial number of interpreters
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('10');

    const comboBox = await screen.findByRole('combobox', {
      name: 'languagePair.toPlaceholder',
    });
    // Select to field
    await waitFor(() => userEvent.click(comboBox));
    const optionDA = await screen.getByRole('option', { name: /DA/ });
    await waitFor(() => {
      userEvent.click(optionDA);
    });
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('4');

    // Select the region
    await waitFor(() =>
      userEvent.click(
        screen.getByRole('combobox', {
          name: 'region.placeholder',
        }),
      ),
    );
    const option05 = await screen.getByRole('option', { name: /05/ });
    await waitFor(() => userEvent.click(option05));
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('3');

    const input = await screen.getByLabelText('name.placeholder', {
      selector: 'input',
    });
    // Type the name
    await userEvent.type(input, 'ville', { delay: 300 });

    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('2');
  });
});
