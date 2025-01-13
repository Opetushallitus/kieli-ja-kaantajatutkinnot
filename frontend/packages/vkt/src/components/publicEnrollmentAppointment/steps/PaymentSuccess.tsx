import { useEffect } from 'react';
import { CustomButtonLink, Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes, ExamLevel } from 'enums/app';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import { PublicExaminerExamEvent } from 'interfaces/publicExaminerExamEvent';
import { resetPublicEnrollmentAppointment } from 'redux/reducers/publicEnrollmentAppointment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

const ExamEventDetails = ({
  examEvent,
}: {
  examEvent: Pick<
    PublicExaminerExamEvent,
    'date' | 'examiner' | 'language' | 'location'
  >;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.examEventDetails',
  });
  const { date, examiner, language, location } = examEvent;

  return (
    <div className="rows">
      <Text>
        {t('examLanguage')}:{' '}
        <b>{translateCommon(`examLanguage.${language}`)}</b>
      </Text>
      <Text>
        {t('examLevel')}:{' '}
        <b>{translateCommon(`examLevel.${ExamLevel.GOOD_AND_SATISFACTORY}`)}</b>
      </Text>
      <Text>
        {t('examiner')}: <b>{examiner.name}</b>
      </Text>
      {location && (
        <Text>
          {t('examLocation')}: <b>{location}</b>
        </Text>
      )}
      <Text>
        {t('examDate')}: <b>{DateUtils.formatOptionalDate(date)}</b>
      </Text>
    </div>
  );
};

export const PaymentSuccess = ({
  enrollment,
}: {
  enrollment: PublicEnrollmentAppointment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.steps.paymentSuccess',
  });
  const { examEvent, email } = enrollment;

  const dispatch = useAppDispatch();

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      dispatch(resetPublicEnrollmentAppointment());
    };
  }, [dispatch]);

  return (
    <div className="rows gapped-xxl">
      <div className="margin-top-lg rows gapped">
        <Text>
          {t('description1', {
            examFee:
              PublicEnrollmentUtils.calculateAppointmentPaymentSum(enrollment),
          })}
        </Text>
        {examEvent && <ExamEventDetails examEvent={examEvent} />}
        <Text>{t('description2', { email })}</Text>
      </div>
      <CustomButtonLink
        className="align-self-start"
        color="secondary"
        variant="contained"
        to={AppRoutes.PublicHomePage}
      >
        {t('backToHomePage')}
      </CustomButtonLink>
    </div>
  );
};
