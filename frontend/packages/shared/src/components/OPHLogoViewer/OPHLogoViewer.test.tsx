import renderer from 'react-test-renderer';

import { AppLanguage, Direction } from '../../enums/app';
import { OPHLogoViewer } from './OPHLogoViewer';

describe('OPHLogoViewer', () => {
  it('should render OPHLogoViewer correctly', () => {
    const tree = renderer
      .create(
        <OPHLogoViewer
          direction={Direction.Horizontal}
          alt="Opetushallituksen logo"
          currentLang={AppLanguage.Finnish}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
