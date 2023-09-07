import renderer from 'react-test-renderer';

import { Svg } from './Svg';
import OPHLogoENHorizontal from '../../statics/svg/oph_logo_horiz_en.svg';

describe('Svg', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <Svg
          className="foo"
          src={OPHLogoENHorizontal}
          alt="alternate text goes here"
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
