import renderer from 'react-test-renderer';

import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <SkipLink
          text="Link that looks like text"
          href="http://example.invalid"
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
