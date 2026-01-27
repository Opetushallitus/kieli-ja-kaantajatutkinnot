import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { H2, Text } from 'ophTheme/Text';
import {
  approveFreeRegistration,
  rejectFreeRegistration,
} from 'redux/reducers/clerkFreeRegistration';

type FreeRegistrationModalProps = {
  freeRegistrationId: number;
  isApproveModalOpen: boolean;
  setIsApproveModal: (isOpen: boolean) => void;
  isRejectModalOpen: boolean;
  setIsRejectModal: (isOpen: boolean) => void;
};

export const FreeRegistrationModal = ({
  freeRegistrationId,
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
            <H2>{t('details.modals.approve.title')}</H2>
            <div className="free-registration-details__modal-close-icon">
              <CloseIcon
                color={Color.Inherit}
                aria-hidden={true}
                fontSize="large"
                onClick={() => setIsApproveModal(false)}
              />
            </div>
          </Box>
        }
      >
        <div className="rows gapped">
          <Text className="margin-top">
            {t('details.modals.approve.subTitle')}
          </Text>

          <div className="columns gapped flex-end">
            <OphButton
              variant={Variant.Outlined}
              onClick={() => setIsApproveModal(false)}
            >
              {translateCommon('cancel')}
            </OphButton>
            <OphButton
              variant={Variant.Contained}
              onClick={() => {
                dispatch(approveFreeRegistration(freeRegistrationId));
                setIsApproveModal(false);
              }}
            >
              {t('details.buttons.approveFreeRegistration')}
            </OphButton>
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
            <H2>{t('details.modals.reject.title')}</H2>
            <div className="free-registration-details__modal-close-icon">
              <CloseIcon
                color={Color.Inherit}
                aria-hidden={true}
                fontSize="large"
                onClick={() => setIsRejectModal(false)}
              />
            </div>
          </Box>
        }
      >
        <div className="rows gapped">
          <Text className="margin-top">
            {t('details.modals.reject.subTitle')}
          </Text>

          <div className="columns gapped flex-end">
            <OphButton
              variant={Variant.Outlined}
              onClick={() => setIsRejectModal(false)}
            >
              {translateCommon('cancel')}
            </OphButton>
            <OphButton
              variant={Variant.Contained}
              onClick={() => {
                dispatch(rejectFreeRegistration(freeRegistrationId));
                setIsRejectModal(false);
              }}
            >
              {t('details.buttons.rejectFreeRegistration')}
            </OphButton>
          </div>
        </div>
      </CustomModal>
    </>
  );
};
