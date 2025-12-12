import { Error } from '@mui/icons-material';
import { Collapse, TableCell, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import dayjs, { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import axiosInstance from 'configs/axios';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { ExamSession } from 'interfaces/examSessions';
import { H4, Label, Text } from 'ophTheme/Text';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import {
  getLanguagesWithLevelDescriptions,
  languagesToString,
  languageToString,
  levelDescription,
} from 'utils/clerk';
import { SerializationUtils } from 'utils/serialization';

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
  const { organizerRegistryStatus, organizerRegistry } = useAppSelector(
    clerkOrganizersSelector,
  );

  const rows = organizerRegistry.map((organizer) => ({
    ...organizer.organizer,
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
    render: (rowProps) =>
      rowProps.languages ? (
        <span>{languagesToString(rowProps.languages)}</span>
      ) : (
        <div className="columns" style={{ gap: '0.25rem' }}>
          <Error color="error" fontSize="large" /> {t('agreementExpired')}
        </div>
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
    if (organizerRegistryStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizerRegistry());
    }
  }, [dispatch, organizerRegistryStatus]);

  switch (organizerRegistryStatus) {
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
}) => {
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const tExam = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister.examSessionListing',
  }).t;

  useEffect(() => {
    if (open) {
      const fetchExamSessions = async () => {
        try {
          const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
          const response = await axiosInstance.get(
            `/yki/api/clerk/organizer/${row.oid}/exam-session`,
            { params: { from: oneYearAgo } },
          );
          setExamSessions(
            response.data.exam_sessions.map(
              SerializationUtils.deserializeExamSessionResponse,
            ),
          );
        } catch (error) {
          setExamSessions([]);
        }
      };
      fetchExamSessions();
    }
  }, [row.oid, open, setExamSessions]);

  const rows = examSessions.map((examSession) => ({
    ...examSession,
  }));

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'session_date',
    title: t('header.sessionDate'),
    render: (rowProps) => (
      <span>{rowProps.session_date.format('YYYY-MM-DD')}</span>
    ),
  });

  const createExamLanguageColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'language_code',
    title: t('header.language'),
    render: (rowProps) => (
      <span>{languageToString(rowProps.language_code)}</span>
    ),
  });

  const createExamLevelColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'level_code',
    title: t('header.level'),
    render: (rowProps) => <span>{levelDescription(rowProps.level_code)}</span>,
  });

  const createExamRegistrationPerioidColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'registration_period',
    title: t('header.registrationPerioid'),
    render: (rowProps) => (
      <span>{rowProps.registration_start_date.format('YYYY-MM-DD')}</span>
    ),
  });

  const createExamRegistrationsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'max_participants',
    title: t('header.registrations'),
    render: (rowProps) => (
      <span>{`${rowProps.participants} / ${rowProps.max_participants}`}</span>
    ),
  });

  const columns = [
    createExamDateColumn(tExam),
    createExamLanguageColumn(tExam),
    createExamLevelColumn(tExam),
    createExamRegistrationPerioidColumn(tExam),
    createExamRegistrationsColumn(tExam),
  ];

  return (
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
                  <a href={`mailto:${row.contact_email}`}>
                    {row.contact_email}
                  </a>
                </Text>
              </div>
              <div className="rows">
                <Label>{t('extraInfo')}</Label>
                <Text>{row.extra}</Text>
              </div>
            </div>
            <H4>{t('upcomingExamSessions')}</H4>
            <ListTable
              rows={rows}
              rowKeyProp="id"
              columns={columns}
              translateHeader={false}
            />
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
