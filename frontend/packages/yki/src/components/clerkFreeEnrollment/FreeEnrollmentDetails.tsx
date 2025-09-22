import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider } from '@mui/material';
import { ClockIcon } from '@mui/x-date-pickers';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomTextField, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkFreeEnrollmentDetails } from 'redux/reducers/clerkFreeEnrollmentDetails';
import { clerkFreeEnrollmentDetailsSelector } from 'redux/selectors/clerkFreeEnrollmentDetails';

export const ClerkFreeEnrollmentDetails = () => {
  const [comment, setComment] = useState('');

  const onCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

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
    <div className="rows gapped free-enrollment-details">
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
          <Text>Tarkastuksen tila</Text>
          <Text>Maksuttomuuden peruste</Text>
          <Text>Maksuttomia kertoja jäljellä</Text>
          <Text>Asiointikieli</Text>
          <Text>Ilmoittautunut vai jono</Text>
          <Text>Täydennyspyynnön eräpäivä</Text>
          <Text>Lisätiedot</Text>
        </div>
        <div className="rows gapped-xs">
          <div>
            <div className="columns gapped-xxs align-items-center">
              <ClockIcon color="error" style={{ fontSize: '2rem' }} />
              <Text>{t(`status.${enrollmentDetails.status}`)}</Text>
            </div>
          </div>
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
      <div style={{ maxWidth: '700px' }} className="rows gapped-xxl">
        <div className="rows gapped-xs">
          <div className="columns space-between">
            <Text>Liite</Text>
            <Text>Liite saapunut</Text>
          </div>
          <Divider />
          {enrollmentDetails.attachments.map((attachment, index) => (
            <div key={index} className="columns space-between">
              <a
                href={attachment.url}
                className="columns gapped-xxs"
                target="_blank"
                rel="noreferrer"
              >
                <Text>{attachment.filename}</Text>
                <OpenInNewIcon style={{ fontSize: '2rem' }} />
              </a>
              <Text>
                {DateUtils.formatOptionalDate(attachment.submittedAt)}
              </Text>
            </div>
          ))}
        </div>
        <div className="columns gapped flex-end">
          <OphButton
            aria-label="Button"
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            Hyväksy maksuttomuus
          </OphButton>
          <OphButton
            aria-label="Button"
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            Lähetä täydennyspyyntö
          </OphButton>
        </div>
        <Divider />
        <div className="rows gapped">
          <Text>
            <b>Tarkastajan kommentit</b> (ei näy ilmoittautujalle)
          </Text>
          <Text>Lisää uusi kommentti</Text>
          <CustomTextField
            value={comment}
            onChange={onCommentChange}
            type={'textarea'}
            slotProps={{ formHelperText: { component: 'div' } }}
            multiline
            fullWidth
          />
          <div className="columns flex-end">
            <OphButton aria-label="Button" variant="outlined">
              <span>Tallenna kommentti</span>
            </OphButton>
          </div>
        </div>
      </div>
    </div>
  );
};
