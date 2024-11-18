import { Divider, SelectChangeEvent } from '@mui/material';
import { H2, PaginatedTable } from 'shared/components';

import { ClerkExaminerExamEventListingHeader } from 'components/clerkExaminer/ClerkExaminerExamEventListingHeader';
import { ClerkExaminerExamEventListingRow } from 'components/clerkExaminer/ClerkExaminerExamEventListingRow';
import { ClerkExaminerExamEventToggleFilters } from 'components/clerkExaminer/ClerkExaminerExamEventToggleFilters';
import { LanguageFilter } from 'components/common/LanguageFilter';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import { ClerkExaminerExamEventListingEntry } from 'interfaces/clerkListExaminer';
import { setClerkListExaminerExamEventFilters } from 'redux/reducers/clerkListExaminer';
import {
  clerkListExaminerSelector,
  selectFilteredClerkExaminerExamEvents,
} from 'redux/selectors/clerkListExaminer';

const getRowDetails = (entry: ClerkExaminerExamEventListingEntry) => {
  return <ClerkExaminerExamEventListingRow entry={entry} />;
};

export const ClerkExaminerExamEventListing = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const { examLanguage } = useAppSelector(clerkListExaminerSelector).filters
    .examEvents;

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(
      setClerkListExaminerExamEventFilters({
        examLanguage: event.target.value as ExamLanguage,
      }),
    );
  };

  const entries = useAppSelector(selectFilteredClerkExaminerExamEvents);

  // TODO Table sorting not implemented yet!

  return (
    <>
      <div className="columns">
        <div className="clerk-homepage__grid-container__heading">
          <H2>{t('title')}</H2>
        </div>
      </div>
      <Divider />
      <ClerkExaminerExamEventToggleFilters />
      <PaginatedTable
        headerContent={
          <LanguageFilter
            value={examLanguage}
            onChange={handleLanguageFilterChange}
          />
        }
        className="table-layout-auto"
        data={entries}
        header={<ClerkExaminerExamEventListingHeader />}
        getRowDetails={getRowDetails}
        initialRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50]}
        rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
        stickyHeader
      />
    </>
  );
};
