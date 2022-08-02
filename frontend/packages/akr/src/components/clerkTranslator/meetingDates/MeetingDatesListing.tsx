import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useCallback, useEffect, useState } from 'react';
import { CustomIconButton, H3, PaginatedTable, Text } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { MeetingStatus } from 'enums/meetingDate';
import { MeetingDate } from 'interfaces/meetingDate';
import { removeMeetingDate } from 'redux/actions/meetingDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';
import { NotifierUtils } from 'utils/notifier';

const getRowDetails = (
  enableToastOnRemoveError: () => void,
  meetingDate: MeetingDate
) => {
  return (
    <ListingRow
      meetingDate={meetingDate}
      enableToastOnRemoveError={enableToastOnRemoveError}
    />
  );
};

const ListingRow = ({
  meetingDate,
  enableToastOnRemoveError,
}: {
  meetingDate: MeetingDate;
  enableToastOnRemoveError: () => void;
}) => {
  const dispatch = useAppDispatch();

  const { showDialog } = useDialog();

  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.meetingDatesListing.removal',
  });
  const translateCommon = useCommonTranslation();

  const dispatchConfirmRemoveNotifier = () => {
    showDialog(t('dialog.header'), Severity.Info, t('dialog.description'), [
      {
        title: translateCommon('back'),
        variant: Variant.Outlined,
      },
      {
        title: translateCommon('yes'),
        variant: Variant.Contained,
        action: () => {
          enableToastOnRemoveError();
          dispatch(removeMeetingDate(meetingDate.id));
        },
      },
    ]);
  };

  const formattedDate = DateUtils.formatOptionalDate(meetingDate.date);

  return (
    <TableRow data-testid={`meeting-date__id-${meetingDate.id}-row`}>
      <TableCell>
        <Text>{formattedDate}</Text>
      </TableCell>
      <TableCell align="right">
        <CustomIconButton
          data-testid="meeting-dates-page__add-button"
          onClick={dispatchConfirmRemoveNotifier}
          aria-label={`${t('ariaLabel')} ${formattedDate}`}
        >
          <DeleteIcon color={Color.Error} />
        </CustomIconButton>
      </TableCell>
    </TableRow>
  );
};

const ListingHeader: FC = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.meetingDatesListing',
  });
  const translateCommon = useCommonTranslation();

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <H3>{t('header')}</H3>
        </TableCell>
        <TableCell align="right">
          <H3>{translateCommon('delete')}</H3>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export const MeetingDatesListing: FC = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akr' });
  const {
    meetingDates: { status, filters },
    removeMeetingDate: { error: removeMeetingDateError },
  } = useAppSelector(meetingDatesSelector);
  const { upcoming, passed } = useAppSelector(
    selectMeetingDatesByMeetingStatus
  );
  const [showToastOnRemoveError, setShowToastOnRemoveError] = useState(true);
  const enableToastOnRemoveError = useCallback(
    () => setShowToastOnRemoveError(true),
    []
  );
  const { showToast } = useToast();

  useEffect(() => {
    if (removeMeetingDateError && showToastOnRemoveError) {
      setShowToastOnRemoveError(false);
      showToast(
        Severity.Error,
        NotifierUtils.getAPIErrorMessage(removeMeetingDateError)
      );
    }
  }, [removeMeetingDateError, showToast, showToastOnRemoveError]);

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H3>{t('errors.loadingFailed')}</H3>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <PaginatedTable
          data={
            filters.meetingStatus === MeetingStatus.Upcoming ? upcoming : passed
          }
          header={<ListingHeader />}
          getRowDetails={(meetingDate) =>
            getRowDetails(enableToastOnRemoveError, meetingDate)
          }
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          className="meeting-dates__listing table-layout-auto"
          rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
          stickyHeader
        />
      );
  }
};
