import { useEffect, useState } from 'react';
import {
  CustomButton,
  H2,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { cancelPublicEnrollment } from 'redux/reducers/publicEnrollment';

export const Fail = ({ enrollment }: { enrollment: PublicEnrollment }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const { showToast } = useToast();
  const { showDialog } = useDialog();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const handleTryAgainBtnClick = () => {
    setIsPaymentLoading(true);

    // Safari needs time to re-render loading indicator
    setTimeout(() => {
      window.location.href = `${APIEndpoints.Payment}/create/${enrollment.id}/redirect`;
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
            setIsCancelLoading(true);
            dispatch(cancelPublicEnrollment());
          },
        },
      ],
    });
  };

  useEffect(() => {
    showToast({
      severity: Severity.Error,
      description: t('steps.fail.title'),
    });
  }, [t, showToast]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('steps.fail.title')}</H2>
      <Text>{t('steps.fail.description')}</Text>
      <div className="columns flex-start gapped margin-top-lg">
        <LoadingProgressIndicator
          translateCommon={translateCommon}
          isLoading={isCancelLoading}
        >
          <CustomButton
            variant={Variant.Outlined}
            color={Color.Secondary}
            onClick={handleCancelBtnClick}
            disabled={isPaymentLoading || isCancelLoading}
          >
            {translateCommon('cancel')}
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
            disabled={isPaymentLoading || isCancelLoading}
          >
            {t('steps.fail.tryAgain')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </div>
  );
};
