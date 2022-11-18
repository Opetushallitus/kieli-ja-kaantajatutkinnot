import { TableCell, TableRow } from '@mui/material';
import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { Enrollment } from 'interfaces/clerkExamEvent';

const examCodes = {
  oralSkill: 'ST',
  readingComprehensionPartialExam: 'TY',
  speakingPartialExam: 'PU',
  speechComprehensionPartialExam: 'PY',
  textualSkill: 'TE',
  understandingSkill: 'YM',
  writingPartialExam: 'KI',
};

function pick<T extends object, K extends keyof T>(object: T, keys: Array<K>) {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key];
    }

    return obj;
  }, {} as Partial<T>);
}

export const ClerkExamEventEnrollmentListingRow = ({
  enrollment,
}: {
  enrollment: Enrollment;
}) => {
  const subExams = pick(enrollment, [
    'oralSkill',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
    'textualSkill',
    'understandingSkill',
    'writingPartialExam',
  ]);

  const checkIfPartialExam = () => {
    if (Object.values(subExams).some((value) => !value)) {
      return Object.keys(subExams)
        .map((key) => examCodes[key as keyof typeof examCodes])
        .join(', ');
    }

    return 'Koko tutkinto';
  };

  return (
    <>
      <TableRow data-testid={`enrollments-table__id-${enrollment.id}`}>
        <TableCell>
          <Text>{enrollment.person.lastName}</Text>
        </TableCell>
        <TableCell>
          <Text>{enrollment.person.firstName}</Text>
        </TableCell>
        <TableCell>
          <Text>{checkIfPartialExam()}</Text>
        </TableCell>
        <TableCell>
          <Text>
            {DateUtils.formatOptionalDateAndTime(
              enrollment.previousEnrollmentDate
            )}
          </Text>
        </TableCell>
        <TableCell />
      </TableRow>
    </>
  );
};
