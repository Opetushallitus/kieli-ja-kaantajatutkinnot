import { CustomTable } from 'shared/components';

import { ExaminerEnrollmentListingHeader } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListingHeader';
import { ExaminerEnrollmentListingRow } from 'components/examinerEnrollment/listing/ExaminerEnrollmentListingRow';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';

interface ExaminerEnrollmentListingProps {
  enrollments: Array<ClerkEnrollmentAppointment>;
  examEventId: number;
}

const getRowDetailsWithExamEventId = (examEventId: number) => {
  const getRowDetails = (enrollment: ClerkEnrollmentAppointment) => {
    return (
      <ExaminerEnrollmentListingRow
        enrollment={enrollment}
        examEventId={examEventId}
      />
    );
  };

  return getRowDetails;
};

export const ExaminerEnrollmentListing = ({
  enrollments,
  examEventId,
}: ExaminerEnrollmentListingProps) => (
  <CustomTable
    className="table-layout-auto"
    data={enrollments}
    header={<ExaminerEnrollmentListingHeader />}
    getRowDetails={getRowDetailsWithExamEventId(examEventId)}
    size="small"
    stickyHeader
  />
);
