import { TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import {
  PublicExamEventDesktopCells,
  PublicExamEventPhoneCells,
} from 'components/publicExamEvent/listing/row/PublicExamEventCells';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export const PublicExamEventListingRow = ({
  examEvent,
}: {
  examEvent: PublicExamEvent;
}) => {
  const { isPhone } = useWindowProperties();

  return (
    <TableRow data-testid={`public-exam-events__id-${examEvent.id}-row`}>
      {isPhone ? (
        <PublicExamEventPhoneCells examEvent={examEvent} />
      ) : (
        <PublicExamEventDesktopCells examEvent={examEvent} />
      )}
    </TableRow>
  );
};
