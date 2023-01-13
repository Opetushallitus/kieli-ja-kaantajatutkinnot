import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { FC } from 'react';
import {
  CustomIconButton,
  H3,
  ManagedPaginatedTable,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { MeetingDateStatus } from 'enums/meetingDate';
import { MeetingDate } from 'interfaces/meetingDate';
import {
  removeMeetingDate,
  setPage,
  setRowsPerPage,
} from 'redux/reducers/meetingDate';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';

const getRowDetails = (meetingDate: MeetingDate) => {
  return <ListingRow meetingDate={meetingDate} />;
};

const ListingRow = ({ meetingDate }: { meetingDate: MeetingDate }) => {
  const dispatch = useAppDispatch();

  const { showDialog } = useDialog();

  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.meetingDatesListing.removal',
  });
  const translateCommon = useCommonTranslation();

  const dispatchConfirmRemoveNotifier = () => {
    showDialog({
      title: t('dialog.header'),
      severity: Severity.Warning,
      description: t('dialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            dispatch(removeMeetingDate(meetingDate));
          },
        },
      ],
    });
  };

  const formattedDate = DateUtils.formatOptionalDate(meetingDate.date);

  return (
    <TableRow data-testid={`meeting-date__id-${meetingDate.id}-row`}>
      <TableCell>
        <Text>{formattedDate}</Text>
      </TableCell>
      <TableCell align="right">
        <CustomIconButton
          data-testid="meeting-dates-page__delete-button"
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
    pagination,
  } = useAppSelector(meetingDatesSelector);
  const dispatch = useAppDispatch();

  const { upcoming, passed } = useAppSelector(
    selectMeetingDatesByMeetingStatus
  );

  const onPageChange = (page: number) => dispatch(setPage(page));

  const onRowsPerPageChange = (rowsPerPage: number) =>
    dispatch(setRowsPerPage(rowsPerPage));

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
        <ManagedPaginatedTable
          data={
            filters.meetingStatus === MeetingDateStatus.Upcoming
              ? upcoming
              : passed
          }
          header={<ListingHeader />}
          getRowDetails={(meetingDate) => getRowDetails(meetingDate)}
          rowsPerPageOptions={[10, 20, 50]}
          page={pagination.page}
          onPageChange={onPageChange}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          className="meeting-dates__listing table-layout-auto"
          rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
          stickyHeader
        />
      );
  }
};
