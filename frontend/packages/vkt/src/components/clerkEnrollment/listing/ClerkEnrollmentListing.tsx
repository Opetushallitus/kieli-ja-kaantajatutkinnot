import { NormalTable } from 'shared/components';

import { ClerkEnrollmentListingHeader } from 'components/clerkEnrollment/listing/ClerkEnrollmentListingHeader';
import { ClerkEnrollmentListingRow } from 'components/clerkEnrollment/listing/ClerkEnrollmentListingRow';
import { ClerkEnrollment, ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkEnrollmentListingProps {
  enrollments: Array<ClerkEnrollment>;
  examEvent: ClerkExamEvent;
}

const getRowDetailsWithExamEventId = (examEvent: ClerkExamEvent) => {
  const getRowDetails = (enrollment: ClerkEnrollment) => {
    return (
      <ClerkEnrollmentListingRow
        enrollment={enrollment}
        examEvent={examEvent}
      />
    );
  };

  return getRowDetails;
};

export const ClerkEnrollmentListing = ({
  enrollments,
  examEvent,
}: ClerkEnrollmentListingProps) => (
  <NormalTable
    className="table-layout-auto"
    data={enrollments}
    header={<ClerkEnrollmentListingHeader />}
    getRowDetails={getRowDetailsWithExamEventId(examEvent)}
    size="small"
    stickyHeader
  />
);
