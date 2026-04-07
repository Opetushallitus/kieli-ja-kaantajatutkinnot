import Modal, { ModalProps } from '@mui/material/Modal';
import { FC, ReactNode, useCallback } from 'react';

import { H2 } from '../Text/Text';
import './CustomModal.scss';

type Role = 'dialog' | 'alertdialog';

type CustomModalProps = ModalProps & {
  modalTitle?: ReactNode | string;
  onCloseModal: () => void;
  role?: Role;
};

export const CustomModal: FC<CustomModalProps> = ({
  open,
  children,
  modalTitle,
  role,
  onCloseModal,
  ...props
}) => {
  const handleOnClose = (event: React.SyntheticEvent, reason: string) => {
    if (event && reason === 'backdropClick') {
      return;
    }
    onCloseModal();
  };

  const ariaLabelledBy = props['aria-labelledby'];

  const getModalTitle = useCallback(() => {
    if (typeof modalTitle === 'string') {
      return <H2 id={ariaLabelledBy}>{modalTitle}</H2>;
    }

    return modalTitle;
  }, [modalTitle, ariaLabelledBy]);

  return (
    <Modal
      {...props}
      role={role || 'alertdialog'}
      aria-modal={true}
      open={open}
      onClose={handleOnClose}
    >
      <div className="custom-modal">
        <div className="rows gapped">
          {getModalTitle()}
          {children}
        </div>
      </div>
    </Modal>
  );
};
