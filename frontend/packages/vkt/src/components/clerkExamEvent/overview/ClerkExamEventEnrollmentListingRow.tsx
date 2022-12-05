import { TableCell, TableRow } from '@mui/material';
import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { useClerkTranslation } from 'configs/i18n';
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
  // I18n
  const { t } = useClerkTranslation({
    keyPrefix:
      'vkt.component.clerkExamEventOverview.examEventDetails.enrollment',
  });

  const partialExams = pick(enrollment, [
    'speakingPartialExam',
    'speechComprehensionPartialExam',
    'writingPartialExam',
    'readingComprehensionPartialExam',
  ]);

  const checkIfPartialExam = () => {
    if (Object.values(partialExams).some((value) => !value)) {
      return Object.keys(partialExams)
        .filter((key) => examCodes[key as keyof typeof examCodes])
        .map((key) => examCodes[key as keyof typeof examCodes])
        .join(', ');
    }

    return t('fullExam');
  };

  return (
    <>
      <TableRow data-testid={`enrollments-table__id-${enrollment.id}-row`}>
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
            {DateUtils.formatOptionalDateTime(
              enrollment.previousEnrollmentDate
            )}
          </Text>
        </TableCell>
        <TableCell />
      </TableRow>
    </>
  );
};
