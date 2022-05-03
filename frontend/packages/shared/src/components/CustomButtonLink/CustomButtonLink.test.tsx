import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { CustomButtonLink } from './CustomButtonLink';

describe('CustomButtonLink', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <BrowserRouter>
          <CustomButtonLink to="/" />
        </BrowserRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
