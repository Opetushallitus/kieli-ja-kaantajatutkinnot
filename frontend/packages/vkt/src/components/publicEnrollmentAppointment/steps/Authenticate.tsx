import { useState } from 'react';
import { useParams } from 'react-router';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { cancelPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { RouteUtils } from 'utils/routes';

export const Authenticate = () => {
  const params = useParams();
  const [isAuthRedirecting, setIsAuthRedirecting] = useState(false);
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });
  const translateCommon = useCommonTranslation();
  const enrollmentId = +params.enrollmentId;

  const dispatch = useAppDispatch();

  const onAuthenticate = () => {
    setIsAuthRedirecting(true);

    const type = 'appointment';

    window.location.href = RouteUtils.getAuthLoginApiRoute(enrollmentId, type);
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
