import renderer from 'react-test-renderer';

import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<CustomButton />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
