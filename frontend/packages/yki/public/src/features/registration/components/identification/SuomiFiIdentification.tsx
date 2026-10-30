import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { H3, Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { examSessionSelector } from 'features/registration/redux/selectors/examSession';
import { registrationSelector } from 'features/registration/redux/selectors/registration';
import { ExamSession } from 'interfaces/examSessions';

export const SuomiFiIdentification = () => {
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { registration } = useAppSelector(registrationSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <>
      <div className="rows">
        <H3>{t('withFinnishSSN.description')}</H3>
        <Text>{t('withFinnishSSN.info')}</Text>
      </div>
      <CustomButton
        className="public-registration__grid__form-container__registration-button"
        size="large"
        variant={Variant.Contained}
        color={Color.Secondary}
        href={APIEndpoints.AuthenticateV2.replace(
          ':examSessionId',
          String(examSession.id),
        ).replace(':registrationId', String(registration.id))}
      >
        {t('suomiFiButtonText')}
      </CustomButton>
    </>
  );
};
