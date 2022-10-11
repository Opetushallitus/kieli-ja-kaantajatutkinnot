import { Add as AddIcon } from '@mui/icons-material';
import { Divider, SelectChangeEvent } from '@mui/material';
import { CustomButtonLink, H2, PaginatedTable } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ClerkExamEventListingHeader } from 'components/clerkExamEvent/listing/ClerkExamEventListingHeader';
import { ClerkExamEventListingRow } from 'components/clerkExamEvent/listing/ClerkExamEventListingRow';
import { ClerkExamEventToggleFilters } from 'components/clerkExamEvent/listing/ClerkExamEventToggleFilters';
import { LanguageFilter } from 'components/publicExamEvent/LanguageFilter';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
import { setExamEventLanguageFilter } from 'redux/reducers/clerkListExamEvent';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';

const getRowDetails = (examEvent: ClerkListExamEvent) => {
  return <ClerkExamEventListingRow examEvent={examEvent} />;
};

export const ClerkExamEventListing = ({
  examEvents,
}: {
  examEvents: Array<ClerkListExamEvent>;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const { languageFilter } = useAppSelector(clerkListExamEventsSelector);

  const handleLanguageFilterChange = (event: SelectChangeEvent) => {
    dispatch(setExamEventLanguageFilter(event.target.value as ExamLanguage));
  };

  return (
    <>
      <div className="columns">
        <div className="clerk-homepage__grid-container__heading columns grow">
          <H2>{t('title')}</H2>
        </div>
        <div className="flex-end">
          <CustomButtonLink
            data-testid="clerk-exam-events__add-examination-date-btn"
            startIcon={<AddIcon />}
            color={Color.Secondary}
            variant={Variant.Contained}
            to={AppRoutes.ClerkHomePage}
          >
            {t('addExaminationDate')}
          </CustomButtonLink>
        </div>
      </div>
      <Divider />
      <ClerkExamEventToggleFilters />
      <PaginatedTable
        headerContent={
          <LanguageFilter
            value={languageFilter}
            onChange={handleLanguageFilterChange}
          />
        }
        className="table-layout-auto"
        data={examEvents}
        header={<ClerkExamEventListingHeader />}
        getRowDetails={getRowDetails}
        initialRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50]}
        rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
        stickyHeader
      />
    </>
  );
};
