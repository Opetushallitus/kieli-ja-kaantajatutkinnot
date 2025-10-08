import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { CustomButton, CustomModal, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { approveFreeRegistration } from 'redux/reducers/clerkFreeRegistration';

type FreeRegistrationModalProps = {
  isAproveModalOpen: boolean;
  setIsApproveModal: (isOpen: boolean) => void;
};

export const FreeRegistrationModal = ({
  isAproveModalOpen,
  setIsApproveModal,
}: FreeRegistrationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();

  return (
    <CustomModal
      open={isAproveModalOpen}
      onCloseModal={() => setIsApproveModal(false)}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          {t('details.modal.title')}
          <CloseIcon
            color={Color.Primary}
            aria-hidden={true}
            onClick={() => setIsApproveModal(false)}
          />
        </Box>
      }
    >
      <div className="rows gapped">
        <Text className="margin-top">{t('details.modal.subTitle')}</Text>

        <div className="columns gapped flex-end">
          <CustomButton
            data-testid="freeregistration-modal__cancel"
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={() => setIsApproveModal(false)}
          >
            {translateCommon('cancel')}
          </CustomButton>
          <CustomButton
            data-testid="freeregistration-modal__approve"
            variant={Variant.Contained}
            color={Color.Primary}
            onClick={() => {
              dispatch(approveFreeRegistration());
              setIsApproveModal(false);
            }}
          >
            {t('details.buttons.approveFreeRegistration')}
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
