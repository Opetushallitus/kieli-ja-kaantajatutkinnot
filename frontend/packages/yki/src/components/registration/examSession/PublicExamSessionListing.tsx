import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
import {
  CustomCircularProgress,
  H3,
  ManagedPaginatedTable,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicExamSessionListingHeader } from 'components/registration/examSession/PublicExamSessionListingHeader';
import { PublicExamSessionListingRow } from 'components/registration/examSession/PublicExamSessionListingRow';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionsSelector } from 'redux/selectors/examSessions';
import { TableUtils } from 'utils/table';

const getRowDetails = (examSession: ExamSession) => {
  return <PublicExamSessionListingRow examSession={examSession} />;
};

const DisplayedRowsLabel = ({
  from,
  to,
  count,
}: {
  from: number;
  to: number;
  count: number;
}) => {
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const fullLabelText = translateCommon(
    'component.table.pagination.displayedRowsAriaLabel',
    {
      from,
      to,
      count,
    },
  );

  if (isPhone) {
    return (
      <>
        <span className="display-none">{fullLabelText}</span>
        <span aria-hidden="true">
          {translateCommon('component.table.pagination.displayedRowsLabel', {
            from,
            to,
            count,
          })}
        </span>
      </>
    );
  } else {
    return fullLabelText;
  }
};

export const PublicExamSessionsTable = ({
  examSessions,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  rowsPerPageOptions,
}: {
  examSessions: Array<ExamSession>;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: Array<number>;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <ManagedPaginatedTable
      className="public-exam-session-listing table-layout-auto"
      data={examSessions}
      header={<PublicExamSessionListingHeader />}
      getRowDetails={getRowDetails}
      rowsPerPageOptions={rowsPerPageOptions}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageLabel={translateCommon(
        'component.table.pagination.rowsPerPage',
      )}
      labelDisplayedRows={({ from, to, count }) => (
        <DisplayedRowsLabel from={from} to={to} count={count} />
      )}
      backIconButtonProps={TableUtils.getPaginationBackButtonProps()}
      nextIconButtonProps={TableUtils.getPaginationNextButtonProps()}
      stickyHeader
    />
  );
};

export const PublicExamSessionListing = ({
  examSessions,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  rowsPerPageOptions,
}: {
  examSessions: Array<ExamSession>;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: Array<number>;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage.examSessionListing',
  });
  const translateCommon = useCommonTranslation();
  const { status } = useAppSelector(examSessionsSelector);

  const listingHeaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      listingHeaderRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
      });
    }
  }, [status]);

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
          <H3>{translateCommon('errors.loadingFailed')}</H3>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <div ref={listingHeaderRef}>
            <Typography
              variant="h2"
              component="h3"
              aria-label={translateCommon(
                'component.table.header.searchResultsAriaLabel',
                {
                  count: examSessions.length,
                },
              )}
              aria-live="assertive"
            >
              {translateCommon('component.table.header.searchResults', {
                count: examSessions.length,
              })}
            </Typography>
          </div>
          {examSessions.length > 0 ? (
            <PublicExamSessionsTable
              examSessions={examSessions}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
            />
          ) : (
            <Text className="margin-top-lg">{t('noResults')}</Text>
          )}
        </>
      );
  }
};
