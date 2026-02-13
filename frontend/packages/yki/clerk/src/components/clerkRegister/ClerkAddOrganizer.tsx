import { ListAlt, Search } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import {
  ophColors,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { FC, useState } from 'react';

import { ClerkAddOrganizerDetails } from 'components/clerkRegister/ClerkAddOrganizerDetails';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';

const getOrganizationTypes = (t: (t: string) => string) => ({
  organisaatiotyyppi_01: t('addOrganizer.organizationTypes.type01'),
  organisaatiotyyppi_02: t('addOrganizer.organizationTypes.type02'),
  organisaatiotyyppi_05: t('addOrganizer.organizationTypes.type05'),
});

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
        setSearchQuery('');
      }
    }
  };

  const organizationTypes = getOrganizationTypes(t);

  return (
    <div
      className="rows gapped-sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OphInputFormField
        data-testid="organizer-search-input"
        label={t('addOrganizer.search.label')}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setSelectedOrganizationOid('');
        }}
        placeholder={t('addOrganizer.search.placeholder')}
        sx={{ width: '100%' }}
        endAdornment={
          <InputAdornment position="end">
            <Search fontSize="large" style={{ color: ophColors.grey300 }} />
          </InputAdornment>
        }
      />

      {selectedOrganizationOid ? (
        <ClerkAddOrganizerDetails
          selectedOrganizationOid={selectedOrganizationOid}
        />
      ) : searchQuery ? (
        <div>
          {(() => {
            const filteredOrgs = allOrganizations.filter((org) => {
              return org.nimi.fi
                .toLocaleLowerCase()
                .includes(searchQuery.toLocaleLowerCase());
            });

            return (
              <>
                <div style={{ marginBottom: '0.5rem' }}>
                  {t('addOrganizer.search.result', {
                    count: filteredOrgs.length,
                  })}
                </div>
                {filteredOrgs.map((org) => (
                  <div
                    className="clerk-add-organizer__search-result"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="button"
                    key={org.oid}
                    onClick={() => {
                      setSelectedOrganizationOid(org.oid);
                      setSearchQuery('');
                    }}
                  >
                    <div style={{ color: '#0033CC' }}>{org.nimi.fi}</div>
                    <div>{organizationTypes[org.organisaatiotyypit[0]]}</div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      ) : (
        <div className="rows gapped-sm" style={{ alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2rem',
              backgroundColor: ophColors.grey50,
              borderRadius: '50%',
            }}
          >
            <ListAlt fontSize="large" style={{ color: ophColors.grey700 }} />
          </div>
          <div>{t('addOrganizer.search.infoText')}</div>
        </div>
      )}
    </div>
  );
};
