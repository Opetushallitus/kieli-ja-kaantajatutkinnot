import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CustomButton,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { resetPublicEnrollmentAppointment } from 'redux/reducers/publicEnrollmentAppointment';
import { RouteUtils } from 'utils/routes';

export const Authenticate = () => {
  const params = useParams();
  const [isAuthRedirecting, setIsAuthRedirecting] = useState(false);
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!params.enrollmentId) {
    return <></>;
  }

  const enrollmentId = +params.enrollmentId;

  const onAuthenticate = () => {
    setIsAuthRedirecting(true);

    const type = 'appointment';

    window.location.href = RouteUtils.getAuthLoginApiRoute(enrollmentId, type);
  };

  const onCancel = () => {
    dispatch(resetPublicEnrollmentAppointment());
    navigate(AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
  };

  return (
    <div className="margin-top-xxl rows gapped">
      <Text>{t('description')}</Text>
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
