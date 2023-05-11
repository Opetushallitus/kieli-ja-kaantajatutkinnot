import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, H2, Text } from 'shared/components';
import { Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetPublicExamEventSelections } from 'redux/reducers/publicExamEvent';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const Done = ({ step }: { step: PublicEnrollmentFormStep }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.done',
  });
  const translateCommon = useCommonTranslation();

  const { enrollment } = useAppSelector(publicEnrollmentSelector);

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const resetAndRedirect = useCallback(() => {
    dispatch(resetPublicExamEventSelections());
    dispatch(resetPublicEnrollment());
    navigate(AppRoutes.PublicHomePage);
  }, [dispatch, navigate]);

  useEffect(() => {
    showToast({
      severity: Severity.Success,
      description: t('successToast'),
    });

    const timer = setTimeout(() => {
      resetAndRedirect();
    }, Duration.MediumExtra);

    return () => clearTimeout(timer);
  }, [t, showToast, resetAndRedirect]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>
        {step == PublicEnrollmentFormStep.Done
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
