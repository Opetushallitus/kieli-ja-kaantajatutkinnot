import { render } from '@testing-library/react';

import { Svg } from './Svg';
import OPHLogoENHorizontal from '../../statics/svg/oph_logo_horiz_en.svg';

describe('Svg', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Svg
        className="foo"
        src={OPHLogoENHorizontal}
        alt="alternate text goes here"
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
