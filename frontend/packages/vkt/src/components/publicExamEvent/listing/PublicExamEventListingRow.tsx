import { TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import {
  PublicExamEventDesktopCells,
  PublicExamEventPhoneCells,
} from 'components/publicExamEvent/listing/row/PublicExamEventCells';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import {
  setPublicEnrollmentSelectedExam,
  unsetPublicEnrollmentSelectedExam,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

export const PublicExamEventListingRow = ({
  examEvent,
}: {
  examEvent: PublicExamEvent;
}) => {
  const { isPhone } = useWindowProperties();

  // Redux
  const dispatch = useAppDispatch();
  const { selectedExamEvent } = useAppSelector(publicEnrollmentSelector);

  const isSelected = examEvent.id === selectedExamEvent?.id;
  const enrollToQueue = examEvent.openings <= 0;

  const handleRowClick = () => {
    dispatch(
      isSelected
        ? unsetPublicEnrollmentSelectedExam()
        : setPublicEnrollmentSelectedExam([examEvent, enrollToQueue])
    );
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
          <PublicExamEventPhoneCells
            examEvent={examEvent}
            isSelected={isSelected}
          />
        ) : (
          <PublicExamEventDesktopCells
            examEvent={examEvent}
            isSelected={isSelected}
          />
        )}
      </TableRow>
    </>
  );
};
