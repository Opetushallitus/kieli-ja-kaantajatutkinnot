import { ChevronRight } from '@mui/icons-material';
import { TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ChangeEnrollmentStatusButton } from 'components/clerkEnrollment/listing/ChangeEnrollmentStatusButton';
import { useClerkTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { storeClerkEnrollmentDetails } from 'redux/reducers/clerkEnrollmentDetails';
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
    dispatch(storeClerkEnrollmentDetails(enrollment));
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
          <Text>{enrollment.person.lastName}</Text>
        </TableCell>
        <TableCell>
          <Text>{enrollment.person.firstName}</Text>
        </TableCell>
        <TableCell>
          <Text>{getSelectedPartialExamsText()}</Text>
        </TableCell>
        <TableCell>
          <Text>{DateTimeUtils.renderDateTime(enrollment.enrollmentTime)}</Text>
        </TableCell>
        <TableCell sx={{ width: '20%' }} align="right">
          {[
            EnrollmentStatus.AWAITING_PAYMENT,
            EnrollmentStatus.QUEUED,
          ].includes(enrollment.status) && (
            <ChangeEnrollmentStatusButton enrollment={enrollment} />
          )}
          {enrollment.status === EnrollmentStatus.AWAITING_APPROVAL && (
            <CustomButton
              sx={{ padding: 0 }}
              variant={Variant.Text}
              color={Color.Secondary}
              endIcon={<ChevronRight />}
            >
              {t('changeEnrollmentStatus.approveFreeExam')}
            </CustomButton>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};
