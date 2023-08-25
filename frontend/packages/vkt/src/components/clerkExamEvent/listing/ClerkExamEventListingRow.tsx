import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { TableCell, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';
import { Text } from 'shared/components';
import { Color } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
import { DateTimeUtils } from 'utils/dateTime';
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
          <Text>{DateTimeUtils.renderDate(examEvent.date)}</Text>
        </TableCell>
        <TableCell>
          <Text>{DateTimeUtils.renderDate(examEvent.registrationCloses)}</Text>
        </TableCell>
        <TableCell className="clerk-exam-event-listing-seats-cell">
          <Text>{`${examEvent.participants} / ${examEvent.maxParticipants}`}</Text>
          {examEvent.isUnusedSeats && (
            <div>
              <InfoIcon color={Color.Secondary} />
            </div>
          )}
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
