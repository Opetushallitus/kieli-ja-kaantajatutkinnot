import { Collapse, TableCell, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useEffect } from 'react';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { Label, Text } from 'ophTheme/Text';
import { loadClerkOrganizers } from 'redux/reducers/clerkOrganizer';
import {
  clerkOrganizersSelector,
  selectFilteredClerkOrganizers,
} from 'redux/selectors/clerkOrganizers';
import {
  getLanguagesWithLevelDescriptions,
  languagesToString,
} from 'utils/clerk';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
};

type ClerkOrganizerType = {
  id: number;
  oid: string;
  agreement_start_date?: Dayjs;
  agreement_end_date?: Dayjs;
  contact_name?: string;
  contact_email?: string;
  contact_phone_number?: string;
  languages: Array<OrganizerLanguage> | null;
  extra: string;
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
    keyPrefix: 'yki.component.clerkRegister.listing',
  });

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
          renderCollapsibleRow={(row, open, t) => (
            <ClerkRegisterCollapsibleRow row={row} open={open} t={t} />
          )}
          collapsibleRows={true}
        />
      );
  }
};

const ClerkRegisterCollapsibleRow = ({
  row,
  open,
  t,
}: {
  row: ClerkOrganizerType;
  open: boolean;
  t: typeof i18next.t;
}) => (
  <TableRow>
    <TableCell
      style={{ height: 'unset', paddingTop: 0, paddingBottom: 0 }}
      colSpan={3}
    >
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ margin: '1rem 4rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
              justifyContent: 'space-between',
            }}
          >
            <div className="rows">
              <Label>{t('organizerAgreement')}</Label>
              <Text>
                {`${DateUtils.formatOptionalDate(
                  row.agreement_start_date,
                )} - ${DateUtils.formatOptionalDate(row.agreement_end_date)}`}
              </Text>{' '}
            </div>

            <div className="rows">
              <Label>{t('languageProficiencies')}</Label>
              {getLanguagesWithLevelDescriptions(row.languages || []).map(
                (lang) => (
                  <Text key={lang}>{lang}</Text>
                ),
              )}
            </div>
            <div className="rows">
              <Label>{t('contactInfo')}</Label>
              <Text>{row.contact_name}</Text>
              <Text>{row.contact_phone_number}</Text>
              <Text>
                <a href={`mailto:${row.contact_email}`}>{row.contact_email}</a>
              </Text>
            </div>
            <div className="rows">
              <Label>{t('extraInfo')}</Label>
              <Text>{row.extra}</Text>
            </div>
          </div>
        </Box>
      </Collapse>
    </TableCell>
  </TableRow>
);
