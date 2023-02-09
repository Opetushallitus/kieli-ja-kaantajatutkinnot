import { Box } from '@mui/system';
import { useEffect, useRef } from 'react';
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
import { examSessionsSelector } from 'redux/selectors/examSessions';

export const PublicExamSessionListing = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();
  const { exam_sessions: examSessions, status } =
    useAppSelector(examSessionsSelector);
  //const dispatch = useAppDispatch();

  //const onPageChange = (page: number) => dispatch(setPage(page));
  // eslint-disable-next-line no-console
  const onPageChange = (page: number) => console.log('page', page);
  //const onRowsPerPageChange = (rowsPerPage: number) =>
  //  dispatch(setRowsPerPage(rowsPerPage));
  const onRowsPerPageChange = (rowsPerPage: number) =>
    // eslint-disable-next-line no-console
    console.log('rowsPerPage', rowsPerPage);

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
            getRowDetails={PublicExamSessionListingRow}
            rowsPerPageOptions={[10, 20, 50]}
            //page={pagination.page}
            page={0}
            onPageChange={onPageChange}
            //rowsPerPage={pagination.rowsPerPage}
            rowsPerPage={10}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageLabel={translateCommon(
              'component.table.pagination.rowsPerPage'
            )}
            stickyHeader
          />
        </>
      );
  }
};
