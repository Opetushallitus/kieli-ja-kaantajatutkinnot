import { ChevronRight } from '@mui/icons-material';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useClerkTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentStatus } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { changeClerkEnrollmentStatus } from 'redux/reducers/clerkExamEventOverview';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';

export const ChangeEnrollmentStatusButton = ({
  enrollment,
}: {
  enrollment: ClerkEnrollment;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix:
      'vkt.component.clerkEnrollmentListing.row.changeEnrollmentStatus',
  });
  const { clerkEnrollmentChangeStatus, examEvent } = useAppSelector(
    clerkExamEventOverviewSelector,
  );
  const dispatch = useAppDispatch();

  if (!examEvent) {
    return null;
  }

  const isLoading =
    clerkEnrollmentChangeStatus === APIResponseStatus.InProgress;

  const newStatus =
    enrollment.status === EnrollmentStatus.QUEUED
      ? EnrollmentStatus.SHIFTED_FROM_QUEUE
      : EnrollmentStatus.QUEUED;

  const changeStatus = (
    e: React.MouseEvent<HTMLButtonElement>,
    newStatus: EnrollmentStatus,
  ) => {
    e.stopPropagation();

    const statusChange = {
      id: enrollment.id,
      version: enrollment.version,
      newStatus,
    };

    dispatch(changeClerkEnrollmentStatus({ statusChange, examEvent }));
  };

  const getStatusText = (status: EnrollmentStatus) => {
    if (status === EnrollmentStatus.SHIFTED_FROM_QUEUE) {
      return t('backToQueue');
    }

    return t('toExamEvent');
  };

  return (
    <LoadingProgressIndicator isLoading={isLoading}>
      <CustomButton
        sx={{ padding: 0 }}
        data-testid={`clerk-exam-event-overview__enrollment-list-${enrollment.id}__change-status-button`}
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
