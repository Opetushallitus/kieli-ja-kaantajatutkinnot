import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { OphInputFormField } from '@opetushallitus/oph-design-system';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  setLanguageFilter,
  setLevelFilter,
  setSearchQuery,
} from 'redux/reducers/clerkOrganizer';
import { LANGUAGES, levelDescription } from 'utils/clerk';

type LevelCode = 'PERUS' | 'KESKI' | 'YLIN';

export const ClerkRegisterListingFilters = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(
    (state) => state.clerkOrganizer.searchQuery,
  );
  const languageFilter = useAppSelector(
    (state) => state.clerkOrganizer.languageFilter,
  );
  const levelFilter = useAppSelector(
    (state) => state.clerkOrganizer.levelFilter,
  );

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const levels: LevelCode[] = ['PERUS', 'KESKI', 'YLIN'];

  return (
    <div
      className="columns gapped"
      style={{ marginBottom: '2rem', alignItems: 'flex-start' }}
    >
      <div style={{ flex: 1 }}>
        <OphInputFormField
          label={t('listing.filters.searchLabel')}
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          fullWidth
        />
      </div>
      <div style={{ minWidth: '200px' }}>
        <FormControl fullWidth>
          <InputLabel id="language-filter-label">
            {t('listing.filters.languageLabel')}
          </InputLabel>
          <Select
            labelId="language-filter-label"
            label={t('listing.filters.languageLabel')}
            value={languageFilter}
            onChange={(e) => dispatch(setLanguageFilter(e.target.value))}
          >
            <MenuItem value="">
              <em>{t('listing.filters.all')}</em>
            </MenuItem>
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div style={{ minWidth: '200px' }}>
        <FormControl fullWidth>
          <InputLabel id="level-filter-label">
            {t('listing.filters.levelLabel')}
          </InputLabel>
          <Select
            labelId="level-filter-label"
            label={t('listing.filters.levelLabel')}
            value={levelFilter}
            onChange={(e) => dispatch(setLevelFilter(e.target.value))}
          >
            <MenuItem value="">
              <em>{t('listing.filters.all')}</em>
            </MenuItem>
            {levels.map((level) => (
              <MenuItem key={level} value={level}>
                {levelDescription(level)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};
