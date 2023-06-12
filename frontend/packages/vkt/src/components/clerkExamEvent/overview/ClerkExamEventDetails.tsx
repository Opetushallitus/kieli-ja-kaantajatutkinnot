import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import {
  AutocompleteValue,
  DropDownMenuButton,
  ExtLink,
  H2,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { ClerkEnrollmentListing } from 'components/clerkEnrollment/listing/ClerkEnrollmentListing';
import { ClerkExamEventDetailsFields } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsFields';
import { ControlButtons } from 'components/clerkExamEvent/overview/ControlButtons';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes, EnrollmentStatus, UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import {
  ClerkExamEvent,
  ClerkExamEventBasicInformation,
} from 'interfaces/clerkExamEvent';
import {
  resetClerkEnrollmentStatusChange,
  resetClerkExamEventDetailsUpdate,
  updateClerkExamEventDetails,
} from 'redux/reducers/clerkExamEventOverview';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';

interface EnrollmentListProps {
  enrollments: Array<ClerkEnrollment>;
  status: EnrollmentStatus;
  examEventId: number;
}

const enrollmentFilter = (
  enrollments: Array<ClerkEnrollment>,
  status: EnrollmentStatus
): Array<ClerkEnrollment> =>
  enrollments.filter((e: ClerkEnrollment) => e.status === status);

const EnrollmentList: FC<EnrollmentListProps> = ({
  enrollments,
  status,
  examEventId,
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview.examEventListingHeader',
  });

  const filteredEnrollments = enrollmentFilter(enrollments, status);

  return (
    <>
      {filteredEnrollments.length > 0 && (
        <div className="rows margin-top-xxl">
          <H2
            data-testid={`clerk-exam-event-overview-page__enrollment-list-${status}__header`}
          >{`${t(status)}: ${filteredEnrollments.length}`}</H2>
          <div className="margin-top-sm">
            <ClerkEnrollmentListing
              enrollments={filteredEnrollments}
              examEventId={examEventId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const ClerkExamEventDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { examEvent, examEventDetailsStatus, clerkEnrollmentChangeStatus } =
    useAppSelector(clerkExamEventOverviewSelector);

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  async function copyEmails(
    enrollments: Array<ClerkEnrollment>,
    status?: EnrollmentStatus
  ) {
    const filteredEnrollments = status
      ? enrollmentFilter(enrollments, status)
      : enrollments;
    const emails = filteredEnrollments.map((enrollment) => enrollment.email);

    try {
      await navigator.clipboard.writeText(emails.join('\n'));

      showToast({
        severity: Severity.Success,
        description: t('toasts.copiedToClipboard', { count: emails.length }),
      });
    } catch (err) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.copyToClipboardFailed'),
      });
    }
  }

  // Local state
  const [examEventDetails, setExamEventDetails] = useState(examEvent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode === UIMode.View;

  const resetLocalExamEventDetails = useCallback(() => {
    setExamEventDetails(examEvent);
  }, [examEvent]);

  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview',
  });
  const translateCommon = useCommonTranslation();

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkExamEventDetailsUpdate());
    dispatch(resetClerkEnrollmentStatusChange());
    resetLocalExamEventDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalExamEventDetails]);

  useNavigationProtection(hasLocalChanges);

  useEffect(() => {
    if (
      examEventDetailsStatus === APIResponseStatus.Success &&
      currentUIMode === UIMode.Edit
    ) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.updated'),
      });
      resetToInitialState();
    }
  }, [
    currentUIMode,
    showToast,
    resetToInitialState,
    t,
    examEventDetailsStatus,
  ]);

  useEffect(() => {
    if (clerkEnrollmentChangeStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.enrollmentStatusUpdated'),
      });
      resetToInitialState();
    }
  }, [showToast, resetToInitialState, t, clerkEnrollmentChangeStatus]);

  if (!examEventDetails) {
    return null;
  }

  const { enrollments } = examEventDetails;

  const copyOptions = [
    {
      icon: <ContentCopyIcon />,
      label: t('copyClipboard.copyAll'),
      onClick: copyEmails.bind(this, enrollments),
      disabled: enrollments.length <= 0,
    },
    {
      icon: <ContentCopyIcon />,
      label: t('copyClipboard.copyPaid'),
      onClick: copyEmails.bind(this, enrollments, EnrollmentStatus.PAID),
      disabled:
        enrollmentFilter(enrollments, EnrollmentStatus.PAID).length <= 0,
    },
    {
      icon: <ContentCopyIcon />,
      label: t('copyClipboard.copyQueued'),
      onClick: copyEmails.bind(this, enrollments, EnrollmentStatus.QUEUED),
      disabled:
        enrollmentFilter(enrollments, EnrollmentStatus.QUEUED).length <= 0,
    },
  ];

  const handleComboBoxChange =
    (field: keyof ClerkExamEventBasicInformation) =>
    ({}, autocompleteValue?: AutocompleteValue) => {
      handleFieldChange(field, autocompleteValue?.value);
    };

  const handleCheckBoxChange =
    (field: keyof ClerkExamEventBasicInformation) =>
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleFieldChange(field, checked);
    };

  const handleDateChange =
    (
      field: keyof Pick<
        ClerkExamEventBasicInformation,
        'date' | 'registrationCloses'
      >
    ) =>
    (date: Dayjs | null) => {
      handleFieldChange(field, date);
    };

  const handleMaxParticipantsChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleFieldChange('maxParticipants', event.target.value);
  };

  const handleFieldChange = (
    field: keyof ClerkExamEventBasicInformation,
    fieldValue: string | number | boolean | undefined | Dayjs | null
  ) => {
    const updatedExamEventDetails = {
      ...examEventDetails,
      [field]: fieldValue,
    };
    setHasLocalChanges(true);
    setExamEventDetails(updatedExamEventDetails as ClerkExamEvent);
  };

  const onSave = () => {
    dispatch(updateClerkExamEventDetails(examEventDetails as ClerkExamEvent));
  };

  const onEdit = () => {
    resetLocalExamEventDetails();
    setCurrentUIMode(UIMode.Edit);
  };

  const openCancelDialog = () => {
    showDialog({
      title: translateCommon('cancelUpdateDialog.header'),
      severity: Severity.Info,
      description: translateCommon('cancelUpdateDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => resetToInitialState(),
        },
      ],
    });
  };

  const onCancel = () => {
    if (!hasLocalChanges) {
      resetToInitialState();
    } else {
      openCancelDialog();
    }
  };

  const enrollmentLinkUrl = `https://${
    window.location.host
  }${AppRoutes.PublicAuth.replace(/:examEventId/, `${examEvent?.id}`)}`;

  return (
    <>
      <div className="columns margin-top-lg flex-end">
        <ControlButtons
          onCancel={onCancel}
          onEdit={onEdit}
          onSave={onSave}
          isViewMode={isViewMode}
          isValidExamEvent={ExamCreateEventUtils.isValidExamEvent(
            examEventDetails
          )}
        />
      </div>
      <div className="clerk-homepage__exam-events clerk-homepage-create-exam-events">
        <ClerkExamEventDetailsFields
          examEvent={examEventDetails}
          onComboBoxChange={(field: keyof ClerkExamEventBasicInformation) =>
            handleComboBoxChange(field)
          }
          onDateChange={(
            field: keyof Pick<
              ClerkExamEventBasicInformation,
              'date' | 'registrationCloses'
            >
          ) => handleDateChange(field)}
          onCheckBoxChange={(field: keyof ClerkExamEventBasicInformation) =>
            handleCheckBoxChange(field)
          }
          onMaxParticipantsChange={handleMaxParticipantsChange}
          editDisabled={isViewMode}
        />
      </div>
      <div className="margin-top-lg">
        <Text>
          <b>{t('examEventDetails.enrollmentLink')}:</b> {enrollmentLinkUrl}
        </Text>
      </div>
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.PAID}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.SHIFTED_FROM_QUEUE}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.QUEUED}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.CANCELED}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT}
        examEventId={examEventDetails.id}
      />
      {enrollments.length > 0 && (
        <div className="columns gapped margin-top-xxl flex-end">
          <DropDownMenuButton
            color={Color.Secondary}
            variant={Variant.Contained}
            data-testid="clerk-exam-event-overview-page__copy-emails-button"
            aria-label={t('examEventDetails.copyEmails')}
            ariaLabelOpen={t('examEventDetails.chooseCopyEmails')}
            options={copyOptions}
          >
            {t('examEventDetails.copyEmails')}
          </DropDownMenuButton>
          <ExtLink
            href={`${APIEndpoints.ClerkExamEvent}/${examEventDetails.id}/excel`}
            text={t('examEventDetails.downloadExcel')}
            startIcon={<DownloadIcon />}
            data-testid="clerk-exam-event-overview-page__download-excel-button"
          />
        </div>
      )}
    </>
  );
};
