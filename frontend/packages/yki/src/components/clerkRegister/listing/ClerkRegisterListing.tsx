import { Error, KeyboardArrowDown } from '@mui/icons-material';
import {
  Collapse,
  styled,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  accordionSummaryClasses,
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import { Box } from '@mui/system';
import dayjs, { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton, CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ModifyAgreementModal } from 'components/clerkRegister/listing/ModifyAgreementModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import axiosInstance from 'configs/axios';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { ExamSession } from 'interfaces/examSessions';
import { H4, Label, Text } from 'ophTheme/Text';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import {
  getLanguagesWithLevelDescriptions,
  getOrganizerAddress,
  languagesToString,
  languageToString,
  levelDescription,
} from 'utils/clerk';
import { SerializationUtils } from 'utils/serialization';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
};

export type ClerkOrganizerAddress = {
  street: string;
  zipCode: string;
  city: string;
};

type ClerkOrganizerType = {
  id: number;
  nimi: string;
  address: ClerkOrganizerAddress;
  oid: string;
  agreement_start_date?: Dayjs;
  agreement_end_date?: Dayjs;
  contact_name?: string;
  contact_email?: string;
  contact_phone_number?: string;
  languages: Array<OrganizerLanguage> | null;
  extra: string;
};
const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<KeyboardArrowDown fontSize="large" />}
    {...props}
  />
))(({ theme }) => ({
  flexDirection: 'row-reverse',
  padding: 0,

  [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
    color: theme.palette.text.primary,
    transform: 'rotate(0deg)',
  },
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(180deg)',
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(() => ({
  padding: 0,
}));

export const ClerkRegisterListing = ({
  page,
  setPage,
}: ClerkRegisterListingProps) => {
  const { organizerRegistryStatus, organizerRegistry } = useAppSelector(
    clerkOrganizersSelector,
  );

  const rows = organizerRegistry.map((organizer) => ({
    ...organizer.organizer,
    nimi: organizer?.organization?.nimi?.fi ?? '',
    address: getOrganizerAddress(organizer.organization),
  }));

  const pagination = {
    page,
    setPage,
    pageSize: 5,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const createOrganizerColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'organizer',
    title: t('listing.header.organizer'),
    render: (rowProps) => <span>{rowProps.nimi}</span>,
  });

  const createAgreementsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'agreements',
    title: t('listing.header.agreements'),
    render: (rowProps) =>
      rowProps.languages ? (
        <span>{languagesToString(rowProps.languages)}</span>
      ) : (
        <div className="columns" style={{ gap: '0.25rem' }}>
          <Error color="error" fontSize="large" />{' '}
          {t('examSessionListing.agreementExpired')}
        </div>
      ),
  });

  const createMunicipalityColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'municipality',
    title: t('listing.header.municipality'),
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
          <Typography variant="h2">
            {t('listing.errors.loadingFailed')}
          </Typography>
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
          renderCollapsibleRow={(row, open) => (
            <ClerkRegisterCollapsibleRow row={row} open={open} />
          )}
          collapsibleRows={true}
        />
      );
  }
};

