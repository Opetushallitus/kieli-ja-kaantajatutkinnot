import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';

import { LoadingProgressIndicator } from 'components/elements/LoadingProgressIndicator';

describe('LoadingProgressIndicator', () => {
  it('should render LoadingProgressIndicator correctly', () => {
    const tree = renderer
      .create(<LoadingProgressIndicator isLoading={true} />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should show a spinner when component is in loading state', () => {
    const { container } = render(<LoadingProgressIndicator isLoading={true} />);
    const circularProgressElement = container.getElementsByClassName(
      'custom-circular-progress'
    );

    expect(circularProgressElement.length).toBe(1);
  });
});
