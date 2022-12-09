import { useCallback, useEffect } from 'react';
import { CustomButton, H2, Text } from 'shared/components';
import { Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicUIViews } from 'enums/app';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetPublicExamEventSelections } from 'redux/reducers/publicExamEvent';
import { setPublicUIView } from 'redux/reducers/publicUIView';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicEnrollmentComplete = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.complete',
  });
  const translateCommon = useCommonTranslation();

  const {
    enrollment: { email },
  } = useAppSelector(publicEnrollmentSelector);

  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const resetAndRedirect = useCallback(() => {
    dispatch(resetPublicExamEventSelections());
    dispatch(setPublicUIView(PublicUIViews.ExamEventListing));
    dispatch(resetPublicEnrollment());
  }, [dispatch]);

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
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        <strong>{`${t('description.part1')}: ${email}`}</strong>
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