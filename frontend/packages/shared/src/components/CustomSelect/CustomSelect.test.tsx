import renderer from 'react-test-renderer';

import { CustomSelect } from './CustomSelect';

describe('CustomSelect', () => {
  it('should render correctly', () => {
    const values = new Map<string, string>([
      ['Option A', 'A'],
      ['Option B', 'B'],
      ['Option C', 'C'],
    ]);
    const tree = renderer
      .create(<CustomSelect values={values} value="Option B" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
