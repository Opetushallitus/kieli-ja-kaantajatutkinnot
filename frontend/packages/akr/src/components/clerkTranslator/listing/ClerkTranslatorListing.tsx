import { Checkbox, TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2, H3, PaginatedTable, Text } from 'shared/components';
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
  valid = 'valid',
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

  const { lastName, firstName, authorisations } = translator;

  const visibleAuthorisations = [
    authorisations.effective,
    authorisations.expiredDeduplicated,
    authorisations.formerVir,
  ].flat();

  const isSelected = filteredSelectedIds.includes(translator.id);

  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e?.stopPropagation();
    navigate(
      AppRoutes.ClerkTranslatorOverviewPage.replace(
        /:translatorId$/,
        `${translator.id}`
      )
    );
    dispatch(setClerkTranslatorOverview(translator));
  };

  const handleCheckboxClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isSelected) {
      dispatch(deselectClerkTranslator(translator.id));
    } else {
      dispatch(selectClerkTranslator(translator.id));
    }
  };

  const getAuthorisationCellContent = useCallback(
    (activeColumn: AuthorisationColumn, authorisation: Authorisation) => {
      const {
        basis,
        languagePair: { from, to },
        permissionToPublish,
        termBeginDate,
        termEndDate,
      } = authorisation;
      switch (activeColumn) {
        case AuthorisationColumn.Basis:
          return basis;
        case AuthorisationColumn.LanguagePair:
          return `${translateLanguage(from)} - ${translateLanguage(to)}`;
        case AuthorisationColumn.PermissionToPublish:
          return permissionToPublish
            ? translateCommon('yes')
            : translateCommon('no');
        case AuthorisationColumn.TermBeginDate:
          return DateUtils.formatOptionalDate(termBeginDate);
        case AuthorisationColumn.TermEndDate:
          return DateUtils.formatOptionalDate(termEndDate);
        case AuthorisationColumn.valid:
          return AuthorisationUtils.isEffective(authorisation, authorisations)
            ? translateCommon('yes')
            : translateCommon('no');
      }
    },
    [authorisations, translateCommon, translateLanguage]
  );

  const getAuthorisationCellClassName = (authorisation: Authorisation) => {
    return !AuthorisationUtils.isEffective(authorisation, authorisations)
      ? 'clerk-translator-listing__ineffective'
      : '';
  };

  return (
    <TableRow
      className="cursor-pointer"
      onClick={handleRowClick}
      selected={isSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox
          data-testid={`clerk-translators__id-${translator.id}-row`}
          checked={isSelected}
          color={Color.Secondary}
          onClick={handleCheckboxClick}
        />
      </TableCell>
      <TableCell>
        <Text>{`${lastName} ${firstName}`}</Text>
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
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color={Color.Secondary}
            checked={allSelected}
            indeterminate={indeterminate}
            onClick={onCheckboxClick}
          />
        </TableCell>
        <TableCell>
          <H3>{t('name')}</H3>
        </TableCell>
        {Object.values(AuthorisationColumn).map((columnName, idx) => (
          <TableCell key={idx}>
            <H3>{t(columnName)}</H3>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export const ClerkTranslatorListing: FC = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akr' });
  const { status, selectedTranslators } = useAppSelector(
    clerkTranslatorsSelector
  );
  const filteredTranslators = useAppSelector(selectFilteredClerkTranslators);

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
        <>
          <div className="grow">
            <H2 data-testid="clerk-translators__selected-count-heading">
              {` ${selectedTranslators.length} / ${
                filteredTranslators.length
              } ${t('component.table.selectedItems')}`}
            </H2>
          </div>
          <PaginatedTable
            data={filteredTranslators}
            header={<ListingHeader />}
            getRowDetails={getRowDetails}
            initialRowsPerPage={10}
            rowsPerPageOptions={[10, 20, 50]}
            rowsPerPageLabel={t('component.table.pagination.rowsPerPage')}
            className={'clerk-translator__listing table-layout-auto'}
            stickyHeader
          />
        </>
      );
  }
};
