import { render } from '@testing-library/react';

import { InfoText } from './InfoText';

describe('InfoText', () => {
  it('should render correctly', () => {
    const { container } = render(<InfoText>This is an info text</InfoText>);
    expect(container).toMatchSnapshot();
  });
});
