import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, H2, Text } from 'shared/components';
import { Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetPublicExamEventSelections } from 'redux/reducers/publicExamEvent';

export const Done = ({
  activeStep,
  enrollment,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.done',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const resetAndRedirect = () => {
    dispatch(resetPublicExamEventSelections());
    dispatch(resetPublicEnrollment());
    navigate(AppRoutes.PublicHomePage);
  };

  useEffect(() => {
    showToast({
      severity: Severity.Success,
      description: t('successToast'),
    });
  }, [t, showToast]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>
        {activeStep == PublicEnrollmentFormStep.Done
          ? t('title.queue')
          : t('title.reservation')}
      </H2>
      <Text>
        <strong>{`${t('description.part1')}: ${enrollment.email}`}</strong>
      </Text>
      <Text>{t('description.part2')}</Text>
      <CustomButton
        className="align-self-start margin-top-lg"
        color="secondary"
        variant="contained"
        onClick={resetAndRedirect}
      >
        {translateCommon('frontPage')}
      </CustomButton>
    </div>
  );
};
