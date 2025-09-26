import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

import { ClerkFreeRegistrationListing } from 'components/clerkFreeRegistration/listing/ClerkFreeRegistrationListing';

const TABS = ['pending', 'previous'] as const;

type FreeRegistrationTabProps = {
  activeTab: 'pending' | 'previous';
  setActiveTab: Dispatch<SetStateAction<'pending' | 'previous'>>;
};

const FreeRegistrationTabs = ({
  activeTab,
  setActiveTab,
}: FreeRegistrationTabProps) => {
  return (
    <div className="clerk-free-registration__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-free-registration__filter-tabs__tab ${
              activeTab === tab ? 'active' : ''
            }`}
            onClick={() => setActiveTab(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={() => setActiveTab(tab)}
          >
            {tab === 'pending'
              ? 'Odottavat tarkastukset'
              : 'Aiemmat tarkastukset'}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

export const ClerkFreeRegistration = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'previous'>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <div className="rows gapped">
      <FreeRegistrationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div>
        Tarkasta oikeuttavatko ilmoittautujan toimittamat liitteet tutkinnon
        maksuttomuuteen ja hyväksy maksuttomuus tai lähetä täydennyspyyntö.
      </div>
      <ClerkFreeRegistrationListing
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        activeTab={activeTab}
      />
    </div>
  );
};
