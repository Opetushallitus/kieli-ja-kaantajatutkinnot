import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrorDropdown from '@mui/icons-material/ArrowDropDown';
import { Dayjs } from 'dayjs';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { AutocompleteValue, CustomButton, H2 } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { DateUtils, StringUtils } from 'shared/utils';

import { ControlButtons } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsControlButtons';
import { ClerkExamEventDetailsFields } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsFields';
import { ClerkExamEventEnrollmentListing } from 'components/clerkExamEvent/overview/ClerkExamEventEnrollmentListing';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentStatus, UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  ClerkExamEvent,
  ClerkExamEventBasicInformation,
  Enrollment,
} from 'interfaces/clerkExamEvent';
import {
  resetClerkExamEventDetailsUpdate,
  updateClerkExamEventDetails,
} from 'redux/reducers/clerkExamEventOverview';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';

export const ClerkExamEventDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { examEvent, examEventDetailsStatus } = useAppSelector(
    clerkExamEventOverviewSelector
  );

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // Local state
  const [examEventDetails, setExamEventDetails] = useState(examEvent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode !== UIMode.Edit;

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
    resetLocalExamEventDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalExamEventDetails]);

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
    } else if (
      examEventDetailsStatus === APIResponseStatus.Cancelled &&
      currentUIMode === UIMode.Edit
    ) {
      // Flow was reset through the cancel dialog -> reset UI state.
      resetToInitialState();
    }
  }, [
    currentUIMode,
    dispatch,
    showToast,
    resetToInitialState,
    t,
    examEventDetailsStatus,
  ]);

  const hasRequiredDetails = examEventDetails
    ? StringUtils.isNonBlankString(examEventDetails.language) &&
      StringUtils.isNonBlankString(examEventDetails.level) &&
      DateUtils.isValidDate(examEventDetails.date) &&
      DateUtils.isValidDate(examEventDetails.registrationCloses) &&
      DateUtils.isDatePartBefore(
        examEventDetails.registrationCloses,
        examEventDetails.date
      )
    : false;

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
      title: t('examEventDetails.cancelUpdateDialog.title'),
      severity: Severity.Info,
      description: t('examEventDetails.cancelUpdateDialog.description'),
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

  useNavigationProtection(hasLocalChanges);

  const getExamListingHeader = (
    enrollments: Array<Enrollment>,
    enrollmentStatus: EnrollmentStatus
  ) => {
    switch (enrollmentStatus) {
      case EnrollmentStatus.PAID:
        return `${t('examEventListingHeader.paid')}: ${enrollments.length}`;
      case EnrollmentStatus.EXPECTING_PAYMENT:
        return `${t('examEventListingHeader.expectingPayment')}: ${
          enrollments.length
        }`;
      case EnrollmentStatus.QUEUED:
        return `${t('examEventListingHeader.queued')}: ${enrollments.length}`;
      case EnrollmentStatus.CANCELED:
        return `${t('examEventListingHeader.canceled')}: ${enrollments.length}`;
    }
  };

  const registeredEnrollments =
    examEventDetails?.enrollments.filter(
      (enrollment) => enrollment.status === EnrollmentStatus.PAID
    ) ?? [];
  const unpaidEnrollments =
    examEventDetails?.enrollments.filter(
      (enrollment) => enrollment.status === EnrollmentStatus.EXPECTING_PAYMENT
    ) ?? [];
  const queuedEnrollments =
    examEventDetails?.enrollments.filter(
      (enrollment) => enrollment.status === EnrollmentStatus.QUEUED
    ) ?? [];
  const canceledEnrollments =
    examEventDetails?.enrollments.filter(
      (enrollment) => enrollment.status === EnrollmentStatus.CANCELED
    ) ?? [];

  return (
    <>
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
        topControlButtons={
          <ControlButtons
            onCancel={onCancel}
            onEdit={onEdit}
            onSave={onSave}
            isViewMode={isViewMode}
            hasRequiredDetails={hasRequiredDetails}
          />
        }
      />
      {registeredEnrollments.length > 0 && (
        <div className="rows margin-top-xxl">
          <H2>
            {getExamListingHeader(registeredEnrollments, EnrollmentStatus.PAID)}
          </H2>
          <div className="margin-top-sm">
            <ClerkExamEventEnrollmentListing
              enrollments={registeredEnrollments}
            />
          </div>
        </div>
      )}

      {unpaidEnrollments.length > 0 && (
        <div className="rows margin-top-xxl">
          <H2>
            {getExamListingHeader(
              unpaidEnrollments,
              EnrollmentStatus.EXPECTING_PAYMENT
            )}
          </H2>
          <div className="margin-top-sm">
            <ClerkExamEventEnrollmentListing enrollments={unpaidEnrollments} />
          </div>
        </div>
      )}

      {queuedEnrollments.length > 0 && (
        <div className="rows margin-top-xxl">
          <H2>
            {getExamListingHeader(queuedEnrollments, EnrollmentStatus.QUEUED)}
          </H2>
          <div className="margin-top-sm">
            <ClerkExamEventEnrollmentListing enrollments={queuedEnrollments} />
          </div>
        </div>
      )}

      {canceledEnrollments.length > 0 && (
        <div className="rows margin-top-xxl">
          <H2>
            {getExamListingHeader(
              canceledEnrollments,
              EnrollmentStatus.CANCELED
            )}
          </H2>
          <div className="margin-top-sm">
            <ClerkExamEventEnrollmentListing
              enrollments={canceledEnrollments}
            />
          </div>
        </div>
      )}
      {examEventDetails?.enrollments &&
        examEventDetails.enrollments.length > 0 && (
          <div className="columns gapped margin-top-xxl flex-end">
            <CustomButton
              color={Color.Secondary}
              variant={Variant.Contained}
              endIcon={<ArrorDropdown />}
              data-testid="clerk-exam-event-overview-page__back-btn"
            >
              Kopio sähköpostit
            </CustomButton>
            <CustomButton
              color={Color.Secondary}
              variant={Variant.Contained}
              endIcon={<ArrowDownward />}
              data-testid="clerk-exam-event-overview-page__back-btn"
            >
              Lataa Excel
            </CustomButton>
          </div>
        )}
    </>
  );
};
