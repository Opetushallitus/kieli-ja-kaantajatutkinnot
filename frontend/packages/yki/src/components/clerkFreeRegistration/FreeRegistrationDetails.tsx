import { HourglassBottom } from '@mui/icons-material';
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
            aria-label="Button"
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            Lähetä täydennyspyyntö
          </OphButton>
          <OphButton
            aria-label="Button"
            variant="contained"
            style={{ backgroundColor: '#0033CC', color: 'white' }}
          >
            Hyväksy maksuttomuus
          </OphButton>
        </>
      );
    }

    return (
      <>
        <OphButton
          aria-label="Button"
          variant="contained"
          style={{ backgroundColor: 'white', color: '0033CC' }}
        >
          Lähetä täydennyspyyntö
        </OphButton>
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
          Hylkää maksuttomuus
        </OphButton>
      </>
    );
  };

  const getStatusIcon = (status: FreeRegistrationStatus) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon color="error" style={{ fontSize: '2rem' }} />;
      case 'APPROVED':
        return (
          <ClockIcon
            color="success"
            style={{ fontSize: '2rem', color: 'green' }}
          />
        );
      case 'INFORMATION_REQUESTED':
        return (
          <HourglassBottom
            color="success"
            style={{ fontSize: '2rem', color: 'green' }}
          />
        );
      case 'REJECTED':
        return (
          <ClockIcon
            color="disabled"
            style={{ fontSize: '2rem', color: 'grey' }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="rows gapped free-registration-details">
      <div>
        <Text>
          <b>{registrationDetails.person.fullName}</b>
          {`(${registrationDetails.person.socialSecurityNumber})`}
        </Text>
        <Text>
          {translateLanguage(registrationDetails.examSession.language)}
          {' - '}
          {translateLevel(registrationDetails.examSession.level)}{' '}
          {DateUtils.formatOptionalDate(
            registrationDetails.examSession.examDate,
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
              {getStatusIcon(registrationDetails.status)}
              <Text>{t(`status.${registrationDetails.status}.part1`)}</Text>
            </div>
          </div>
          <Text>
            {t(
              `details.freeRegistrationBasis.${registrationDetails.freeRegistrationBasis}`,
            )}
          </Text>
          <Text>
            {t('details.freeRegistrationsLeft', {
              amount: registrationDetails.freeRegistrationsLeft,
            })}
          </Text>
          <Text>{registrationDetails.languageOfCommunication}</Text>
          <Text>
            {registrationDetails.registration.kind === 'ADMISSION'
              ? t('details.registrationStatus.enrolled')
              : t('details.registrationStatus.queued', {
                  positionInQueue:
                    registrationDetails.registration.positionInQueue,
                  queue: registrationDetails.registration.queue,
                })}
          </Text>
          <Text>
            <Text>
              {registrationDetails.supplementRequestDueDate
                ? DateUtils.formatOptionalDate(
                    registrationDetails.supplementRequestDueDate,
                    'l',
                  )
                : '-'}
            </Text>
          </Text>
          <Text>
            {t('details.examView')}
            <br />
            {t('details.customerView')}
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
          {registrationDetails.attachments.map((attachment, index) => (
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
        <div className="columns gapped flex-end">{renderButtons()}</div>
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
