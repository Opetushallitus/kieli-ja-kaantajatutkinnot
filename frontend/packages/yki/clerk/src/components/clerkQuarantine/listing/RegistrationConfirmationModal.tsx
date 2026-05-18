import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Trans } from 'react-i18next';
import { CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import {
  ClerkQuarantineMatch,
  ClerkQuarantineReview,
} from 'interfaces/clerkQuarantine';
import { H2, Text } from 'ophTheme/Text';
import { languageToString, levelDescription } from 'utils/clerk';

type RegistrationConfirmationModalProps = {
  match: ClerkQuarantineMatch | ClerkQuarantineReview | null;
  action: 'accept' | 'reject' | null;
  onClose: () => void;
  onConfirm: () => void;
};

export const RegistrationConfirmationModal = ({
  match,
  action,
  onClose,
  onConfirm,
}: RegistrationConfirmationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.modals',
  });

  const open = match !== null && action !== null;
  const keyPrefix = action ?? 'accept';
  const registrant = match?.registrant;

  return (
    <CustomModal
      open={open}
      onCloseModal={onClose}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t(`${keyPrefix}.title`)}</H2>
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
      <div className="rows gapped">
        {match && registrant && (
          <Text className="margin-top">
            <Trans
              t={t}
              i18nKey={`${keyPrefix}.description`}
              components={{ bold: <strong /> }}
              values={{
                firstName: registrant.firstName,
                lastName: registrant.lastName,
                ssn: registrant.ssn,
                examLanguage: languageToString(match.examLanguageCode),
                examLevel: levelDescription(match.examLevelCode),
                examDate: match.examDate.format('D.M.YYYY'),
              }}
            />
          </Text>
        )}

        <div className="columns gapped flex-end">
          <OphButton variant={Variant.Outlined} onClick={onClose}>
            {t(`${keyPrefix}.cancel`)}
          </OphButton>
          <OphButton variant={Variant.Contained} onClick={onConfirm}>
            {t(`button.${keyPrefix}`)}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
