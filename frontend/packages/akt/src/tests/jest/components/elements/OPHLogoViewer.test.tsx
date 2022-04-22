import renderer from 'react-test-renderer';

import { OPHLogoViewer } from 'components/elements/OPHLogoViewer';
import { Direction } from 'enums/app';

describe('OPHLogoViewer', () => {
  it('should render OPHLogoViewer correctly', () => {
    const tree = renderer
      .create(
        <OPHLogoViewer
          direction={Direction.Horizontal}
          alt="Opetushallituksen logo"
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
