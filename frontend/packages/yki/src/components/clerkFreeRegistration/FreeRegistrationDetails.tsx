import {
  BlockFlipped,
  CheckCircle,
  HourglassBottom,
} from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, TextField, Typography } from '@mui/material';
import { ClockIcon } from '@mui/x-date-pickers';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { FreeRegistrationStatus } from 'interfaces/clerkFreeRegistration';
import {
  loadClerkFreeRegistrationDetails,
  resetClerkFreeRegistrationDetails,
} from 'redux/reducers/clerkFreeRegistrationDetails';
import { clerkFreeRegistrationDetailsSelector } from 'redux/selectors/clerkFreeRegistrationDetails';

export const ClerkFreeRegistrationDetails = () => {
  const [comment, setComment] = useState('');

  const onCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });

  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { status, registrationDetails } = useAppSelector(
    clerkFreeRegistrationDetailsSelector,
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
      dispatch(loadClerkFreeRegistrationDetails(+params.id));
    } else if (status === APIResponseStatus.Error || isNaN(Number(params.id))) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.notFound'),
      });
      navigate(AppRoutes.ClerkFreeRegistration);
    }
  }, [dispatch, navigate, params.id, showToast, status, t]);

  useEffect(() => {
    return () => {
      setComment('');
      dispatch(resetClerkFreeRegistrationDetails());
    };
  }, [dispatch]);

  if (!registrationDetails) {
    return null;
  }

  const renderButtons = () => {
    if (registrationDetails.status === 'PENDING') {
      return (
        <>
          <OphButton
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            {t('details.buttons.sendInformationRequest')}
          </OphButton>
          <OphButton
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            {t('details.buttons.approveFreeRegistration')}
          </OphButton>
        </>
      );
    } else if (
      registrationDetails.status === 'INFORMATION_REQUESTED' ||
      registrationDetails.status === 'INFORMATION_REQUEST_ANSWERED' ||
      registrationDetails.status === 'INFORMATION_REQUEST_EXPIRED'
    ) {
      return (
        <>
          <OphButton
            variant="outlined"
            style={{ backgroundColor: 'white', color: '#0033CC' }}
          >
            {t('details.buttons.sendInformationRequest')}
          </OphButton>
          <OphButton
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            {t('details.buttons.approveFreeRegistration')}
          </OphButton>
          <OphButton
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            {t('details.buttons.rejectFreeRegistration')}
          </OphButton>
        </>
      );
    } else if (registrationDetails.status === 'REJECTED') {
      return (
        <OphButton
          variant="contained"
          style={{ backgroundColor: '#0033CC', color: 'white' }}
        >
          {t('details.buttons.approveFreeRegistration')}
        </OphButton>
      );
    }

    return (
      <OphButton
        variant="contained"
        style={{ backgroundColor: '#0033CC', color: 'white' }}
      >
        {t('details.buttons.rejectFreeRegistration')}
      </OphButton>
    );
  };

  const getStatusContent = (status: FreeRegistrationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <>
            <ClockIcon color="error" style={{ fontSize: '2rem' }} />
            <span>{t(`status.${registrationDetails.status}.part1`)}</span>
          </>
        );
      case 'APPROVED':
        return (
          <>
            <CheckCircle color="success" style={{ fontSize: '2rem' }} />
            <span>{t(`status.${registrationDetails.status}.part1`)}</span>
          </>
        );
      case 'INFORMATION_REQUESTED':
        return (
          <>
            <HourglassBottom color="success" style={{ fontSize: '2rem' }} />
            <span>
              {t(`status.${registrationDetails.status}.part1`)}{' '}
              {t(`status.${registrationDetails.status}.part2`)}
            </span>
          </>
        );
      case 'INFORMATION_REQUEST_ANSWERED':
        return (
          <>
            <ClockIcon color="error" style={{ fontSize: '2rem' }} />
            <span>
              {t(`status.${registrationDetails.status}.part1`)}{' '}
              {t(`status.${registrationDetails.status}.part2`)}
            </span>
          </>
        );
      case 'INFORMATION_REQUEST_EXPIRED':
        return (
          <>
            <ClockIcon color="error" style={{ fontSize: '2rem' }} />
            <span>
              {t(`status.${registrationDetails.status}.part1`)}{' '}
              {t(`status.${registrationDetails.status}.part2`)}
            </span>
          </>
        );
      case 'REJECTED':
        return (
          <>
            <BlockFlipped color="error" style={{ fontSize: '2rem' }} />
            <span>{t(`status.${registrationDetails.status}.part1`)}</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rows gapped free-registration-details">
      <div>
        <b>{registrationDetails.person.fullName}</b>{' '}
        <span>{`(${registrationDetails.person.socialSecurityNumber})`}</span>
        <div>
          {translateLanguage(registrationDetails.examSession.language)}
          {' - '}
          {translateLevel(registrationDetails.examSession.level)}{' '}
          {DateUtils.formatOptionalDate(
            registrationDetails.examSession.examDate,
            'l',
          )}
        </div>
      </div>
      <div className="columns gapped-xs align-items-start">
        <div className="rows gapped-xs">
          <Typography fontWeight={500}>{t('details.fields.status')}</Typography>
          <Typography fontWeight={500}>
            {t('details.fields.freeRegistrationBasis')}
          </Typography>
          <Typography fontWeight={500}>
            {t('details.fields.freeRegistrationsLeft')}
          </Typography>
          <Typography fontWeight={500}>
            {t('details.fields.languageOfCommunication')}
          </Typography>
          <Typography fontWeight={500}>
            {t('details.fields.registrationType')}
          </Typography>
          <Typography fontWeight={500}>
            {t('details.fields.supplementRequestDueDate')}
          </Typography>
          <Typography fontWeight={500}>
            {t('details.fields.extraInformation')}
          </Typography>
        </div>
        <div className="rows gapped-xs">
          <div>
            <div className="columns gapped-xxs">
              {getStatusContent(registrationDetails.status)}
            </div>
          </div>
          <div>
            {t(
              `details.freeRegistrationBasis.${registrationDetails.freeRegistrationBasis}`,
            )}
          </div>
          <div>
            {t('details.freeRegistrationsLeft', {
              amount: registrationDetails.freeRegistrationsLeft,
            })}
          </div>
          <div>{registrationDetails.languageOfCommunication}</div>
          <div>
            {registrationDetails.registration.kind === 'ADMISSION'
              ? t('details.registrationStatus.enrolled')
              : t('details.registrationStatus.queued', {
                  positionInQueue:
                    registrationDetails.registration.positionInQueue,
                  queue: registrationDetails.registration.queue,
                })}
          </div>
          <div>
            <div>
              {registrationDetails.supplementRequestDueDate
                ? DateUtils.formatOptionalDate(
                    registrationDetails.supplementRequestDueDate,
                    'l',
                  )
                : '-'}
            </div>
          </div>
          <div>
            {t('details.examView')}
            <br />
            {t('details.customerView')}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '700px' }} className="rows gapped-xxl">
        <div className="rows gapped-xs">
          <div className="columns space-between">
            <span>{t('details.attachments.attachment')}</span>
            <span>{t('details.attachments.arrivedAt')}</span>
          </div>
          <Divider />
          {registrationDetails.attachments.map((attachment, index) => (
            <div key={index} className="columns space-between">
              <a
                href={attachment.url}
                className="columns gapped-xxs"
                target="_blank"
                rel="noreferrer"
              >
                {attachment.filename}
                <OpenInNewIcon style={{ fontSize: '2rem' }} />
              </a>
              {DateUtils.formatOptionalDate(attachment.submittedAt)}
            </div>
          ))}
        </div>
        <div className="columns gapped flex-end">{renderButtons()}</div>
        <Divider />
        <div className="rows gapped">
          <div>
            <b>{t('details.comments.clerkComments.part1')}</b>{' '}
            {`(${t('details.comments.clerkComments.part2')})`}
          </div>
          {t('details.comments.addNewComment')}
          <TextField
            minRows={5}
            maxRows={15}
            value={comment}
            onChange={onCommentChange}
            type={'textarea'}
            slotProps={{ formHelperText: { component: 'div' } }}
            multiline
            fullWidth
          />
          <div className="columns flex-end">
            <OphButton variant="outlined">
              {t('details.comments.save')}
            </OphButton>
          </div>
        </div>
      </div>
    </div>
  );
};
