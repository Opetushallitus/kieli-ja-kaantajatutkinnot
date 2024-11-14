import { CustomTable } from 'shared/components';

import { ExaminerEnrollmentListingHeader } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListingHeader';
import { ExaminerEnrollmentListingRow } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListingRow';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';

interface ExaminerEnrollmentListingProps {
  enrollments: Array<ClerkEnrollmentAppointment>;
}

const getRowDetailsWithExamEventId = () => {
  const getRowDetails = (enrollment: ClerkEnrollmentAppointment) => {
    return <ExaminerEnrollmentListingRow enrollment={enrollment} />;
  };

  return getRowDetails;
};

export const ExaminerEnrollmentListing = ({
  enrollments,
}: ExaminerEnrollmentListingProps) => (
  <CustomTable
    className="table-layout-auto"
    data={enrollments}
    header={<ExaminerEnrollmentListingHeader />}
    getRowDetails={getRowDetailsWithExamEventId()}
    size="small"
    stickyHeader
  />
);
