import { useState } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { AppLanguage, Color, Variant } from 'shared/enums';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { cancelPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

export const Authenticate = ({ examEvent }: { examEvent: PublicExamEvent }) => {
  const [isAuthRedirecting, setIsAuthRedirecting] = useState(false);
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();

  const onAuthenticate = () => {
    setIsAuthRedirecting(true);

    window.location.href = APIEndpoints.PublicAuthLogin.replace(
      ':examEventId',
      examEvent.id.toString()
    )
      .replace(
        ':type',
        ExamEventUtils.hasOpenings(examEvent) ? 'reservation' : 'queue'
      )
      .replace(
        ':locale',
        getCurrentLang() === AppLanguage.Swedish ? 'sv' : 'fi'
      );
  };

  const onCancel = () => {
    dispatch(cancelPublicEnrollment());
  };

  return (
    <div className="margin-top-xxl rows gapped">
      <LoadingProgressIndicator
        translateCommon={translateCommon}
        isLoading={isAuthRedirecting}
      >
        <CustomButton
          data-testid="public-enrollment__authenticate-button"
          className="public-enrollment__grid__form-container__auth-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onAuthenticate}
          disabled={isAuthRedirecting}
        >
          {t('auth')}
        </CustomButton>
      </LoadingProgressIndicator>
      <CustomButton
        className="public-enrollment__grid__form-container__auth-button"
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={onCancel}
        disabled={isAuthRedirecting}
      >
        {translateCommon('cancel')}
      </CustomButton>
    </div>
  );
};
