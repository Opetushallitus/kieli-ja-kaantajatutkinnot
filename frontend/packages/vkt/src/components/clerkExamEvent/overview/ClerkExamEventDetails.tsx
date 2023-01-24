import ArrowDropdown from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import {
  AutocompleteValue,
  CustomButton,
  ExtLink,
  H2,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { DateUtils, StringUtils } from 'shared/utils';

import { ClerkEnrollmentListing } from 'components/clerkEnrollment/listing/ClerkEnrollmentListing';
import { ClerkExamEventDetailsFields } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsFields';
import { ControlButtons } from 'components/clerkExamEvent/overview/ControlButtons';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { EnrollmentStatus, UIMode } from 'enums/app';
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

interface EnrollmentListProps {
  enrollments: Array<ClerkEnrollment>;
  status: EnrollmentStatus;
  examEventId: number;
}

const EnrollmentList: FC<EnrollmentListProps> = ({
  enrollments,
  status,
  examEventId,
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventOverview.examEventListingHeader',
  });

  const filteredEnrollments = enrollments.filter((e) => e.status === status);

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

  const hasRequiredDetails =
    StringUtils.isNonBlankString(examEventDetails.language) &&
    StringUtils.isNonBlankString(examEventDetails.level) &&
    DateUtils.isValidDate(examEventDetails.date) &&
    DateUtils.isValidDate(examEventDetails.registrationCloses) &&
    DateUtils.isDatePartBefore(
      examEventDetails.registrationCloses,
      examEventDetails.date
    );
  const { enrollments } = examEventDetails;

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

  const handleFieldChange = (
    field: keyof ClerkExamEventBasicInformation,
    fieldValue: string | boolean | undefined | Dayjs | null
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

  return (
    <>
      <div className="columns margin-top-lg flex-end">
        <ControlButtons
          onCancel={onCancel}
          onEdit={onEdit}
          onSave={onSave}
          isViewMode={isViewMode}
          hasRequiredDetails={hasRequiredDetails}
        />
      </div>
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
        editDisabled={isViewMode}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.PAID}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentStatus.EXPECTING_PAYMENT}
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
      {enrollments.length > 0 && (
        <div className="columns gapped margin-top-xxl flex-end">
          <CustomButton
            color={Color.Secondary}
            variant={Variant.Contained}
            endIcon={<ArrowDropdown />}
            data-testid="clerk-exam-event-overview-page__copy-emails-button"
          >
            {t('examEventDetails.copyEmails')}
          </CustomButton>
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
