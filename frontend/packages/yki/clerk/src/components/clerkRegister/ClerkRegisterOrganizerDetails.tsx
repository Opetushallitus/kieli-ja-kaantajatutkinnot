import { Error } from '@mui/icons-material';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import i18next from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomButton } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ClerkExamSessionEditModal } from 'components/clerkExamSession/ClerkExamSessionEditModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import axiosInstance from 'configs/axios';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { ClerkOrganizer } from 'interfaces/clerkOrganizer';
import { ExamSession } from 'interfaces/examSessions';
import { RouteType } from 'interfaces/user';
import { H4, Label, Text } from 'ophTheme/Text';
import { loadExamDates, loadOrganizerExamDates } from 'redux/reducers/examDate';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { examDateSelector } from 'redux/selectors/examDate';
import {
  getLanguagesWithLevelDescriptions,
  languageToString,
  levelDescription,
} from 'utils/clerk';
import { SerializationUtils } from 'utils/serialization';

export const ClerkRegisterOrganizerDetails = ({
  row,
  route,
}: {
  row: ClerkOrganizer;
  route: RouteType;
}) => {
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { examDates } = useAppSelector(examDateSelector);
  const { createStatus } = useAppSelector(clerkExamSessionDetailsSelector);
  const params = useParams();
  const oid = params.oid ?? '';
  const navigate = useNavigate();

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const fetchExamSessions = useCallback(async () => {
    try {
      const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
      const response = await axiosInstance.get(
        `${APIEndpoints.Organizer}/${oid}/examSession`,
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
  }, [oid]);

  useEffect(() => {
    if (route === 'clerk') {
      dispatch(loadExamDates(true));
    } else if (route === 'organizer') {
      dispatch(loadOrganizerExamDates(row.oid));
    }
  }, [dispatch, route, row.oid]);

  useEffect(() => {
    fetchExamSessions();
  }, [fetchExamSessions]);

  useEffect(() => {
    if (createStatus === APIResponseStatus.Success) {
      fetchExamSessions();
    }
  }, [createStatus, fetchExamSessions]);

  useEffect(() => {
    dispatch(loadExamDates(true));
  }, [dispatch]);

  useEffect(() => {
    fetchExamSessions();
  }, [fetchExamSessions]);

  useEffect(() => {
    if (createStatus === APIResponseStatus.Success) {
      fetchExamSessions();
    }
  }, [createStatus, fetchExamSessions]);

  const upcomingExams = examSessions
    .map((examSession) => ({
      ...examSession,
    }))
    .filter((exam) => dayjs().isBefore(exam.session_date, 'day'))
    .filter((exam) => exam.organizer_oid === row.oid);

  const pastExams = examSessions
    .map((examSession) => ({
      ...examSession,
    }))
    .filter((exam) => dayjs().isAfter(exam.session_date, 'day'))
    .filter((exam) => exam.organizer_oid === row.oid);

  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ExamSession> => ({
    key: 'session_date',
    title: t('examSessionListing.header.sessionDate'),
    render: (rowProps) =>
      route === 'clerk' ? (
        <a
          href={AppRoutes.ClerkExamSession.replace(':id', String(rowProps.id))}
          onClick={() =>
            navigate(
              AppRoutes.ClerkExamSession.replace(':id', String(rowProps.id)),
            )
          }
        >
          <span>{rowProps.session_date.format('D.M.YYYY')}</span>
        </a>
      ) : (
        <a
          href={AppRoutes.OrganizerExamSession.replace(':oid', oid).replace(
            ':id',
            String(rowProps.id),
          )}
          onClick={() =>
            navigate(
              AppRoutes.OrganizerExamSession.replace(':oid', oid).replace(
                ':id',
                String(rowProps.id),
              ),
            )
          }
        >
          <span>{rowProps.session_date.format('D.M.YYYY')}</span>
        </a>
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
    <Box
      sx={{ margin: '1rem 4rem', padding: '2rem', background: 'white' }}
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
            {!row.languages && (
              <div className="columns" style={{ gap: '0.25rem' }}>
                <Error color="error" fontSize="large" />{' '}
                {t('examSessionListing.agreementExpired')}
              </div>
            )}
          </Text>{' '}
        </div>

        <div className="rows">
          <Label>{t('listing.contentLabels.languageProficiencies')}</Label>
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
            <a href={`mailto:${row.contact_email}`}>{row.contact_email}</a>
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
        <CustomButton variant="outlined">
          {t('listing.actionButtons.modify')}
        </CustomButton>
        <CustomButton
          variant="contained"
          onClick={() => setIsAddModalOpen(true)}
        >
          {t('listing.actionButtons.addExamSession')}
        </CustomButton>
      </div>
      <H4>{t('listing.contentLabels.upcomingExamSessions')}</H4>
      <ListTable
        rows={upcomingExams}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
        rowHeight="small"
      />
      <div className="columns gapped-xxs">
        <H4>{t('listing.contentLabels.pastExamSessions')}</H4>
        <Text>{` ${t('listing.contentLabels.pastExamSessionsDetails')}`}</Text>
      </div>
      <ListTable
        rows={pastExams}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
        rowHeight="small"
      />
      <ClerkExamSessionEditModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        mode="create"
        organizerOid={row.oid}
        examDates={examDates}
        route={route}
        oid={oid}
      />
    </Box>
  );
};
