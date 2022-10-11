import { TableCell, TableRow } from '@mui/material';
import { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Text } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const ClerkExamEventListingRow = ({
  examEvent,
}: {
  examEvent: ClerkListExamEvent;
}) => {
  const translateCommon = useCommonTranslation();

  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e?.stopPropagation();
    navigate(
      AppRoutes.ClerkExamEventPage.replace(/:examEventId$/, `${examEvent.id}`)
    );
  };

  const formatDate = (date: Dayjs) => date.format('DD.MM.YYYY');

  return (
    <>
      <TableRow
        className="cursor-pointer"
        data-testid={`clerk-exam-events__id-${examEvent.id}-row`}
        onClick={handleRowClick}
      >
        <TableCell>
          <Text>
            {ExamEventUtils.languageAndLevelText(
              examEvent.language,
              examEvent.level,
              translateCommon
            )}
          </Text>
        </TableCell>
        <TableCell>
          <Text>{formatDate(examEvent.date)}</Text>
        </TableCell>
        <TableCell>
          <Text>{formatDate(examEvent.registrationCloses)}</Text>
        </TableCell>
        <TableCell>
          <Text>{`${examEvent.participants} / ${examEvent.maxParticipants}`}</Text>
        </TableCell>
        <TableCell>
          <Text>
            {examEvent.isPublic
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        </TableCell>
      </TableRow>
    </>
  );
};
