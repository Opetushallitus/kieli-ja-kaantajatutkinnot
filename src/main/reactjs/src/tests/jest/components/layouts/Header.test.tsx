import renderer from 'react-test-renderer';

import Header from 'components/layouts/Header';

describe('Header', () => {
  it('should render Header correctly', () => {
    const tree = renderer.create(<Header />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
