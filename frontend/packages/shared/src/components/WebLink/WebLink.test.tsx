import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import renderer from 'react-test-renderer';

import { WebLink } from './WebLink';

describe('WebLink', () => {
  it('should render correctly without icons', () => {
    const tree = renderer
      .create(<WebLink href="http://localhost:4000" label="Localhost" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with start and end icons', () => {
    const tree = renderer
      .create(
        <WebLink
          href="http://localhost:4000"
          label="Localhost"
          target=""
          startIcon={<DownloadIcon />}
          endIcon={<OpenInNewIcon />}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
