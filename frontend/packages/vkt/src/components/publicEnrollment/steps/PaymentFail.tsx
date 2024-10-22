import { useEffect, useState } from 'react';
import {
  CustomButton,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { cancelPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { RouteUtils } from 'utils/routes';

export const PaymentFail = ({
  enrollment,
}: {
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const { showToast } = useToast();
  const { showDialog } = useDialog();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { cancelStatus } = useAppSelector(publicEnrollmentSelector);
  const isCancelLoading = cancelStatus === APIResponseStatus.InProgress;
  const isLoading = isPaymentLoading || isCancelLoading;

  const handleTryAgainBtnClick = () => {
    setIsPaymentLoading(true);

    // Safari needs time to re-render loading indicator
    setTimeout(() => {
      window.location.href = RouteUtils.getPaymentCreateApiRoute(
        'reservation',
        enrollment.id,
      );
    }, 200);
  };

  const handleCancelBtnClick = () => {
    showDialog({
      title: t('controlButtons.cancelDialog.title'),
      severity: Severity.Info,
      description: t('controlButtons.cancelDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            dispatch(cancelPublicEnrollment());
          },
        },
      ],
    });
  };

  useEffect(() => {
    showToast({
      severity: Severity.Error,
      description: t('steps.paymentFail.toast'),
    });
  }, [t, showToast]);

  return (
    <div className="margin-top-lg rows gapped">
      <Text>{t('steps.paymentFail.description')}</Text>
      <div className="columns flex-start gapped margin-top-lg">
        <LoadingProgressIndicator
          translateCommon={translateCommon}
          isLoading={isCancelLoading}
        >
          <CustomButton
            variant={Variant.Outlined}
            color={Color.Secondary}
            onClick={handleCancelBtnClick}
            disabled={isLoading}
          >
            {t('steps.paymentFail.cancel')}
          </CustomButton>
        </LoadingProgressIndicator>
        <LoadingProgressIndicator
          translateCommon={translateCommon}
          isLoading={isPaymentLoading}
        >
          <CustomButton
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={handleTryAgainBtnClick}
            disabled={isLoading}
          >
            {t('steps.paymentFail.tryAgain')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </div>
  );
};
