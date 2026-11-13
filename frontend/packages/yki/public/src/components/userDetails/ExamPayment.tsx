import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import { DateUtils } from 'shared/utils';

import { Label, Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';

export const ExamPayment = ({
  registration,
}: {
  registration: PersonRegistrations;
}) => {
  const { paidAt, expiresAt, examFee, isFreeRegistration } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.examPayment',
  });

  if (
    registration.kind !== RegistrationKind.Admission ||
    ![RegistrationStates.Completed, RegistrationStates.Submitted].includes(
      registration.state,
    )
  ) {
    return null;
  }

  if (isFreeRegistration) {
    return (
      <div>
        <Label>{t('label')}</Label>
        <div className="columns gapped-xxs">
          <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
          <Text>{t('free')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>{t('label')}</Label>
      {paidAt && (
        <div className="columns gapped-xxs">
          <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
          <Text>
            {t('paidAt', {
              date: DateUtils.formatOptionalDate(paidAt, 'l'),
            })}
          </Text>
        </div>
      )}
      {!paidAt && (
        <div className="columns gapped-xxs">
          <WarningOutlinedIcon className="user-details-page__icon--alert align-self-start" />{' '}
          <div className="rows">
            <Text>
              {t('notPaid', {
                examFee,
              })}
            </Text>
            <Text className="user-details-page__text--alert">
              {t('expiresAt', {
                date: DateUtils.formatOptionalDate(expiresAt, 'l'),
              })}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};
