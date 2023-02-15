import { LabelDisplayedRowsArgs } from '@mui/material/TablePagination';
import { Box } from '@mui/system';
import { TFunction } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import {
  CustomCircularProgress,
  H2,
  H3,
  ManagedPaginatedTable,
} from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicExamSessionListingHeader } from 'components/registration/examSession/PublicExamSessionListingHeader';
import { PublicExamSessionListingRow } from 'components/registration/examSession/PublicExamSessionListingRow';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { /*useAppDispatch,*/ useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import {
  examSessionsSelector,
  selectFilteredPublicExamSessions,
} from 'redux/selectors/examSessions';
import { TableUtils } from 'utils/table';

const getRowDetails = (examSession: ExamSession) => {
  return <PublicExamSessionListingRow examSession={examSession} />;
};

const getDisplayedRowsLabel = (
  t: TFunction,
  { from, to, count }: LabelDisplayedRowsArgs
) => {
  return t('component.table.pagination.displayedRowsLabel', {
    from,
    to,
    count,
  });
};

export const PublicExamSessionListing = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const { status } = useAppSelector(examSessionsSelector);
  const examSessions = useAppSelector(selectFilteredPublicExamSessions);
  //const dispatch = useAppDispatch();

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const listingHeaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isPhone) {
      listingHeaderRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
      });
    }
  }, [isPhone]);

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
          <div className="columns" ref={listingHeaderRef}>
            <div className="grow">
              <H2>{t('searchResults')}</H2>
            </div>
          </div>
          <ManagedPaginatedTable
            className="public-exam-session-listing"
            data={examSessions}
            header={<PublicExamSessionListingHeader />}
            getRowDetails={getRowDetails}
            rowsPerPageOptions={[10, 20, 50]}
            page={page}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            rowsPerPageLabel={translateCommon(
              'component.table.pagination.rowsPerPage'
            )}
            labelDisplayedRows={(args) =>
              getDisplayedRowsLabel(translateCommon, args)
            }
            backIconButtonProps={TableUtils.getPaginationBackButtonProps()}
            nextIconButtonProps={TableUtils.getPaginationNextButtonProps()}
            stickyHeader
          />
        </>
      );
  }
};
