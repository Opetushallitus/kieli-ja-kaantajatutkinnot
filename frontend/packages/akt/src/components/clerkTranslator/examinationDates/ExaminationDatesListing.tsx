import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { FC } from 'react';
import { CustomIconButton, H3, PaginatedTable, Text } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExaminationDateStatus } from 'enums/examinationDate';
import { ExaminationDate } from 'interfaces/examinationDate';
import { removeExaminationDate } from 'redux/actions/examinationDate';
import { showNotifierDialog } from 'redux/actions/notifier';
import { NOTIFIER_ACTION_DO_NOTHING } from 'redux/actionTypes/notifier';
import {
  examinationDatesSelector,
  selectExaminationDatesByStatus,
} from 'redux/selectors/examinationDate';
import { NotifierUtils } from 'utils/notifier';

const getRowDetails = (examinationDate: ExaminationDate) => {
  return <ListingRow examinationDate={examinationDate} />;
};

const ListingRow = ({
  examinationDate,
}: {
  examinationDate: ExaminationDate;
}) => {
  const dispatch = useAppDispatch();

  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.examinationDatesListing.removal',
  });
  const translateCommon = useCommonTranslation();

  const dispatchConfirmRemoveNotifier = () => {
    const notifier = NotifierUtils.createNotifierDialog(
      t('dialog.header'),
      Severity.Info,
      t('dialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: NOTIFIER_ACTION_DO_NOTHING,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => dispatch(removeExaminationDate(examinationDate.id)),
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  const formattedDate = DateUtils.formatOptionalDate(examinationDate.date);

  return (
    <TableRow data-testid={`examination-date__id-${examinationDate.id}-row`}>
      <TableCell>
        <Text>{formattedDate}</Text>
      </TableCell>
      <TableCell align="right">
        <CustomIconButton
          data-testid="examination-dates-page__add-button"
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
    keyPrefix: 'akt.component.examinationDatesListing',
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

export const ExaminationDatesListing: FC = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akt' });
  const {
    examinationDates: { status },
    filter,
  } = useAppSelector(examinationDatesSelector);
  const { upcoming, passed } = useAppSelector(selectExaminationDatesByStatus);

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
            filter.examinationDateStatus === ExaminationDateStatus.Upcoming
              ? upcoming
              : passed
          }
          header={<ListingHeader />}
          getRowDetails={getRowDetails}
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          className={'examination-dates__listing table-layout-auto'}
          stickyHeader
          rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
        />
      );
  }
};
