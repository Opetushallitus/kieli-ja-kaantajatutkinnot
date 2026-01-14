import { Search } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import {
  OphInputFormField,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';

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

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const levels: LevelCode[] = ['PERUS', 'KESKI', 'YLIN'];

  return (
    <div
      className="columns gapped"
      style={{ marginBottom: '2rem', alignItems: 'flex-start' }}
    >
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <OphInputFormField
          sx={{ width: '100%' }}
          label={t('listing.filters.searchLabel')}
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                sx={{ padding: 0, margin: '0 4px' }}
                aria-label={t('listing.filters.searchLabel')}
                onClick={() => dispatch(setSearchQuery(searchQuery))}
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
      <div style={{ minWidth: '150px' }}>
        <OphSelectFormField
          sx={{ width: '100%' }}
          label={t('listing.filters.languageLabel')}
          inputProps={{
            'aria-label': t('listing.filters.languageLabel'),
          }}
          options={[
            { label: t('listing.filters.all'), value: '' },
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
          label={t('listing.filters.levelLabel')}
          inputProps={{
            'aria-label': t('listing.filters.languageLabel'),
          }}
          options={[
            { label: t('listing.filters.all'), value: '' },
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
