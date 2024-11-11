import { TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { Text } from 'shared/components';

import { useClerkTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';
import { DateTimeUtils } from 'utils/dateTime';

const examCodes = {
  writingPartialExam: 'KI',
  readingComprehensionPartialExam: 'TY',
  speakingPartialExam: 'PU',
  speechComprehensionPartialExam: 'PY',
};

function pick<T extends object, K extends keyof T>(object: T, keys: Array<K>) {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key];
    }

    return obj;
  }, {} as Partial<T>);
}

export const ExaminerEnrollmentListingRow = ({
  enrollment,
  examEventId,
}: {
  enrollment: ClerkEnrollmentAppointment;
  examEventId: number;
}) => {
  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentListing.row',
  });
  const navigate = useNavigate();

  const getSelectedPartialExamsText = () => {
    const partialExams = pick(enrollment, [
      'writingPartialExam',
      'readingComprehensionPartialExam',
      'speakingPartialExam',
      'speechComprehensionPartialExam',
    ]);

    if (Object.values(partialExams).some((value) => !value)) {
      return Object.keys(partialExams)
        .filter((key) => partialExams[key as keyof typeof examCodes])
        .map((key) => examCodes[key as keyof typeof examCodes])
        .join(', ');
    }

    return t('fullExam');
  };

  const onClick = () => {
    navigate(
      AppRoutes.ClerkEnrollmentOverviewPage.replace(
        /:examEventId/,
        `${examEventId}`,
      ),
    );
  };

  return (
    <>
      <TableRow
        data-testid={`enrollments-table__id-${enrollment.id}-row`}
        onClick={onClick}
        className="cursor-pointer"
      >
        <TableCell>
          <Text>{enrollment.lastName}</Text>
        </TableCell>
        <TableCell>
          <Text>{enrollment.firstName}</Text>
        </TableCell>
        <TableCell>
          <Text>{getSelectedPartialExamsText()}</Text>
        </TableCell>
        <TableCell>
          <Text>{DateTimeUtils.renderDateTime(enrollment.enrollmentTime)}</Text>
        </TableCell>
        <TableCell sx={{ width: '20%' }} align="right"></TableCell>
      </TableRow>
    </>
  );
};