const ClerkRegisterCollapsibleRow = ({
  row,
  open,
}: {
  row: ClerkOrganizerType;
  open: boolean;
}) => {
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const navigate = useNavigate();

  const handleSaveAgreementDate = async (_startDate: Dayjs) => {
    // TODO: Implement API call to update agreement start date
    // For now, just close the modal
    setIsModalOpen(false);
  };

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

  const upcomingExams = examSessions
    .map((examSession) => ({
      ...examSession,
    }))
    .filter((exam) => dayjs().isBefore(exam.session_date, 'day'));

  const pastExams = examSessions
    .map((examSession) => ({
      ...examSession,
    }))
    .filter((exam) => dayjs().isAfter(exam.session_date, 'day'));

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'session_date',
    title: t('examSessionListing.header.sessionDate'),
    render: (rowProps) => (
      <span>{rowProps.session_date.format('D.M.YYYY')}</span>
    ),
  });

  const createExamLanguageColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'language_code',
    title: t('examSessionListing.header.language'),
    render: (rowProps) => (
      <span>{languageToString(rowProps.language_code)}</span>
    ),
  });

  const createExamLevelColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'level_code',
    title: t('examSessionListing.header.level'),
    render: (rowProps) => <span>{levelDescription(rowProps.level_code)}</span>,
  });

  const createExamRegistrationPerioidColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'registration_period',
    title: t('examSessionListing.header.registrationPerioid'),
    render: (rowProps) => (
      <span>{rowProps.registration_start_date.format('YYYY-MM-DD')}</span>
    ),
  });

  const createExamRegistrationsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'max_participants',
    title: t('examSessionListing.header.registrations'),
    render: (rowProps) => (
      <span>{`${rowProps.participants} / ${rowProps.max_participants}`}</span>
    ),
  });

  const columns = [
    createExamDateColumn(t),
    createExamLanguageColumn(t),
    createExamLevelColumn(t),
    createExamRegistrationPerioidColumn(t),
    createExamRegistrationsColumn(t),
  ];

  return (
    <TableRow>
      <TableCell
        style={{ height: 'unset', paddingTop: 0, paddingBottom: 0 }}
        colSpan={3}
      >
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box
            sx={{ margin: '1rem 4rem' }}
            gap={2}
            display="flex"
            flexDirection="column"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <div className="rows">
                <Label>{t('listing.contentLabels.organizerAgreement')}</Label>
                <Text>
                  {`${DateUtils.formatOptionalDate(
                    row.agreement_start_date,
                  )} - ${DateUtils.formatOptionalDate(row.agreement_end_date)}`}
                </Text>{' '}
              </div>

              <div className="rows">
                <Label>
                  {t('listing.contentLabels.languageProficiencies')}
                </Label>
                {getLanguagesWithLevelDescriptions(row.languages || []).map(
                  (lang) => (
                    <Text key={lang}>{lang}</Text>
                  ),
                )}
              </div>
              <div className="rows">
                <Label>{t('listing.contentLabels.contactInfo')}</Label>
                <Text>{row.contact_name}</Text>
                <Text>{row.contact_phone_number}</Text>
                <Text>
                  <a href={`mailto:${row.contact_email}`}>
                    {row.contact_email}
                  </a>
                </Text>
              </div>
              <div className="rows">
                <Label>{t('listing.contentLabels.extraInfo')}</Label>
                <Text>{row.extra}</Text>
              </div>
            </div>
            <div
              className="columns"
              style={{ justifyContent: 'flex-end', gap: '1rem' }}
            >
              <CustomButton
                onClick={() =>
                  navigate(
                    AppRoutes.ClerkOrganizerRegisterDetails.replace(
                      ':oid',
                      row.oid,
                    ),
                  )
                }
                variant="outlined"
              >
                {t('listing.actionButtons.adminUserView')}
              </CustomButton>
              <CustomButton
                variant="outlined"
                onClick={() => setIsModalOpen(true)}
              >
                {t('listing.actionButtons.modify')}
              </CustomButton>
            </div>
            <ModifyAgreementModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              organizerName={row.nimi}
              currentStartDate={row.agreement_start_date}
              currentEndDate={row.agreement_end_date}
              address={row.address}
              languages={row.languages || []}
              onSave={handleSaveAgreementDate}
            />
            <H4>{t('listing.contentLabels.upcomingExamSessions')}</H4>
            <ListTable
              rows={upcomingExams}
              rowKeyProp="id"
              columns={columns}
              translateHeader={false}
              rowHeight="small"
            />
            <Accordion>
              <AccordionSummary
                data-testid="clerk-register__past-exam-sessions-accordion"
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <H4>{t('listing.contentLabels.pastExamSessions')}</H4>
                <Text>
                  {` ${t('listing.contentLabels.pastExamSessionsDetails')}`}
                </Text>
              </AccordionSummary>

              <AccordionDetails>
                <ListTable
                  data-testid="clerk-register__past-exam-sessions"
                  rows={pastExams}
                  rowKeyProp="id"
                  columns={columns}
                  translateHeader={false}
                  rowHeight="small"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
