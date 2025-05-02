import { Box } from '@mui/system';
import { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useEffect } from 'react';
import { CustomCircularProgress, H2 } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { loadClerkOrganizers } from 'redux/reducers/clerkOrganizer';
import {
  clerkOrganizersSelector,
  selectFilteredClerkOrganizers,
} from 'redux/selectors/clerkOrganizers';
import { languagesToString } from 'utils/clerk';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
};

export const ClerkRegisterListing = ({
  page,
  setPage,
}: ClerkRegisterListingProps) => {
  const { status } = useAppSelector(clerkOrganizersSelector);
  const filteredOrganizers = useAppSelector(selectFilteredClerkOrganizers);
  const rows = filteredOrganizers.map((organizer) => ({
    ...organizer,
  }));

  const pagination = {
    page,
    setPage,
    pageSize: 5,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegisterListing.header',
  });

  type ClerkOrganizerType = {
    id: number;
    oid: string;
    agreement_start_date?: Dayjs;
    agreement_end_date?: Dayjs;
    contact_name?: string;
    contact_email?: string;
    contact_phone_numner?: string;
    languages: Array<OrganizerLanguage> | null;
    extra: string;
  };

  const createOrganizerColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'organizer',
    title: t('organizer'),
    render: (rowProps) => <span>{rowProps.oid}</span>,
  });

  const createAgreementsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'agreements',
    title: t('agreements'),
    render: (rowProps) => (
      <span>
        {rowProps.languages
          ? languagesToString(rowProps.languages)
          : 'Sopimus vanhentunut'}
      </span>
    ),
  });

  const createMunincipalityColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'munincipality',
    title: t('munincipality'),
    render: (rowProps) => <span>{rowProps.contact_name}</span>,
  });

  const columns = [
    createOrganizerColumn(t),
    createAgreementsColumn(t),
    createMunincipalityColumn(t),
  ];

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizers());
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
          <H2>{t('errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <ListTable
          rows={rows}
          rowKeyProp="oid"
          columns={columns}
          translateHeader={false}
          pagination={pagination}
        />
      );
  }
};
