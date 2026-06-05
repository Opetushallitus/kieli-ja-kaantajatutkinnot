import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Trans } from 'react-i18next';
import { CustomModal } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ClerkActiveQuarantine } from 'interfaces/clerkQuarantine';
import { H2, Text } from 'ophTheme/Text';
import { clerkQuarantineSelector } from 'redux/selectors/clerkQuarantine';
import { languageToString } from 'utils/clerk';

type DeleteQuarantineConfirmationModalProps = {
  quarantine: ClerkActiveQuarantine | null;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteQuarantineConfirmationModal = ({
  quarantine,
  onClose,
  onConfirm,
}: DeleteQuarantineConfirmationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.modals.delete',
  });
  const { deleteStatus } = useAppSelector(clerkQuarantineSelector);

  const isDeleting = deleteStatus === APIResponseStatus.InProgress;
  const identifier =
    quarantine?.quarantinedPerson.ssn ??
    quarantine?.quarantinedPerson.birthdate ??
    '';

  return (
    <CustomModal
      open={quarantine !== null}
      onCloseModal={onClose}
      aria-labelledby="delete-quarantine-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2 id="delete-quarantine-modal-title">{t('title')}</H2>
          <IconButton aria-label={t('close')} onClick={onClose}>
            <CloseIcon
              color={Color.Inherit}
              aria-hidden={true}
              fontSize="large"
            />
          </IconButton>
        </Box>
      }
    >
      <div className="rows gapped" data-testid="delete-quarantine-modal">
        {quarantine && (
          <Text className="margin-top">
            <Trans
              t={t}
              i18nKey="description"
              components={{ bold: <strong /> }}
              values={{
                firstName: quarantine.quarantinedPerson.firstName,
                lastName: quarantine.quarantinedPerson.lastName,
                identifier,
                startDate: quarantine.startDate.format('D.M.YYYY'),
                endDate: quarantine.endDate.format('D.M.YYYY'),
                examLanguage: languageToString(quarantine.languageCode),
              }}
            />
          </Text>
        )}

        <div className="columns gapped flex-end">
          <OphButton
            variant={Variant.Outlined}
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {t('confirm')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
