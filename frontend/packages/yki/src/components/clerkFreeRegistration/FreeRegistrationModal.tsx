import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { CustomButton, CustomModal, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { H1 } from 'ophTheme/Text';
import {
  approveFreeRegistration,
  rejectFreeRegistration,
} from 'redux/reducers/clerkFreeRegistration';

type FreeRegistrationModalProps = {
  isApproveModalOpen: boolean;
  setIsApproveModal: (isOpen: boolean) => void;
  isRejectModalOpen: boolean;
  setIsRejectModal: (isOpen: boolean) => void;
};

export const FreeRegistrationModal = ({
  isApproveModalOpen,
  setIsApproveModal,
  isRejectModalOpen,
  setIsRejectModal,
}: FreeRegistrationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();

  return (
    <>
      <CustomModal
        open={isApproveModalOpen}
        onCloseModal={() => setIsApproveModal(false)}
        aria-labelledby="modal-title"
        modalTitle={
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <H1>{t('details.modals.approve.title')}</H1>
            <CloseIcon
              color={Color.Primary}
              aria-hidden={true}
              fontSize="large"
              onClick={() => setIsApproveModal(false)}
            />
          </Box>
        }
      >
        <div className="rows gapped">
          <Text className="margin-top">
            {t('details.modals.approve.subTitle')}
          </Text>

          <div className="columns gapped flex-end">
            <CustomButton
              variant={Variant.Outlined}
              color={Color.Primary}
              onClick={() => setIsApproveModal(false)}
            >
              {translateCommon('cancel')}
            </CustomButton>
            <CustomButton
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

      <CustomModal
        open={isRejectModalOpen}
        onCloseModal={() => setIsRejectModal(false)}
        aria-labelledby="modal-title"
        modalTitle={
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <H1>{t('details.modals.reject.title')}</H1>
            <CloseIcon
              color={Color.Primary}
              aria-hidden={true}
              fontSize="large"
              onClick={() => setIsRejectModal(false)}
            />
          </Box>
        }
      >
        <div className="rows gapped">
          <Text className="margin-top">
            {t('details.modals.reject.subTitle')}
          </Text>

          <div className="columns gapped flex-end">
            <CustomButton
              variant={Variant.Outlined}
              color={Color.Primary}
              onClick={() => setIsRejectModal(false)}
            >
              {translateCommon('cancel')}
            </CustomButton>
            <CustomButton
              variant={Variant.Contained}
              color={Color.Primary}
              onClick={() => {
                dispatch(rejectFreeRegistration());
                setIsRejectModal(false);
              }}
            >
              {t('details.buttons.rejectFreeRegistration')}
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </>
  );
};
