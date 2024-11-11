import { Dayjs } from 'dayjs';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import { H2 } from 'shared/components';
import { Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { ClerkExamEventDetailsFields } from 'components/clerkExamEvent/overview/ClerkExamEventDetailsFields';
import { ControlButtons } from 'components/clerkExamEvent/overview/ControlButtons';
import { ExaminerEnrollmentListing } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListing';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentAppointmentStatus, UIMode } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';
import {
  ClerkExamEvent,
  ClerkExamEventBasicInformation,
} from 'interfaces/clerkExamEvent';
import {
  resetClerkExamEventDetailsUpdate,
  updateClerkExamEventDetails,
} from 'redux/reducers/clerkExamEventOverview';
import { examinerExamEventOverviewSelector } from 'redux/selectors/examinerExamEventOverview';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';

interface EnrollmentListProps {
  enrollments: Array<ClerkEnrollmentAppointment>;
  status: EnrollmentAppointmentStatus;
  examEventId: number;
}

const enrollmentFilter = (
  enrollments: Array<ClerkEnrollmentAppointment>,
  status: EnrollmentAppointmentStatus,
): Array<ClerkEnrollmentAppointment> =>
  enrollments.filter((e: ClerkEnrollmentAppointment) => e.status === status);

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
            <ExaminerEnrollmentListing
              enrollments={filteredEnrollments}
              examEventId={examEventId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const ExaminerExamEventDetails = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { examEvent } = useAppSelector(examinerExamEventOverviewSelector);

  const { showDialog } = useDialog();

  // Local state
  const [examEventDetails, setExamEventDetails] = useState(examEvent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [currentUIMode, setCurrentUIMode] = useState(UIMode.View);
  const isViewMode = currentUIMode === UIMode.View;

  const resetLocalExamEventDetails = useCallback(() => {
    setExamEventDetails(examEvent);
  }, [examEvent]);
  const translateCommon = useCommonTranslation();

  const resetToInitialState = useCallback(() => {
    dispatch(resetClerkExamEventDetailsUpdate());
    resetLocalExamEventDetails();
    setHasLocalChanges(false);
    setCurrentUIMode(UIMode.View);
  }, [dispatch, resetLocalExamEventDetails]);

  useNavigationProtection(hasLocalChanges);

  if (!examEventDetails) {
    return null;
  }

  const { enrollments } = examEventDetails;

  const handleComboBoxChange =
    (field: keyof ClerkExamEventBasicInformation) => (value?: string) => {
      handleFieldChange(field, value);
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
        'date' | 'registrationCloses' | 'registrationOpens'
      >,
    ) =>
    (date: Dayjs | null) => {
      handleFieldChange(field, date);
    };

  const handleMaxParticipantsChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleFieldChange('maxParticipants', event.target.value);
  };

  const handleFieldChange = (
    field: keyof ClerkExamEventBasicInformation,
    fieldValue: string | number | boolean | undefined | Dayjs | null,
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
          isValidExamEvent={
            examEventDetails &&
            ExamCreateEventUtils.isValidExamEvent(examEventDetails)
          }
        />
      </div>
      <div className="clerk-homepage__exam-events clerk-homepage-create-exam-events">
        <ClerkExamEventDetailsFields
          examEvent={examEventDetails}
          onComboBoxChange={handleComboBoxChange}
          onDateChange={handleDateChange}
          onCheckBoxChange={handleCheckBoxChange}
          onMaxParticipantsChange={handleMaxParticipantsChange}
          editDisabled={isViewMode}
        />
      </div>
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.COMPLETED}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.AWAITING_PAYMENT}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={
          EnrollmentAppointmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
        }
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.WAITING_AUTHENTICATION}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.CANCELED}
        examEventId={examEventDetails.id}
      />
      <EnrollmentList
        enrollments={enrollments}
        status={EnrollmentAppointmentStatus.CANCELED_UNFINISHED_ENROLLMENT}
        examEventId={examEventDetails.id}
      />
    </>
  );
};
