import { TextField } from '@mui/material';
import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { Label } from 'ophTheme/Text';
import {
  setExamDateFilter,
  setLanguageFilter,
  setLevelFilter,
  setOrganizerFilter,
} from 'redux/reducers/clerkCustomersSearch';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { loadExamSessions } from 'redux/reducers/examSessions';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { examSessionsSelector } from 'redux/selectors/examSessions';
import { filteredClerkOrganizersSelector } from 'redux/selectors/filteredClerkOrganizers';
import { LANGUAGES, levelDescription } from 'utils/clerk';

type LevelCode = 'PERUS' | 'KESKI' | 'YLIN';

export const ClerkCustomerListingFilter = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.search',
  });

  const levels: LevelCode[] = ['PERUS', 'KESKI', 'YLIN'];
  const dispatch = useAppDispatch();
  const { organizerRegistryStatus } = useAppSelector(clerkOrganizersSelector);
  const organizers = useAppSelector(filteredClerkOrganizersSelector);
  const { status: examSessionsStatus, exam_sessions } =
    useAppSelector(examSessionsSelector);

  useEffect(() => {
    if (organizerRegistryStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizerRegistry());
    }
    if (examSessionsStatus === APIResponseStatus.NotStarted) {
      dispatch(loadExamSessions());
    }
  }, [dispatch, organizerRegistryStatus, examSessionsStatus]);

  return (
    <div
      className="columns gapped"
      style={{ marginBottom: '2rem', alignItems: 'flex-start' }}
    >
      <div style={{ flex: 1, maxWidth: '300px' }}>
        <Label>{t('labels.participant')}</Label>
        <TextField sx={{ width: '100%' }} />
      </div>
      <div style={{ flex: 1, maxWidth: '300px' }}>
        <OphSelectFormField
          sx={{ width: '100%' }}
          label={t('labels.organizer')}
          inputProps={{ 'aria-label': t('labels.organizer') }}
          options={[
            { label: t('listing.all'), value: '' },
            ...organizers.map((org) => ({
              label: org.name,
              value: String(org.id),
            })),
          ]}
          onChange={(e) => dispatch(setOrganizerFilter(e.target.value))}
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <OphSelectFormField
          sx={{ width: '100%' }}
          label={t('labels.examDate')}
          inputProps={{ 'aria-label': t('labels.examDate') }}
          options={[
            { label: t('listing.all'), value: '' },
            ...exam_sessions.map((es) => ({
              label: es.session_date.format('D.M.YYYY'),
              value: String(es.id),
            })),
          ]}
          onChange={(e) => dispatch(setExamDateFilter(e.target.value))}
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <OphSelectFormField
          sx={{ width: '100%' }}
          label={t('labels.language')}
          inputProps={{ 'aria-label': t('labels.language') }}
          options={[
            { label: t('listing.all'), value: '' },
            ...LANGUAGES.map((lang) => ({
              label: lang.name,
              value: lang.code,
            })),
          ]}
          onChange={(e) => dispatch(setLanguageFilter(e.target.value))}
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <OphSelectFormField
          sx={{ width: '100%' }}
          label={t('labels.level')}
          inputProps={{ 'aria-label': t('labels.level') }}
          options={[
            { label: t('listing.all'), value: '' },
            ...levels.map((level) => ({
              label: levelDescription(level),
              value: level,
            })),
          ]}
          onChange={(e) => dispatch(setLevelFilter(e.target.value))}
        />
      </div>
    </div>
  );
};
