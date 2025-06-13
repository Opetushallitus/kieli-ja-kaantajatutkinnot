import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { render } from '@testing-library/react';

import { CustomIconButton } from './CustomIconButton';

describe('CustomIconButton', () => {
  it('should render correctly with QuestionMark icon by default', () => {
    const { container } = render(<CustomIconButton />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with Icon as child', () => {
    const { container } = render(
      <CustomIconButton>
        <HelpOutlineIcon />
      </CustomIconButton>,
    );
    expect(container).toMatchSnapshot();
  });
});
