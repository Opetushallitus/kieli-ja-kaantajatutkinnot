import { Box } from '@mui/system';
import { useEffect } from 'react';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  ClerkQuarantineMatch,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';
import { H2, Text } from 'ophTheme/Text';
import {
  loadClerkQuarantineMatches,
  setQuarantineSort,
} from 'redux/reducers/clerkQuarantine';
import {
  clerkQuarantineSelector,
  selectSortedQuarantineMatches,
} from 'redux/selectors/clerkQuarantine';

type ClerkQuarantineListingProps = {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  activeTab: 'pending' | 'previous' | 'active';
};

export const ClerkQuarantineListing = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  activeTab: _activeTab,
}: ClerkQuarantineListingProps) => {
  const { status, sort } = useAppSelector(clerkQuarantineSelector);
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectSortedQuarantineMatches);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });
  const commonTranslation = useCommonTranslation();

  const columns: ListTableColumn<ClerkQuarantineMatch>[] = [
    {
      key: 'label',
      render: () => (
        <div className="rows gapped-xs">
          <Text>{t('listing.rowLabel.registrant')}</Text>
          <Text>{t('listing.rowLabel.ban')}</Text>
        </div>
      ),
    },
    {
      key: 'examLanguageCode',
      title: t('listing.header.examLanguage'),
      sortable: false,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{row.examLanguageCode}</Text>
          <Text>{row.examLanguageCode}</Text>
        </div>
      ),
    },
    {
      key: 'examDate',
      title: t('listing.header.examDate'),
      sortable: true,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{DateUtils.formatOptionalDate(row.examDate, 'l')}</Text>
          <Text>{DateUtils.formatOptionalDate(row.examDate, 'l')}</Text>
        </div>
      ),
    },
    {
      key: 'name',
      title: t('listing.header.name'),
      sortable: false,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{`${row.registrant.firstName} ${row.registrant.lastName}`}</Text>
          <Text>{`${row.ban.firstName} ${row.ban.lastName}`}</Text>
        </div>
      ),
    },
    {
      key: 'birthdate',
      title: t('listing.header.birthdate'),
      sortable: false,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{row.registrant.birthdate}</Text>
          <Text>{row.ban.birthdate}</Text>
        </div>
      ),
    },
    {
      key: 'ssn',
      title: t('listing.header.ssn'),
      sortable: false,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{row.registrant.ssn}</Text>
          <Text>{row.ban.ssn}</Text>
        </div>
      ),
    },
    {
      key: 'email',
      title: t('listing.header.email'),
      sortable: false,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{row.registrant.email}</Text>
          <Text>{row.ban.email}</Text>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      title: t('listing.header.phoneNumber'),
      sortable: false,
      render: (row) => (
        <div className="rows gapped-xs">
          <Text>{row.registrant.phoneNumber}</Text>
          <Text>{row.ban.phoneNumber}</Text>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkQuarantineMatches());
    }
  }, [dispatch, status]);

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
          <H2>{commonTranslation('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <div className="columns space-between">
            {t('listing.amountOfRegistrations', { amount: rows.length })}
            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
          </div>
          <ListTable
            className="clerk-quarantine-listing__table"
            rows={rows}
            rowKeyProp="quarantineId"
            columns={columns}
            translateHeader={false}
            pagination={{ page, setPage, pageSize }}
            sort={sort}
            setSort={(s) =>
              dispatch(setQuarantineSort(s as ClerkQuarantineSort))
            }
          />
        </>
      );
  }
};
