import renderer from 'react-test-renderer';

import { OPHLogoViewer } from './OPHLogoViewer';
import { AppLanguage, Direction } from '../../enums/common';

describe('OPHLogoViewer', () => {
  it('should render OPHLogoViewer correctly', () => {
    const tree = renderer
      .create(
        <OPHLogoViewer
          direction={Direction.Horizontal}
          alt="Opetushallituksen logo"
          currentLang={AppLanguage.Finnish}
        />,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
