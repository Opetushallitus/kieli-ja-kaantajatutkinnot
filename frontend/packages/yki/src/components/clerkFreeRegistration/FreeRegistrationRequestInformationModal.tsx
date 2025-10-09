import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { CustomButton, CustomModal, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { submitClerkFreeRegistrationInformationRequest } from 'redux/reducers/clerkFreeRegistration';

type FreeRegistrationRequestInformationModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

export const FreeRegistrationRequestInformationModal = ({
  isModalOpen,
  setIsModalOpen,
}: FreeRegistrationRequestInformationModalProps) => {
  const [message, _setMessage] = useState('');
  const [dueDate, _setDueDate] = useState<Dayjs>(() => {
    const now = dayjs();

    return now.add(7, 'day');
  });
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <CustomModal
      open={isModalOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modal-title"
      modalTitle={t('details.modals.informationRequest.title')}
      // modalTitle={
      //   <Box
      //     display="flex"
      //     justifyContent="space-between"
      //     alignItems="flex-start"
      //     gap={1}
      //   >
      //     <H1>{t('details.modals.approve.title')}</H1>
      //     <CloseIcon
      //       color={Color.Primary}
      //       aria-hidden={true}
      //       fontSize="large"
      //       onClick={handleCloseModal}
      //     />
      //   </Box>
      // }
    >
      <div className="rows gapped">
        <Text className="margin-top">kajsdakjsd</Text>

        <div className="columns gapped flex-end">
          <CustomButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleCloseModal}
          >
            {translateCommon('cancel')}
          </CustomButton>
          <CustomButton
            variant={Variant.Contained}
            color={Color.Primary}
            onClick={() => {
              dispatch(
                submitClerkFreeRegistrationInformationRequest({
                  message,
                  dueDate,
                }),
              );
              handleCloseModal();
            }}
          >
            {t('details.buttons.approveFreeRegistration')}
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
