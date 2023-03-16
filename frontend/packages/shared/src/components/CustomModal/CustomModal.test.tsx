import { render } from '@testing-library/react';

import { CustomModal } from './CustomModal';

// TODO The snapshots created look sensible, but rendering directly into document.body
// is discouraged. Figure out a better way to render the modals.

describe('CustomModal', () => {
  it('should render correctly when not open', () => {
    const { baseElement } = render(
      <CustomModal
        open={false}
        onCloseModal={() => {
          return;
        }}
        aria-labelledby="test-modal-title"
      >
        <div>Sisältöä tarvitaan</div>
      </CustomModal>
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('should render correctly when it is opened', () => {
    const { baseElement } = render(
      <CustomModal
        open={true}
        onCloseModal={() => {
          return;
        }}
        modalTitle="Title for the modal"
        aria-labelledby="test-modal-title"
      >
        <div>Lisää tekstiä</div>
      </CustomModal>
    );
    expect(baseElement).toMatchSnapshot();
  });
});
