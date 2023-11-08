import { screen } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { PublicHomePage } from 'pages/PublicHomePage';
import { render } from 'tests/jest/test-utils';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

describe('PublicHomePage', () => {
  it('should show number of loaded interpreters in the search button', async () => {
    await act(async () => {
      render(<PublicHomePage />);
    });
    const searchBtnEl = await screen.findByRole('button', {
      name: `buttons.search (${publicInterpreters10.length})`,
    });

    expect(searchBtnEl).toBeInTheDocument();
  });

  it('should filter data based on active filters', async () => {
    await act(async () => {
      render(<PublicHomePage />);
    });

    // Check initial number of interpreters
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('10');

    // Select to field
    await act(async () => {
      await userEvent.click(
        await screen.findByRole('combobox', {
          name: 'languagePair.toPlaceholder',
        }),
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole('option', { name: /DA/ }));
    });
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('4');

    // Select the region
    await act(async () => {
      await userEvent.click(
        screen.getByRole('combobox', {
          name: 'region.placeholder',
        }),
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByRole('option', { name: /05/ }));
    });
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('3');

    // Type the name
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText('name.placeholder', { selector: 'input' }),
        'ville',
        { delay: 300 },
      );
    });
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn'),
    ).toHaveTextContent('2');
  });
});
