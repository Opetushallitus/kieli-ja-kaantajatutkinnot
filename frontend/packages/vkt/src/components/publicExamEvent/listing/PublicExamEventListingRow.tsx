import { TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import {
  PublicExamEventDesktopCells,
  PublicExamEventPhoneCells,
} from 'components/publicExamEvent/listing/row/PublicExamEventCells';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { setOrToggleSelectedPublicExamEvent } from 'redux/reducers/publicExamEvent';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicExamEventListingRow = ({
  examEvent,
}: {
  examEvent: PublicExamEvent;
}) => {
  const { isPhone } = useWindowProperties();

  // Redux
  const dispatch = useAppDispatch();
  const { selectedExamEvent } = useAppSelector(publicExamEventsSelector);

  const isSelected = examEvent.id === selectedExamEvent?.id;

  const handleRowClick = () => {
    dispatch(setOrToggleSelectedPublicExamEvent(examEvent));
  };

  return (
    <>
      <TableRow
        className="cursor-pointer"
        data-testid={`public-exam-events__id-${examEvent.id}-row`}
        onClick={handleRowClick}
        selected={isSelected}
      >
        {isPhone ? (
          <PublicExamEventPhoneCells examEvent={examEvent} />
        ) : (
          <PublicExamEventDesktopCells examEvent={examEvent} />
        )}
      </TableRow>
    </>
  );
};
