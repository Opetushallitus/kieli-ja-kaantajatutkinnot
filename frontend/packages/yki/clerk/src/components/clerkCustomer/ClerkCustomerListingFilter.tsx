import { Search } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { APIResponseStatus, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  loadCustomersSearch,
  setExamDateFilter,
  setLanguageFilter,
  setLevelFilter,
  setOrganizerFilter,
  setSearchQueryFilter,
} from 'redux/reducers/clerkCustomersSearch';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { loadExamDates } from 'redux/reducers/examDate';
import { clerkCustomersSearchSelector } from 'redux/selectors/clerkCustomersSearchSelector';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { examDateSelector } from 'redux/selectors/examDate';
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
  const { status: examDateStatus, examDates } =
    useAppSelector(examDateSelector);
  const {
    searchQueryFilter,
    organizerIdFilter,
    examDateIdFilter,
    languageCodeFilter,
    levelCodeFilter,
    size,
  } = useAppSelector(clerkCustomersSearchSelector);

  useEffect(() => {
    if (organizerRegistryStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizerRegistry());
    }
  }, [dispatch, organizerRegistryStatus]);

  useEffect(() => {
    if (examDateStatus === APIResponseStatus.NotStarted) {
      dispatch(loadExamDates());
    }
  }, [dispatch, examDateStatus]);

  return (
    <div
      className="columns gapped"
      style={{ marginBottom: '2rem', alignItems: 'flex-end' }}
    >
      <div style={{ flex: 1, maxWidth: '300px' }}>
        <OphInputFormField
          sx={{ width: '100%' }}
          label={t('labels.participant')}
          value={searchQueryFilter}
          onChange={(e) => dispatch(setSearchQueryFilter(e.target.value))}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                sx={{ padding: 0, margin: '0 4px' }}
                aria-label={t('listing.filters.searchLabel')}
                onClick={() => {
                  dispatch(setSearchQueryFilter(searchQueryFilter));
                  dispatch(
                    loadCustomersSearch({
                      request: {
                        personQuery: searchQueryFilter,
                        organizerId: organizerIdFilter,
                        examDateId: examDateIdFilter,
                        languageCode: languageCodeFilter,
                        levelCode: levelCodeFilter,
                      },
                      page: 0, // Reset to first page when filters change
                      size,
                    }),
                  );
                }}
                onMouseDown={(e) => e.preventDefault()}
                onMouseUp={(e) => e.preventDefault()}
                edge="end"
              >
                <Search color="disabled" fontSize="large" />
              </IconButton>
            </InputAdornment>
          }
        />
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
          onChange={(e) => dispatch(setOrganizerFilter(+e.target.value))}
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <OphSelectFormField
          sx={{ width: '100%' }}
          label={t('labels.examDate')}
          inputProps={{ 'aria-label': t('labels.examDate') }}
          options={[
            { label: t('listing.all'), value: '' },
            ...examDates.map((ed) => ({
              label: ed.examDate.format('D.M.YYYY'),
              value: String(ed.id),
            })),
          ]}
          onChange={(e) => dispatch(setExamDateFilter(+e.target.value))}
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
      <div style={{ minWidth: '150px' }}>
        <OphButton
          variant={Variant.Contained}
          sx={{ width: '100%' }}
          onClick={() =>
            dispatch(
              loadCustomersSearch({
                request: {
                  personQuery: searchQueryFilter,
                  organizerId: organizerIdFilter,
                  examDateId: examDateIdFilter,
                  languageCode: languageCodeFilter,
                  levelCode: levelCodeFilter,
                },
                page: 0, // Reset to first page when filters change
                size,
              }),
            )
          }
        >
          {t('submit')}
        </OphButton>
      </div>
    </div>
  );
};
