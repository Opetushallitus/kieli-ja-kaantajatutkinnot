import { render } from '@testing-library/react';

import { LoadingProgressIndicator } from './LoadingProgressIndicator';

describe('LoadingProgressIndicator', () => {
  it('should render LoadingProgressIndicator correctly', () => {
    const { container } = render(<LoadingProgressIndicator isLoading={true} />);

    expect(container).toMatchSnapshot();
  });

  it('should show a spinner when component is in loading state', () => {
    const { container } = render(<LoadingProgressIndicator isLoading={true} />);
    const circularProgressElement = container.getElementsByClassName(
      'custom-circular-progress',
    );

    expect(circularProgressElement.length).toBe(1);
  });
});
