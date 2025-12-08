import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useEffect } from 'react';
import { CustomCircularProgress } from 'shared/components';
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
    collapsibleContent: {
      name: organizer.contact_name,
      email: organizer.contact_email,
      phone: organizer.contact_phone_numner,
    },
  }));

  const pagination = {
    page,
    setPage,
    pageSize: 5,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister.listing',
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
    title: t('header.organizer'),
    render: (rowProps) => <span>{rowProps.oid}</span>,
  });

  const createAgreementsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'agreements',
    title: t('header.agreements'),
    render: (rowProps) => (
      <span>
        {rowProps.languages
          ? languagesToString(rowProps.languages)
          : t('agreementExpired')}
      </span>
    ),
  });

  const createMunicipalityColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'municipality',
    title: t('header.municipality'),
    render: (rowProps) => <span>{rowProps.contact_name}</span>,
  });

  const columns = [
    createOrganizerColumn(t),
    createAgreementsColumn(t),
    createMunicipalityColumn(t),
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
          <Typography variant="h2">{t('errors.loadingFailed')}</Typography>
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
