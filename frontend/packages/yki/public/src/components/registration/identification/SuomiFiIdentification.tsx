import { CustomButton, H3, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

export const SuomiFiIdentification = () => {
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { initRegistration } = useAppSelector(registrationSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  const registrationKind = ExamSessionUtils.getRegistrationKind({
    examSession,
    partialExamType: initRegistration.partialExamType,
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
        href={`${APIEndpoints.Authenticate}?examSessionId=${
          examSession.id
        }&toQueue=${
          registrationKind === RegistrationKind.Queue
        }&registrationId=${initRegistration.registrationId}`}
      >
        {t('suomiFiButtonText')}
      </CustomButton>
    </>
  );
};
