import { render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';

import { LangSelector } from 'components/i18n/LangSelector';

describe('LangSelector', () => {
  it('should render LangSelector correctly', () => {
    const tree = renderer.create(<LangSelector />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should show the Finnish language as a default language', () => {
    render(<LangSelector />);

    expect(screen.getByText('lang.fi')).toBeInTheDocument();
  });
});
