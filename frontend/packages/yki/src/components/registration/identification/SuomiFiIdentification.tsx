import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { increaseActiveStep } from 'redux/reducers/examSession';
import { examSessionSelector } from 'redux/selectors/examSession';

export const SuomiFiIdentification = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });

  return (
    <>
      <Text>
        <Trans t={t} i18nKey={'withFinnishSSN'} />
      </Text>
      <CustomButton
        className="public-registration__grid__form-container__registration-button"
        size="large"
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={() => {
          // TODO: init authentication for suomi.fi
          dispatch(increaseActiveStep());
          navigate(
            AppRoutes.ExamSessionRegistration.replace(
              /:examSessionId$/,
              `${examSession.id}`
            )
          );
        }}
      >
        {t('suomiFiButtonText')}
      </CustomButton>
    </>
  );
};
