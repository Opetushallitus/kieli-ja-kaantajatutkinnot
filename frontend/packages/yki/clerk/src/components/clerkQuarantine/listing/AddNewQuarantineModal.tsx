import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { H2 } from 'ophTheme/Text';

type AddNewQuarantineModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddNewQuarantineModal = ({
  isOpen,
  onClose,
}: AddNewQuarantineModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.activeQuarantines.modal',
  });

  return (
    <CustomModal
      open={isOpen}
      onCloseModal={onClose}
      aria-labelledby="add-new-quarantine-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('title')}</H2>
          <div style={{ cursor: 'pointer' }}>
            <CloseIcon
              color={Color.Inherit}
              aria-hidden={true}
              fontSize="large"
              onClick={onClose}
            />
          </div>
        </Box>
      }
    >
      <div className="columns gapped flex-end">
        <OphButton variant={Variant.Outlined} onClick={onClose}>
          {t('cancel')}
        </OphButton>
        <OphButton variant={Variant.Contained} onClick={onClose}>
          {t('submit')}
        </OphButton>
      </div>
    </CustomModal>
  );
};
