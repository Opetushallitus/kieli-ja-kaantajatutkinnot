import renderer from 'react-test-renderer';

import { ExtLink } from './ExtLink';

describe('ExtLink', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(<ExtLink text="Test link" href="https://someothersite.com" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
