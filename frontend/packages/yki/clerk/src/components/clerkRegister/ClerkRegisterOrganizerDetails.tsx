import { Error } from '@mui/icons-material';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CustomButton } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { ClerkExamSessionEditModal } from 'components/clerkExamSession/ClerkExamSessionEditModal';
import { OrganizerExamSessionListing } from 'components/clerkRegister/listing/OrganizerExamSessionListing';
import axiosInstance from 'configs/axios';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { useCanManage } from 'hooks/useCanManage';
import { ClerkOrganizer } from 'interfaces/clerkOrganizer';
import { ExamSession } from 'interfaces/examSessions';
import { RouteType } from 'interfaces/user';
import { H4, Label, Text } from 'ophTheme/Text';
import { loadExamDates, loadOrganizerExamDates } from 'redux/reducers/examDate';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { examDateSelector } from 'redux/selectors/examDate';
import {
  getLanguagesWithLevelDescriptions,
  isAgreementExpired,
} from 'utils/clerk';
import { SerializationUtils } from 'utils/serialization';

export const ClerkRegisterOrganizerDetails = ({
  row,
  route,
}: {
  row: ClerkOrganizer;
  route: RouteType;
}) => {
  const { showToast } = useToast();
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { examDates } = useAppSelector(examDateSelector);
  const { createStatus } = useAppSelector(clerkExamSessionDetailsSelector);
  const canManage = useCanManage(route);
  const params = useParams();
  const oid = params.oid ?? '';

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
      showToast({
        severity: Severity.Success,
        description: t('listing.modals.modifyAgreement.toasts.updateSuccess'),
      });
      fetchExamSessions();
    } else if (createStatus === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('listing.modals.modifyAgreement.toasts.updateError'),
      });
    }
  }, [createStatus, showToast, t, fetchExamSessions]);

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
            {isAgreementExpired(row) && (
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
      {canManage && (
        <div
          className="columns"
          style={{ justifyContent: 'flex-end', gap: '1rem' }}
        >
          <CustomButton
            variant="contained"
            onClick={() => setIsAddModalOpen(true)}
          >
            {t('listing.actionButtons.addExamSession')}
          </CustomButton>
        </div>
      )}
      <H4>{t('listing.contentLabels.upcomingExamSessions')}</H4>
      <OrganizerExamSessionListing
        examSessions={examSessions}
        organizerOid={row.oid}
        route={route}
        period="upcoming"
      />
      <div className="columns gapped-xxs">
        <H4>{t('listing.contentLabels.pastExamSessions')}</H4>
        <Text>{` ${t('listing.contentLabels.pastExamSessionsDetails')}`}</Text>
      </div>
      <OrganizerExamSessionListing
        examSessions={examSessions}
        organizerOid={row.oid}
        route={route}
        period="past"
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
