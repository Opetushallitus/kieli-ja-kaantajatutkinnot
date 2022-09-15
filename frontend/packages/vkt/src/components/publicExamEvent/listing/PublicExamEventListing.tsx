import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import {
  CustomCircularProgress,
  H2,
  H3,
  PaginatedTable,
} from 'shared/components';
import { APIResponseStatus, Color, TextFieldVariant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicExamEventListingHeader } from 'components/publicExamEvent/listing/PublicExamEventListingHeader';
import { PublicExamEventListingRow } from 'components/publicExamEvent/listing/PublicExamEventListingRow';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { setPublicExamEventLanguageFilter } from 'redux/reducers/publicExamEvent';
import {
  publicExamEventsSelector,
  selectFilteredPublicExamEvents,
} from 'redux/selectors/publicExamEvent';

const getRowDetails = (examEvent: PublicExamEvent) => {
  return <PublicExamEventListingRow examEvent={examEvent} />;
};

export const PublicExamEventListing = ({
  status,
}: {
  status: APIResponseStatus;
}) => {
  const { t } = useAppTranslation({ keyPrefix: 'vkt' });
  const translateCommon = useCommonTranslation();

  const { isPhone } = useWindowProperties();
  const listingHeaderRef = useRef<HTMLDivElement>(null);

  const { languageFilter } = useAppSelector(publicExamEventsSelector);
  const filteredExamEvents = useAppSelector(selectFilteredPublicExamEvents);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isPhone) {
      listingHeaderRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
      });
    }
  }, [isPhone]);

  const LanguageFilter = () => {
    const handleChange = (event: SelectChangeEvent) => {
      dispatch(
        setPublicExamEventLanguageFilter(event.target.value as ExamLanguage)
      );
    };

    return (
      <Select
        data-testid="public-exam-events__language-filter"
        variant={TextFieldVariant.Standard}
        value={languageFilter}
        onChange={handleChange}
      >
        {Object.entries(ExamLanguage).map(([key, language]) => {
          return (
            <MenuItem key={key} value={language}>
              {t(`component.publicExamEventListing.languageFilter.${key}`)}
            </MenuItem>
          );
        })}
      </Select>
    );
  };

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <CustomCircularProgress color={Color.Secondary} />;
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
          <div
            className="public-exam-event-header columns"
            ref={listingHeaderRef}
          >
            <div className="grow">
              <H2>{translateCommon('examDates')}</H2>
            </div>
          </div>
          <PaginatedTable
            headerContent={<LanguageFilter />}
            className={'public-exam-event-listing table-layout-auto'}
            data={filteredExamEvents}
            header={<PublicExamEventListingHeader />}
            getRowDetails={getRowDetails}
            initialRowsPerPage={20}
            rowsPerPageOptions={[20, 50]}
            rowsPerPageLabel={translateCommon('rowsPerPageLabel')}
            stickyHeader
          />
        </>
      );
  }
};