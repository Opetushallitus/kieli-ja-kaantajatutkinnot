import { OphInputFormField } from '@opetushallitus/oph-design-system';
import { FC, useState } from 'react';

import { ClerkAddOrganizerDetails } from 'components/clerkRegister/ClerkAddOrganizerDetails';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';

export const ClerkAddOrganizer: FC = () => {
  const [selectedOrganizationOid, setSelectedOrganizationOid] =
    useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { allOrganizations } = useAppSelector(clerkOrganizersSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLDivElement;
      const oid = target.getAttribute('data-oid');
      if (oid) {
        setSelectedOrganizationOid(oid);
      }
    }
  };

  return (
    <div
      className="rows gapped"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OphInputFormField
        data-testid="organizer-search-input"
        label={t('listing.modals.addOrganizer.searchLabel')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('listing.modals.addOrganizer.searchPlaceholder')}
        sx={{ width: '100%' }}
      />

      {selectedOrganizationOid ? (
        <ClerkAddOrganizerDetails
          selectedOrganizationOid={selectedOrganizationOid}
        />
      ) : searchQuery ? (
        <div>
          {allOrganizations
            .filter((org) => {
              return org.nimi.fi.includes(searchQuery);
            })
            .map((org) => (
              <div
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                key={org.oid}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedOrganizationOid(org.oid)}
              >
                {org.nimi.fi}
              </div>
            ))}
        </div>
      ) : (
        <div>{t('listing.modals.addOrganizer.selectOrganizationPrompt')}</div>
      )}
    </div>
  );
};
