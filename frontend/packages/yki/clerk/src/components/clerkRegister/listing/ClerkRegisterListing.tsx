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
import dayjs from 'dayjs';
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { ClerkRegisterListingFilters } from 'components/clerkRegister/listing/ClerkRegisterListingFilters';
import { ModifyAgreementModal } from 'components/clerkRegister/listing/ModifyAgreementModal';
import { OrganizerExamSessionListing } from 'components/clerkRegister/listing/OrganizerExamSessionListing';
import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import axiosInstance from 'configs/axios';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { ClerkOrganizerType } from 'interfaces/clerkOrganizer';
import { ExamSession } from 'interfaces/examSessions';
import { H4, Label, Text } from 'ophTheme/Text';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { filteredClerkOrganizersSelector } from 'redux/selectors/filteredClerkOrganizers';
import { userSelector } from 'redux/selectors/user';
import {
  getLanguagesWithLevelDescriptions,
  isAgreementExpired,
  languagesToString,
} from 'utils/clerk';
import { SerializationUtils } from 'utils/serialization';

type ClerkRegisterListingProps = {
  page: number;
  setPage: (page: number) => void;
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
  const { organizerRegistryStatus, updateStatus } = useAppSelector(
    clerkOrganizersSelector,
  );
  const rows = useAppSelector(filteredClerkOrganizersSelector);
  const { user } = useAppSelector(userSelector);
  const navigate = useNavigate();

  const pagination = {
    page,
    setPage,
    pageSize: 5,
  };

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const { showToast } = useToast();

  const createOrganizerColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'organizer',
    title: t('listing.header.organizer'),
    render: (rowProps) => <span>{rowProps.name}</span>,
  });

  const createAgreementsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'agreements',
    title: t('listing.header.agreements'),
    render: (rowProps) =>
      isAgreementExpired(rowProps) ? (
        <div className="columns" style={{ gap: '0.25rem' }}>
          <Error color="error" fontSize="large" />{' '}
          {t('examSessionListing.agreementExpired')}
        </div>
      ) : (
        <span>{languagesToString(rowProps.languages ?? [])}</span>
      ),
  });

  const createMunicipalityColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkOrganizerType> => ({
    key: 'municipality',
    title: t('listing.header.municipality'),
    render: (rowProps) => <span>{rowProps.address.city}</span>,
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

  useEffect(() => {
    if (updateStatus === APIResponseStatus.Error) {
      showToast({
        description: t('listing.modals.modifyAgreement.toasts.updateError'),
        severity: Severity.Error,
      });
    } else if (updateStatus === APIResponseStatus.Success) {
      showToast({
        description: t('listing.modals.modifyAgreement.toasts.updateSuccess'),
        severity: Severity.Success,
      });
    }
  }, [updateStatus, showToast, t]);

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
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <ClerkRegisterListingFilters />
            {user?.isAdmin && (
              <CustomButton
                variant="contained"
                color="secondary"
                onClick={() => navigate(AppRoutes.ClerkAddOrganizer)}
                data-testid="add-organizer-button"
              >
                {t('listing.actionButtons.addOrganizer')}
              </CustomButton>
            )}
          </Box>
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
        </>
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
  const { user } = useAppSelector(userSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const fetchExamSessions = async () => {
        try {
          const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
          const response = await axiosInstance.get(
            APIEndpoints.Organizer + `/${row.oid}/examSession`,
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
              {user?.isAdmin && (
                <CustomButton
                  variant="outlined"
                  onClick={() => setIsModalOpen(true)}
                >
                  {t('listing.actionButtons.modify')}
                </CustomButton>
              )}
            </div>
            <ModifyAgreementModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              row={row}
            />
            <H4>{t('listing.contentLabels.upcomingExamSessions')}</H4>
            <OrganizerExamSessionListing
              examSessions={examSessions}
              organizerOid={row.oid}
              route="clerk"
              period="upcoming"
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
                <OrganizerExamSessionListing
                  data-testid="clerk-register__past-exam-sessions"
                  examSessions={examSessions}
                  organizerOid={row.oid}
                  route="clerk"
                  period="past"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
