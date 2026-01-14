import { OphInputFormField } from '@opetushallitus/oph-design-system';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { setSearchQuery } from 'redux/reducers/clerkOrganizer';

export const ClerkRegisterListingFilters = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(
    (state) => state.clerkOrganizer.searchQuery,
  );

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  return (
    <div className="rows gapped" style={{ marginBottom: '2rem' }}>
      <OphInputFormField
        label={t('listing.filters.searchLabel')}
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        fullWidth
      />
    </div>
  );
};
