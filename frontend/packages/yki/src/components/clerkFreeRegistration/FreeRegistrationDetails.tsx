import {
  BlockFlipped,
  CheckCircle,
  HourglassBottom,
} from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, TextField, Typography } from '@mui/material';
import { ClockIcon } from '@mui/x-date-pickers';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity, Variant } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { FreeRegistrationModal } from 'components/clerkFreeRegistration/FreeRegistrationModal';
import { FreeRegistrationRequestInformationModal } from 'components/clerkFreeRegistration/FreeRegistrationRequestInformationModal';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { FreeRegistrationStatus } from 'interfaces/clerkFreeRegistration';
import { Label, Text } from 'ophTheme/Text';
import {
  FreeRegistrationModalStatus,
  resetInformationRequestStatus,
  setFreeRegistrationStatus,
} from 'redux/reducers/clerkFreeRegistration';
import {
  addComment,
  loadClerkFreeRegistrationDetails,
  resetClerkFreeRegistrationDetails,
} from 'redux/reducers/clerkFreeRegistrationDetails';
import { clerkFreeRegistrationSelector } from 'redux/selectors/clerkFreeRegistration';
import { clerkFreeRegistrationDetailsSelector } from 'redux/selectors/clerkFreeRegistrationDetails';

export const ClerkFreeRegistrationDetails = () => {
  const [comment, setComment] = useState('');
  const [isRequestInformationModalOpen, setIsRequestInformationModalOpen] =
    useState(false);
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
  const { status, registrationDetails, commentStatus } = useAppSelector(
    clerkFreeRegistrationDetailsSelector,
  );

  const { modalSubmitStatus } = useAppSelector(clerkFreeRegistrationSelector);

  const translateCommon = useCommonTranslation();

  const translateLanguage = (language: string) =>
    translateCommon('languages.' + language);

  const translateLevel = (level: string) =>
    translateCommon('languageLevel.' + level);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

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
    if (modalSubmitStatus === FreeRegistrationModalStatus.ApprovalSuccess) {
      showToast({
        severity: Severity.Success,
        description: t('details.toasts.approvalConfirmed'),
      });
    } else if (
      modalSubmitStatus === FreeRegistrationModalStatus.ApprovalError
    ) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.approvalFailed'),
      });
    } else if (
      modalSubmitStatus === FreeRegistrationModalStatus.RejectSuccess
    ) {
      showToast({
        severity: Severity.Success,
        description: t('details.toasts.rejectConfirmed'),
      });
    } else if (modalSubmitStatus === FreeRegistrationModalStatus.RejectError) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.rejectFailed'),
      });
    } else if (
      modalSubmitStatus ===
      FreeRegistrationModalStatus.InformationRequestSuccess
    ) {
      showToast({
        severity: Severity.Success,
        description: t('details.toasts.informationRequestSuccess'),
      });
    } else if (
      modalSubmitStatus === FreeRegistrationModalStatus.InformationRequestError
    ) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.informationRequestFailed'),
      });
    }
  }, [modalSubmitStatus, showToast, t]);

  useEffect(() => {
    if (commentStatus === APIResponseStatus.Success) {
      setComment('');
      showToast({
        severity: Severity.Success,
        description: t('details.toasts.addCommentConfirmed'),
      });
    } else if (commentStatus === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.addCommentFailed'),
      });
    }
  }, [dispatch, commentStatus, showToast, t]);

  useEffect(() => {
    return () => {
      setComment('');
      dispatch(resetClerkFreeRegistrationDetails());
      dispatch(
        setFreeRegistrationStatus(FreeRegistrationModalStatus.NotStarted),
      );
      dispatch(resetInformationRequestStatus());
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
            variant={Variant.Outlined}
            onClick={() => setIsRequestInformationModalOpen(true)}
          >
            {t('details.buttons.sendSupplementRequest')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={() => setIsApproveModalOpen(true)}
            disabled={
              modalSubmitStatus === FreeRegistrationModalStatus.RejectSuccess
            }
          >
            {t('details.buttons.approveFreeRegistration')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={() => setIsRejectModalOpen(true)}
            disabled={
              modalSubmitStatus === FreeRegistrationModalStatus.ApprovalSuccess
            }
          >
            {t('details.buttons.rejectFreeRegistration')}
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
            variant={Variant.Outlined}
            onClick={() => setIsRequestInformationModalOpen(true)}
          >
            {t('details.buttons.sendSupplementRequest')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            style={{ backgroundColor: ophColors.blue2, color: ophColors.white }}
            onClick={() => setIsApproveModalOpen(true)}
            disabled={
              modalSubmitStatus === FreeRegistrationModalStatus.RejectSuccess
            }
          >
            {t('details.buttons.approveFreeRegistration')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            style={{ backgroundColor: ophColors.blue2, color: ophColors.white }}
            onClick={() => setIsRejectModalOpen(true)}
            disabled={
              modalSubmitStatus === FreeRegistrationModalStatus.ApprovalSuccess
            }
          >
            {t('details.buttons.rejectFreeRegistration')}
          </OphButton>
        </>
      );
    } else if (registrationDetails.status === 'REJECTED') {
      return (
        <OphButton
          variant={Variant.Contained}
          style={{ backgroundColor: ophColors.blue2, color: ophColors.white }}
          onClick={() => setIsApproveModalOpen(true)}
          disabled={
            modalSubmitStatus === FreeRegistrationModalStatus.RejectSuccess
          }
        >
          {t('details.buttons.approveFreeRegistration')}
        </OphButton>
      );
    }

    return (
      <OphButton
        variant={Variant.Contained}
        style={{ backgroundColor: ophColors.blue2, color: ophColors.white }}
        onClick={() => setIsRejectModalOpen(true)}
        disabled={
          modalSubmitStatus === FreeRegistrationModalStatus.ApprovalSuccess
        }
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
            <ClockIcon color="warning" fontSize="large" />
            <Text>{t(`status.${registrationDetails.status}.part1`)}</Text>
          </>
        );
      case 'APPROVED':
        return (
          <>
            <CheckCircle color="success" fontSize="large" />
            <Text>{t(`status.${registrationDetails.status}.part1`)}</Text>
          </>
        );
      case 'INFORMATION_REQUESTED':
        return (
          <>
            <HourglassBottom color="success" fontSize="large" />
            <Text>
              {t(`status.${registrationDetails.status}.part1`)}{' '}
              {t(`status.${registrationDetails.status}.part2`)}
            </Text>
          </>
        );
      case 'INFORMATION_REQUEST_ANSWERED':
        return (
          <>
            <ClockIcon color="error" fontSize="large" />
            <Text>
              {t(`status.${registrationDetails.status}.part1`)}{' '}
              {t(`status.${registrationDetails.status}.part2`)}
            </Text>
          </>
        );
      case 'INFORMATION_REQUEST_EXPIRED':
        return (
          <>
            <ClockIcon color="error" fontSize="large" />
            <Text>
              {t(`status.${registrationDetails.status}.part1`)}{' '}
              {t(`status.${registrationDetails.status}.part2`)}
            </Text>
          </>
        );
      case 'REJECTED':
        return (
          <>
            <BlockFlipped color="error" fontSize="large" />
            <Text>{t(`status.${registrationDetails.status}.part1`)}</Text>
          </>
        );
      default:
        return null;
    }
  };

  const renderExamSessionDetails = () => (
    <Text>
      {`${translateLanguage(
        registrationDetails.examSession.language,
      )} - ${translateLevel(
        registrationDetails.examSession.level,
      )} ${DateUtils.formatOptionalDate(
        registrationDetails.examSession.examDate,
        'l',
      )}`}
    </Text>
  );

  const renderPersonDetails = () => (
    <Text>
      <strong>{`${registrationDetails.person.firstName} ${registrationDetails.person.lastName}`}</strong>{' '}
      {`(${registrationDetails.person.socialSecurityNumber})`}
    </Text>
  );

  return (
    <div className="rows gapped free-registration-details">
      <FreeRegistrationModal
        isApproveModalOpen={isApproveModalOpen}
        setIsApproveModal={setIsApproveModalOpen}
        isRejectModalOpen={isRejectModalOpen}
        setIsRejectModal={setIsRejectModalOpen}
      />
      <div>
        {renderPersonDetails()}
        {renderExamSessionDetails()}
      </div>
      <div className="columns gapped-xxl align-items-start">
        <div className="rows gapped-xs">
          <Label>{t('details.fields.status')}</Label>
          <Label>{t('details.fields.freeRegistrationBasis')}</Label>
          <Label>{t('details.fields.freeRegistrationsLeft')}</Label>
          <Label>{t('details.fields.languageOfCommunication')}</Label>
          <Label>{t('details.fields.registrationType')}</Label>
          <Label>{t('details.fields.supplementRequestDueDate')}</Label>
          <Label>{t('details.fields.extraInformation')}</Label>
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
          <div>
            {t(
              `details.languageOfCommunication.${registrationDetails.languageOfCommunication}`,
            )}
          </div>
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
      <div style={{ maxWidth: '900px' }} className="rows gapped-xl">
        <div className="rows gapped-xs">
          <div className="columns space-between">
            <Text>{t('details.attachments.attachment')}</Text>
            <Text>{t('details.attachments.arrivedAt')}</Text>
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
          <Label>{t('details.messages.title')}</Label>
          {registrationDetails.messages.map((message) => (
            <div key={message.id} className="rows">
              <div className="columns space-between">
                <Typography
                  variant="body1"
                  fontSize={'13px'}
                  lineHeight={'19px'}
                >
                  {t(`details.messages.message.type.${message.type}`)}{' '}
                  {DateUtils.formatOptionalDate(message.createdAt, 'l LTS')}
                  {', '}
                  {message.createdBy}
                </Typography>
              </div>

              <Text>{message.text}</Text>
            </div>
          ))}
        </div>
        <div className="rows gapped">
          <div>
            <Label>{t('details.messages.newCommentPart1')}</Label>{' '}
            {`(${t('details.messages.newCommentPart2')})`}
            <TextField
              id="comment"
              minRows={5}
              maxRows={15}
              value={comment}
              onChange={onCommentChange}
              type={'textarea'}
              slotProps={{ formHelperText: { component: 'div' } }}
              disabled={commentStatus === APIResponseStatus.InProgress}
              multiline
              fullWidth
            />
          </div>
          <div className="columns flex-end">
            <OphButton
              variant={Variant.Outlined}
              disabled={commentStatus === APIResponseStatus.InProgress}
              onClick={() =>
                comment.length &&
                dispatch(
                  addComment({
                    text: comment,
                    createdBy: 'Virkailija Ville',
                    type: 'COMMENT',
                  }),
                )
              }
            >
              {t('details.messages.save')}
            </OphButton>
          </div>
        </div>
      </div>
      <FreeRegistrationRequestInformationModal
        isModalOpen={isRequestInformationModalOpen}
        setIsModalOpen={setIsRequestInformationModalOpen}
        registrationId={registrationDetails.id}
        renderPersonDetails={renderPersonDetails}
        renderExamSessionDetails={renderExamSessionDetails}
      />
    </div>
  );
};
