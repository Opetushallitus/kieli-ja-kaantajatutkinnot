import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { render } from '@testing-library/react';

import { WebLink } from './WebLink';

describe('WebLink', () => {
  it('should render correctly without icons', () => {
    const { container } = render(
      <WebLink href="http://localhost:4000" label="Localhost" />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with start and end icons', () => {
    const { container } = render(
      <WebLink
        href="http://localhost:4000"
        label="Localhost"
        target=""
        startIcon={<DownloadIcon />}
        endIcon={<OpenInNewIcon />}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
