import { render } from '@testing-library/react';

import { CustomSelect } from './CustomSelect';

describe('CustomSelect', () => {
  it('should render correctly', () => {
    const values = new Map<string, string>([
      ['Option A', 'A'],
      ['Option B', 'B'],
      ['Option C', 'C'],
    ]);
    const { container } = render(<CustomSelect values={values} value="B" />);
    expect(container).toMatchSnapshot();
  });
});
