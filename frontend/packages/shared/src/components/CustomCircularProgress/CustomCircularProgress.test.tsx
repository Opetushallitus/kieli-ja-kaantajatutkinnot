import renderer from 'react-test-renderer';

import { CustomCircularProgress } from './CustomCircularProgress';
import { Color } from 'enums/common';

describe('CustomCircularProgress', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(<CustomCircularProgress size={'3rem'} color={Color.Secondary} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
