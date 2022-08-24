import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { FC } from 'react';
import { CustomIconButton, H3, PaginatedTable, Text } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExaminationDateStatus } from 'enums/examinationDate';
import { ExaminationDate } from 'interfaces/examinationDate';
import { removeExaminationDate } from 'redux/reducers/examinationDate';
import {
  examinationDatesSelector,
  selectExaminationDatesByStatus,
} from 'redux/selectors/examinationDate';

const getRowDetails = (examinationDate: ExaminationDate) => {
  return <ListingRow examinationDate={examinationDate} />;
};

const ListingRow = ({
  examinationDate,
}: {
  examinationDate: ExaminationDate;
}) => {
  const dispatch = useAppDispatch();
  const { showDialog } = useDialog();

  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.examinationDatesListing.removal',
  });
  const translateCommon = useCommonTranslation();

  const dispatchConfirmRemoveNotifier = () => {
    showDialog({
      title: t('dialog.header'),
      severity: Severity.Info,
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
            dispatch(removeExaminationDate(examinationDate.id));
          },
        },
      ],
    });
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
    keyPrefix: 'akr.component.examinationDatesListing',
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
  const { t } = useAppTranslation({ keyPrefix: 'akr' });
  const {
    examinationDates: { status },
    filter,
  } = useAppSelector(examinationDatesSelector);
  const { upcoming, passed } = useAppSelector(selectExaminationDatesByStatus);
  const datesToList =
    filter.examinationDateStatus === ExaminationDateStatus.Upcoming
      ? upcoming
      : passed;

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
          data={datesToList}
          header={<ListingHeader />}
          getRowDetails={(examinationDate) => getRowDetails(examinationDate)}
          initialRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50]}
          className="examination-dates__listing table-layout-auto"
          stickyHeader
          rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
        />
      );
  }
};
