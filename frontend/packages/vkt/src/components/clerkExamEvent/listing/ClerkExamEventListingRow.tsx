import { TableCell, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';
import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

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

  const examEventUrl = AppRoutes.ClerkExamEventOverviewPage.replace(
    /:examEventId$/,
    `${examEvent.id}`
  );

  return (
    <>
      <TableRow
        className="clerk-exam-event-listing__row"
        data-testid={`clerk-exam-events__id-${examEvent.id}-row`}
      >
        <TableCell>
          <Link
            className="clerk-exam-event-listing__row__link"
            to={examEventUrl}
          >
            <Text>
              {ExamEventUtils.languageAndLevelText(
                examEvent.language,
                examEvent.level,
                translateCommon
              )}
            </Text>
          </Link>
        </TableCell>
        <TableCell>
          <Text>{DateUtils.formatOptionalDate(examEvent.date)}</Text>
        </TableCell>
        <TableCell>
          <Text>
            {DateUtils.formatOptionalDate(examEvent.registrationCloses)}
          </Text>
        </TableCell>
        <TableCell>
          <Text>{`${examEvent.participants} / ${examEvent.maxParticipants}`}</Text>
        </TableCell>
        <TableCell>
          <Text>
            {examEvent.isHidden
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        </TableCell>
      </TableRow>
    </>
  );
};
