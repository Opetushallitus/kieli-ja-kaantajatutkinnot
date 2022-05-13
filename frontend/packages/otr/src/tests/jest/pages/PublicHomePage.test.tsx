import { render, screen } from '@testing-library/react';

import { PublicHomePage } from 'pages/PublicHomePage';

describe('PublicHomePage', () => {
  it('should load the initial state', () => {
    render(<PublicHomePage />);
  });
});
