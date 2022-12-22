import { ChevronRight } from '@mui/icons-material';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useClerkTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentStatus } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkExamEvent';
import { updateClerkEnrollmentStatus } from 'redux/reducers/clerkExamEventOverview';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';

export const UpdateEnrollmentStatusButton = ({
  enrollment,
}: {
  enrollment: ClerkEnrollment;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix:
      'vkt.component.clerkEnrollmentListing.row.updateEnrollmentStatus',
  });
  const { clerkEnrollmentUpdateStatus, examEvent } = useAppSelector(
    clerkExamEventOverviewSelector
  );
  const dispatch = useAppDispatch();

  if (
    !examEvent ||
    [EnrollmentStatus.PAID, EnrollmentStatus.CANCELED].includes(
      enrollment.status
    )
  ) {
    return null;
  }

  const isLoading =
    clerkEnrollmentUpdateStatus === APIResponseStatus.InProgress;

  const newStatus =
    enrollment.status === EnrollmentStatus.QUEUED
      ? EnrollmentStatus.EXPECTING_PAYMENT
      : EnrollmentStatus.QUEUED;

  const changeStatus = (
    e: React.MouseEvent<HTMLButtonElement>,
    newStatus: EnrollmentStatus
  ) => {
    e.stopPropagation();

    const statusUpdate = {
      id: enrollment.id,
      version: enrollment.version,
      newStatus,
    };

    dispatch(updateClerkEnrollmentStatus({ statusUpdate, examEvent }));
  };

  const getStatusText = (status: EnrollmentStatus) => {
    if (status === EnrollmentStatus.EXPECTING_PAYMENT) {
      return t('backToQueue');
    }

    return t('toExamEvent');
  };

  return (
    <LoadingProgressIndicator isLoading={isLoading}>
      <CustomButton
        data-testid={`clerk-exam-event-overview__enrollment-list-${enrollment.status}__update-status-button`}
        variant={Variant.Text}
        color={Color.Secondary}
        endIcon={<ChevronRight />}
        disabled={isLoading}
        onClick={(e) => changeStatus(e, newStatus)}
      >
        {getStatusText(enrollment.status)}
      </CustomButton>
    </LoadingProgressIndicator>
  );
};
