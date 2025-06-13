import { render } from '@testing-library/react';

import { CustomCircularProgress } from './CustomCircularProgress';
import { Color } from '../../enums/common';

describe('CustomCircularProgress', () => {
  it('should render correctly', () => {
    const { container } = render(
      <CustomCircularProgress size={'3rem'} color={Color.Secondary} />,
    );
    expect(container).toMatchSnapshot();
  });
});
