import { NormalTable } from 'shared/components';

import { ClerkEnrollmentListingHeader } from 'components/clerkEnrollment/listing/ClerkEnrollmentListingHeader';
import { ClerkEnrollmentListingRow } from 'components/clerkEnrollment/listing/ClerkEnrollmentListingRow';
import { ClerkEnrollment } from 'interfaces/clerkExamEvent';

interface ClerkEnrollmentListingProps {
  enrollments: Array<ClerkEnrollment>;
  examEventId: number;
}

const getRowDetailsWithExamEvent = (examEventId: number) => {
  const getRowDetails = (enrollment: ClerkEnrollment) => {
    return (
      <ClerkEnrollmentListingRow
        enrollment={enrollment}
        examEventId={examEventId}
      />
    );
  };

  return getRowDetails;
};

export const ClerkEnrollmentListing = ({
  enrollments,
  examEventId,
}: ClerkEnrollmentListingProps) => (
  <NormalTable
    className="table-layout-auto"
    data={enrollments}
    header={<ClerkEnrollmentListingHeader />}
    getRowDetails={getRowDetailsWithExamEvent(examEventId)}
    size="small"
    stickyHeader
  />
);
