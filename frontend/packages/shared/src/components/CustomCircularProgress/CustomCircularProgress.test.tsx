import renderer from 'react-test-renderer';

import { Color } from '../../enums/common';
import { CustomCircularProgress } from './CustomCircularProgress';

describe('CustomCircularProgress', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(<CustomCircularProgress size={'3rem'} color={Color.Secondary} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
