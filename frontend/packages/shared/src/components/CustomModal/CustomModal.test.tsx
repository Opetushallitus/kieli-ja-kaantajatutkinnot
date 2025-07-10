import { render } from '@testing-library/react';

import { CustomModal } from './CustomModal';

describe('CustomModal', () => {
  it('should render correctly when not open', () => {
    const { container } = render(
      <CustomModal
        open={false}
        onCloseModal={() => {
          return;
        }}
        aria-labelledby="test-modal-title"
      >
        <div>Sisältöä tarvitaan</div>
      </CustomModal>,
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
        modalTitle="Title for the modal"
        aria-labelledby="test-modal-title"
      >
        <div>Lisää tekstiä</div>
      </CustomModal>,
    );
    expect(container).toMatchSnapshot();
  });
});
