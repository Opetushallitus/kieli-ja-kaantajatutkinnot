import renderer from 'react-test-renderer';

import { OPHClerkLogo } from './OPHClerkLogo';

describe('OPHClerkLogo', () => {
  it('should render OPHClerkLogo correctly', () => {
    const tree = renderer
      .create(
        <OPHClerkLogo mainLabel="MainLabel" subLabel="SubLabel" alt="ImgAlt" />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
