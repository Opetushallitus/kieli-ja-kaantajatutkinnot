import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkFreeEnrollmentDetails } from 'redux/reducers/clerkFreeEnrollmentDetails';
import { clerkFreeEnrollmentDetailsSelector } from 'redux/selectors/clerkFreeEnrollmentDetails';

export const ClerkFreeEnrollmentDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeEnrollmentDetails',
  });

  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { status, enrollmentDetails } = useAppSelector(
    clerkFreeEnrollmentDetailsSelector,
  );

  const translateCommon = useCommonTranslation();

  const translateLanguage = (language: string) =>
    translateCommon('languages.' + language);

  const translateLevel = (level: string) =>
    translateCommon('languageLevel.' + level);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      params.id &&
      !isNaN(+params.id)
    ) {
      dispatch(loadClerkFreeEnrollmentDetails(+params.id));
    } else if (status === APIResponseStatus.Error || isNaN(Number(params.id))) {
      showToast({
        severity: Severity.Error,
        description: t('component.clerkFreeExamDetails.toasts.notFound'),
      });
      navigate(AppRoutes.ClerkFreeEnrollment);
    }
  }, [dispatch, navigate, params.id, showToast, status, t]);

  if (!enrollmentDetails) {
    return null;
  }

  return (
    <div className="rows gapped">
      <div>
        <Text>
          <b>{enrollmentDetails.person.fullName}</b>
          {`(${enrollmentDetails.person.socialSecurityNumber})`}
        </Text>
        <Text>
          {translateLanguage(enrollmentDetails.examSession.language)}
          {' - '}
          {translateLevel(enrollmentDetails.examSession.level)}{' '}
          {DateUtils.formatOptionalDate(
            enrollmentDetails.examSession.examDate,
            'l',
          )}
        </Text>
      </div>
      <div className="columns gapped-xs align-items-start">
        <div className="rows gapped-xs">
          <Text>
            <b>Tarkastuksen tila</b>
          </Text>
          <Text>
            <b>Maksuttomuuden peruste</b>
          </Text>
          <Text>
            <b>Maksuttomia kertoja jäljellä</b>
          </Text>
          <Text>
            <b>Asiointikieli</b>
          </Text>
          <Text>
            <b>Ilmoittautunut vai jono</b>
          </Text>
          <Text>
            <b>Täydennyspyynnön eräpäivä</b>
          </Text>
          <Text>
            <b>Lisätiedot</b>
          </Text>
        </div>
        <div className="rows gapped-xs">
          <Text>{t(`status.${enrollmentDetails.status}`)}</Text>
          <Text>
            {t(`freeEnrollmentBasis.${enrollmentDetails.freeEnrollmentBasis}`)}
          </Text>
          <Text>
            {t('freeEnrollmentsLeft', {
              amount: enrollmentDetails.freeEnrollmentsLeft,
            })}
          </Text>
          <Text>{enrollmentDetails.languageOfCommunication}</Text>
          <Text>
            {enrollmentDetails.registration.kind === 'ADMISSION'
              ? t('registrationStatus.enrolled')
              : t('registrationStatus.queued', {
                  positionInQueue:
                    enrollmentDetails.registration.positionInQueue,
                  queue: enrollmentDetails.registration.queue,
                })}
          </Text>
          <Text>
            <Text>
              {enrollmentDetails.supplementRequestDueDate
                ? DateUtils.formatOptionalDate(
                    enrollmentDetails.supplementRequestDueDate,
                    'l',
                  )
                : '-'}
            </Text>
          </Text>
          <Text>
            {t('examView')}
            <br />
            {t('customerView')}
          </Text>
        </div>
      </div>
    </div>
  );
};
