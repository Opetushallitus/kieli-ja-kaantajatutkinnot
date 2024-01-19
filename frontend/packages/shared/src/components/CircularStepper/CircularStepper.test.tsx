import renderer from 'react-test-renderer';

import { CircularStepper } from './CircularStepper';

describe('CircularStepper', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <CircularStepper
          phaseText="Test Phase 1"
          ariaLabel="phase Test Phase 1: Description text"
          value={33}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
