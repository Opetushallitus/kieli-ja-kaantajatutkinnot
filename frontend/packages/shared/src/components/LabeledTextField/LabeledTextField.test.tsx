import { render } from '@testing-library/react';

import { LabeledTextField } from './LabeledTextField';

describe('LabeledTextField', () => {
  it('should render correctly with text', () => {
    const { container } = render(
      <LabeledTextField id="test-id" label="test label" value="test value" />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    const { container } = render(
      <LabeledTextField
        id="test-with-error"
        label="test label"
        placeholder="placeholder expected to appear between label and field"
        value="wrong test value"
        error={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
