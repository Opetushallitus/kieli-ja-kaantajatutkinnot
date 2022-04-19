import renderer from 'react-test-renderer';

import Footer from 'components/layouts/Header';

describe('Footer', () => {
  it('should render Footer correctly', () => {
    const tree = renderer.create(<Footer />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
