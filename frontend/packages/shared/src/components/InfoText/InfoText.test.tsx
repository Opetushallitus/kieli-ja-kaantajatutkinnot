import renderer from 'react-test-renderer';

import { InfoText } from './InfoText';

describe('InfoText', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(<InfoText>This is an info text</InfoText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
