import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, H2, Text } from 'shared/components';
import { Color, Severity, Variant } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { RouteUtils } from 'utils/routes';

export const Fail = ({ examEvent }: { examEvent: PublicExamEvent }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fail',
  });
  const translateCommon = useCommonTranslation();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const redirectHome = () => {
    navigate(AppRoutes.PublicHomePage);
  };

  const redirectPreview = () => {
    RouteUtils.stepToRoute(PublicEnrollmentFormStep.Done, examEvent.id);
  };

  useEffect(() => {
    showToast({
      severity: Severity.Error,
      description: t('title'),
    });
  }, [t, showToast]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>{t('description')}</Text>
      <div className="columns flex-start gapped margin-top-lg">
        <CustomButton
          variant={Variant.Outlined}
          color={Color.Secondary}
          onClick={redirectPreview}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <CustomButton
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={redirectHome}
        >
          {t('tryAgain')}
        </CustomButton>
      </div>
    </div>
  );
};
