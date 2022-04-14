import { render } from '@testing-library/react';

import { CustomModal } from 'components/elements/CustomModal';

// TODO The snapshots created look sensible, but rendering directly into document.body
// is discouraged. Figure out a better way to render the modals.

describe('CustomModal', () => {
  it('should render correctly when not open', () => {
    const { container } = render(
      <CustomModal
        open={false}
        onCloseModal={() => {
          return;
        }}
      >
        <div>Sisältöä tarvitaan</div>
      </CustomModal>,
      { container: document.body }
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when it is opened', () => {
    const { container } = render(
      <CustomModal
        open={true}
        onCloseModal={() => {
          return;
        }}
        ariaLabelledBy="testAriaLabel"
        screenReaderTitle="This is a screen reader title"
        modalTitle="Title for the modal"
      >
        <div>Lisää tekstiä</div>
      </CustomModal>,
      { container: document.body }
    );
    expect(container).toMatchSnapshot();
  });
});
