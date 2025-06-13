import { render } from '@testing-library/react';

import { CircularStepper } from './CircularStepper';

describe('CircularStepper', () => {
  it('should render correctly', () => {
    const { container } = render(
      <CircularStepper
        phaseText="Test Phase 1"
        ariaLabel="phase Test Phase 1: Description text"
        value={33}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
