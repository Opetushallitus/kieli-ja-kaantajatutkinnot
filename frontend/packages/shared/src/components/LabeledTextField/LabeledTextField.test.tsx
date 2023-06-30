import renderer from 'react-test-renderer';

import { LabeledTextField } from './LabeledTextField';

describe('CustomTextField', () => {
  it('should render correctly with text', () => {
    const tree = renderer
      .create(
        <LabeledTextField id="test-id" label="test label" value="test value" />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    const tree = renderer
      .create(
        <LabeledTextField
          id="test-with-error"
          label="test label"
          placeholder="placeholder expected to appear between label and field"
          value="wrong test value"
          error={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
