import { Checkbox, TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { H2, ManagedPaginatedTable, Text } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import {
  deselectAllClerkTranslators,
  deselectClerkTranslator,
  selectAllFilteredClerkTranslators,
  selectClerkTranslator,
  setPage,
  setRowsPerPage,
} from 'redux/reducers/clerkTranslator';
import { setClerkTranslatorOverview } from 'redux/reducers/clerkTranslatorOverview';
import {
  clerkTranslatorsSelector,
  selectFilteredClerkTranslators,
  selectFilteredSelectedIds,
} from 'redux/selectors/clerkTranslator';
import { AuthorisationUtils } from 'utils/authorisation';

enum AuthorisationColumn {
  LanguagePair = 'languagePair',
  Basis = 'basis',
  TermBeginDate = 'termBeginDate',
  TermEndDate = 'termEndDate',
  PermissionToPublish = 'permissionToPublish',
}

const getRowDetails = (translator: ClerkTranslator) => {
  return <ListingRow translator={translator} />;
};

const ListingRow = ({ translator }: { translator: ClerkTranslator }) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();

  const filteredSelectedIds = useAppSelector(selectFilteredSelectedIds);
  const dispatch = useAppDispatch();

  const { id, lastName, firstName, authorisations } = translator;

  const visibleAuthorisations = [
    ...authorisations.effective,
    ...authorisations.expiredDeduplicated,
    ...authorisations.formerVir,
  ];

  const isSelected = filteredSelectedIds.includes(translator.id);

  const overviewUrl = AppRoutes.ClerkTranslatorOverviewPage.replace(
    /:translatorId$/,
    `${id}`
  );

  const handleRowClick = () => dispatch(setClerkTranslatorOverview(translator));

  const handleCheckboxClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isSelected) {
      dispatch(deselectClerkTranslator(id));
    } else {
      dispatch(selectClerkTranslator(id));
    }
  };

  const getAuthorisationCellContent = useCallback(
    (activeColumn: AuthorisationColumn, authorisation: Authorisation) => {
      const {
        basis,
        languagePair,
        permissionToPublish,
        termBeginDate,
        termEndDate,
      } = authorisation;
      switch (activeColumn) {
        case AuthorisationColumn.LanguagePair:
          return AuthorisationUtils.getLanguagePairLocalisation(
            languagePair,
            translateLanguage
          );
        case AuthorisationColumn.Basis:
          return basis;
        case AuthorisationColumn.TermBeginDate:
          return DateUtils.formatOptionalDate(termBeginDate);
        case AuthorisationColumn.TermEndDate:
          return DateUtils.formatOptionalDate(termEndDate);
        case AuthorisationColumn.PermissionToPublish:
          return permissionToPublish
            ? translateCommon('yes')
            : translateCommon('no');
      }
    },
    [translateCommon, translateLanguage]
  );

  const getAuthorisationCellClassName = (authorisation: Authorisation) => {
    return !AuthorisationUtils.isEffective(authorisation, authorisations)
      ? 'clerk-translator-listing__ineffective'
      : '';
  };

  return (
    <TableRow
      className="clerk-translator-listing__row"
      onClick={handleRowClick}
      selected={isSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox
          data-testid={`clerk-translators__id-${id}-row`}
          checked={isSelected}
          color={Color.Secondary}
          onClick={handleCheckboxClick}
        />
      </TableCell>
      <TableCell>
        <Link className="clerk-translator-listing__row__link" to={overviewUrl}>
          <Text>{`${lastName} ${firstName}`}</Text>
        </Link>
      </TableCell>
      {Object.values(AuthorisationColumn).map((activeColumn) => (
        <TableCell key={activeColumn}>
          <div className="rows">
            {visibleAuthorisations.map((authorisation, idx) => (
              <Text
                className={getAuthorisationCellClassName(authorisation)}
                key={idx}
              >
                {getAuthorisationCellContent(activeColumn, authorisation)}
              </Text>
            ))}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
};

const ListingHeader: FC = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorListing.header',
  });

  const dispatch = useAppDispatch();
  const filteredTranslators = useAppSelector(selectFilteredClerkTranslators);
  const filteredCount = filteredTranslators.length;
  const selectedCount = useAppSelector(selectFilteredSelectedIds).length;
  const allSelected = filteredCount > 0 && filteredCount === selectedCount;
  const indeterminate = selectedCount > 0 && selectedCount < filteredCount;
  const onCheckboxClick = () => {
    if (allSelected) {
      dispatch(deselectAllClerkTranslators());
    } else {
      dispatch(selectAllFilteredClerkTranslators(filteredTranslators));
    }
  };

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color={Color.Secondary}
            checked={allSelected}
            indeterminate={indeterminate}
            onClick={onCheckboxClick}
          />
        </TableCell>
        <TableCell>{t('name')}</TableCell>
        {Object.values(AuthorisationColumn).map((columnName, idx) => (
          <TableCell key={idx}>{t(columnName)}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export const ClerkTranslatorListing: FC = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akr' });
  const { status, selectedTranslators, pagination } = useAppSelector(
    clerkTranslatorsSelector
  );
  const dispatch = useAppDispatch();
  const filteredTranslators = useAppSelector(selectFilteredClerkTranslators);
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
          <H2>{t('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <div className="grow">
            <H2 data-testid="clerk-translators__selected-count-heading">
              {` ${selectedTranslators.length} / ${
                filteredTranslators.length
              } ${t('component.table.selectedItems')}`}
            </H2>
          </div>
          <ManagedPaginatedTable
            data={filteredTranslators}
            header={<ListingHeader />}
            getRowDetails={getRowDetails}
            rowsPerPageOptions={[10, 20, 50]}
            page={pagination.page}
            onPageChange={onPageChange}
            rowsPerPage={pagination.rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
            className="table-layout-auto"
            stickyHeader
          />
        </>
      );
  }
};
