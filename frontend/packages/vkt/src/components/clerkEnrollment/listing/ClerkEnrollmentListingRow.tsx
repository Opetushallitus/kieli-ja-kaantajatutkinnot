import { TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import { useClerkTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkExamEvent';
import { storeClerkEnrollmentDetails } from 'redux/reducers/clerkEnrollmentDetails';

const examCodes = {
  readingComprehensionPartialExam: 'TY',
  speakingPartialExam: 'PU',
  speechComprehensionPartialExam: 'PY',
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

export const ClerkEnrollmentListingRow = ({
  enrollment,
  examEventId,
}: {
  enrollment: ClerkEnrollment;
  examEventId: number;
}) => {
  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentListing.row',
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const getSelectedPartialExamsText = () => {
    const partialExams = pick(enrollment, [
      'speakingPartialExam',
      'speechComprehensionPartialExam',
      'writingPartialExam',
      'readingComprehensionPartialExam',
    ]);

    if (Object.values(partialExams).some((value) => !value)) {
      return Object.keys(partialExams)
        .filter((key) => partialExams[key as keyof typeof examCodes])
        .map((key) => examCodes[key as keyof typeof examCodes])
        .join(', ');
    }

    return t('fullExam');
  };

  return (
    <>
      <TableRow
        onClick={() => {
          dispatch(storeClerkEnrollmentDetails(enrollment));
          navigate(
            AppRoutes.ClerkEnrollmentOverviewPage.replace(
              /:examEventId/,
              `${examEventId}`
            )
          );
        }}
        data-testid={`enrollments-table__id-${enrollment.id}-row`}
      >
        <TableCell>
          <Text>{enrollment.person.lastName}</Text>
        </TableCell>
        <TableCell>
          <Text>{enrollment.person.firstName}</Text>
        </TableCell>
        <TableCell>
          <Text>{getSelectedPartialExamsText()}</Text>
        </TableCell>
        <TableCell>
          <Text>
            {DateUtils.formatOptionalDateTime(enrollment.enrollmentTime)}
          </Text>
        </TableCell>
        <TableCell />
      </TableRow>
    </>
  );
};
