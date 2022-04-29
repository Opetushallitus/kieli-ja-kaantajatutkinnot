import { Icecream } from '@mui/icons-material';
import renderer from 'react-test-renderer';

import { CustomIconButton } from './CustomIconButton';

describe('CustomIconButton', () => {
  it('should render correctly with QuestionMark icon by default', () => {
    const tree = renderer.create(<CustomIconButton />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with Icon as child', () => {
    const tree = renderer
      .create(
        <CustomIconButton>
          <Icecream />
        </CustomIconButton>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
