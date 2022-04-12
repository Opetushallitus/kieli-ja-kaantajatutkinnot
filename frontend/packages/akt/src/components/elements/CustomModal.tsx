import Modal, { ModalProps } from '@mui/material/Modal';
import { FC } from 'react';

import { H2 } from 'components/elements/Text';

type CustomModalProps = ModalProps & {
  ariaLabelledBy?: string;
  screenReaderTitle?: string;
  modalTitle?: string;
  onCloseModal: () => void;
};

export const CustomModal: FC<CustomModalProps> = ({
  ariaLabelledBy,
  open,
  children,
  modalTitle,
  onCloseModal,
}) => {
  const handleOnClose = (event: React.SyntheticEvent, reason: string) => {
    if (event && reason === 'backdropClick') {
      return;
    }
    onCloseModal();
  };

  return (
    <Modal open={open} onClose={handleOnClose} aria-labelledby={ariaLabelledBy}>
      <div className="custom-modal">
        <div className="rows gapped">
          <H2 id={ariaLabelledBy}>{modalTitle}</H2>
          {children}
        </div>
      </div>
    </Modal>
  );
};
