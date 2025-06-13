import { render } from '@testing-library/react';

import { OPHLogoViewer } from './OPHLogoViewer';
import { AppLanguage, Direction } from '../../enums/common';

describe('OPHLogoViewer', () => {
  it('should render OPHLogoViewer correctly', () => {
    const { container } = render(
      <OPHLogoViewer
        direction={Direction.Horizontal}
        alt="Opetushallituksen logo"
        currentLang={AppLanguage.Finnish}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
