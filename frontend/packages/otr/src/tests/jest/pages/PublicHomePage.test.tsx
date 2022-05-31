import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { PublicHomePage } from 'pages/PublicHomePage';
import { render } from 'tests/jest/test-utils';
import { publicInterpreters10 } from 'tests/msw/fixtures/publicInterpreters10';

describe('PublicHomePage', () => {
  it('should show number of loaded interpreters in the search button', async () => {
    render(<PublicHomePage />);

    const searchBtnEl = await screen.findByRole('button', {
      name: `buttons.search (${publicInterpreters10.length})`,
    });

    expect(searchBtnEl).toBeInTheDocument();
  });

  it('should show additional details of an interpreter when its row is clicked', async () => {
    // Interpreter info
    const INTERPRETER_ID = 6;
    const [interpreter] = publicInterpreters10.filter(
      (i) => i.id === INTERPRETER_ID
    );
    const interpreterEmail = interpreter?.email as string;
    const interpreterPhoneNumber = interpreter?.phoneNumber as string;
    Element.prototype.scrollIntoView = jest.fn();

    // Render the component
    render(<PublicHomePage />);

    const searchBtnEl = await screen.findByRole('button', {
      name: `buttons.search (${publicInterpreters10.length})`,
    });
    await userEvent.click(searchBtnEl);
    const interpreterRowEl = screen.getByTestId(
      `public-interpreters__id-${INTERPRETER_ID}-row`
    );
    await userEvent.click(interpreterRowEl);

    expect(screen.getByText(interpreterEmail)).toBeInTheDocument();
    expect(screen.getByText(interpreterPhoneNumber)).toBeInTheDocument();
  });

  it('should filter data based on active filters', async () => {
    render(<PublicHomePage />);

    // Check initial number of interpreters
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn')
    ).toHaveTextContent('10');

    // Select to field
    await userEvent.click(
      await screen.findByRole('combobox', {
        name: 'languagePair.toPlaceholder',
      })
    );
    await userEvent.click(screen.getByRole('option', { name: /DA/ }));
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn')
    ).toHaveTextContent('4');

    //Select the region
    await userEvent.click(
      screen.getByRole('combobox', {
        name: 'region.placeholder',
      })
    );
    await userEvent.click(screen.getByRole('option', { name: /05/ }));
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn')
    ).toHaveTextContent('2');

    // Type the name
    await userEvent.type(
      screen.getByLabelText('name.placeholder', { selector: 'input' }),
      'ville',
      { delay: 300 }
    );
    expect(
      await screen.findByTestId('public-interpreter-filters__search-btn')
    ).toHaveTextContent('1');
  });
});
