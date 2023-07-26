import { Trans } from 'react-i18next';
import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';

export const SuomiFiIdentification = () => {
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <>
      <Text>
        <Trans t={t} i18nKey={'withFinnishSSN.description'} />
        <br />
        {t('withFinnishSSN.info')}
      </Text>
      <CustomButton
        className="public-registration__grid__form-container__registration-button"
        size="large"
        variant={Variant.Contained}
        color={Color.Secondary}
        href={`${APIEndpoints.SuomiFiAuthRedirect}?examSessionId=${examSession.id}&use-yki-ui=true`}
      >
        {t('suomiFiButtonText')}
      </CustomButton>
    </>
  );
};
