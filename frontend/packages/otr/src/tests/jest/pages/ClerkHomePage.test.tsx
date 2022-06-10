//import renderer from 'react-test-renderer';

import { screen } from '@testing-library/dom';

import { ClerkHomePage } from 'pages/ClerkHomePage';
import { render } from 'tests/jest/test-utils';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';

const waitForRenderedResults = async () => {
  const effectiveToggleFilter = await screen.findByRole('button', {
    name: `effective (${clerkInterpreters10.length})`,
  });
  expect(effectiveToggleFilter).toBeInTheDocument();
};

describe('ClerkHomePage', () => {
  it('should render correctly', async () => {
    const tree = render(<ClerkHomePage />);
    await waitForRenderedResults();
    expect(tree).toMatchSnapshot();
  });
});
