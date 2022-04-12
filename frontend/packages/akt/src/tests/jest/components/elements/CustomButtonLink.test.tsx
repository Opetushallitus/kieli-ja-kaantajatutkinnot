import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { CustomButtonLink } from 'components/elements/CustomButtonLink';
import { AppRoutes } from 'enums/app';

describe('CustomButtonLink', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <BrowserRouter>
          <CustomButtonLink to={AppRoutes.PublicHomePage} />
        </BrowserRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
