import { NormalTable } from 'shared/components';

import { ClerkExamEventEnrollmentListingHeader } from 'components/clerkExamEvent/overview/ClerkExamEventEnrollmentListingHeader';
import { ClerkExamEventEnrollmentListingRow } from 'components/clerkExamEvent/overview/ClerkExamEventEnrollmentListingRow';
import { Enrollment } from 'interfaces/clerkExamEvent';

interface ClerkExamEventEnrollmentListingProps {
  enrollments?: Array<Enrollment>;
}

const getRowDetails = (enrollment: Enrollment) => {
  return <ClerkExamEventEnrollmentListingRow enrollment={enrollment} />;
};

export const ClerkExamEventEnrollmentListing = ({
  enrollments,
}: ClerkExamEventEnrollmentListingProps) => {
  if (!enrollments || enrollments.length == 0) {
    return null;
  }

  return (
    <NormalTable
      className="table-layout-auto"
      data={enrollments}
      header={<ClerkExamEventEnrollmentListingHeader />}
      getRowDetails={getRowDetails}
      size="small"
      stickyHeader
    />
  );
};
