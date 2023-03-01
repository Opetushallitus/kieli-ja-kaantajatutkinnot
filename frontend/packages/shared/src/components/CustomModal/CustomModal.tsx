import Modal, { ModalProps } from '@mui/material/Modal';
import { FC } from 'react';

import { H2 } from '../Text/Text';
import './CustomModal.scss';

type CustomModalProps = ModalProps & {
  screenReaderTitle?: string;
  modalTitle?: string;
  onCloseModal: () => void;
};

export const CustomModal: FC<CustomModalProps> = ({
  open,
  children,
  modalTitle,
  onCloseModal,
  ...props
}) => {
  const handleOnClose = (event: React.SyntheticEvent, reason: string) => {
    if (event && reason === 'backdropClick') {
      return;
    }
    onCloseModal();
  };

  return (
    <Modal
      {...props}
      role="alertdialog"
      aria-modal={true}
      open={open}
      onClose={handleOnClose}
    >
      <div className="custom-modal">
        <div className="rows gapped">
          <H2 id={props['aria-labelledby']}>{modalTitle}</H2>
          {children}
        </div>
      </div>
    </Modal>
  );
};
