import { screen } from '@testing-library/dom';
import dayjs from 'dayjs';

import { ClerkHomePage } from 'pages/ClerkHomePage';
import { fakeSystemTime, render } from 'tests/jest/test-utils';
import { clerkInterpreters10 } from 'tests/msw/fixtures/clerkInterpreters10';

const waitForRenderedResults = async () => {
  const effectiveToggleFilter = await screen.findByRole('button', {
    name: `effective (${clerkInterpreters10.length})`,
  });
  expect(effectiveToggleFilter).toBeInTheDocument();
};

const fixedDateForTests = dayjs('2022-06-10T16:00:00+0200');

beforeEach(() => {
  fakeSystemTime(fixedDateForTests);
});

describe('ClerkHomePage', () => {
  it('should render correctly', async () => {
    const tree = render(<ClerkHomePage />);
    await waitForRenderedResults();
    expect(tree).toMatchSnapshot();
  });
});
