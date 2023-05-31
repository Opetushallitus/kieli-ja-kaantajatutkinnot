import { CustomTable } from 'shared/components';

import { ClerkEnrollmentListingHeader } from 'components/clerkEnrollment/listing/ClerkEnrollmentListingHeader';
import { ClerkEnrollmentListingRow } from 'components/clerkEnrollment/listing/ClerkEnrollmentListingRow';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';

interface ClerkEnrollmentListingProps {
  enrollments: Array<ClerkEnrollment>;
  examEventId: number;
}

const getRowDetailsWithExamEventId = (examEventId: number) => {
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
  <CustomTable
    className="table-layout-auto"
    data={enrollments}
    header={<ClerkEnrollmentListingHeader />}
    getRowDetails={getRowDetailsWithExamEventId(examEventId)}
    size="small"
    stickyHeader
  />
);
