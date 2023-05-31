import { useEffect } from 'react';
import { CustomButton, H2, Text } from 'shared/components';
import { Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { cancelPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetSelectedPublicExamEvent } from 'redux/reducers/publicExamEvent';

export const Fail = ({ enrollment }: { enrollment: PublicEnrollment }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  const handleTryAgainBtnClick = () => {
    window.location.href = `${APIEndpoints.Payment}/create/${enrollment.id}/redirect`;
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
            dispatch(resetSelectedPublicExamEvent());
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
        <CustomButton
          variant={Variant.Outlined}
          color={Color.Secondary}
          onClick={handleCancelBtnClick}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <CustomButton
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={handleTryAgainBtnClick}
        >
          {t('steps.fail.tryAgain')}
        </CustomButton>
      </div>
    </div>
  );
};
