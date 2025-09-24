import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

import { ClerkFreeEnrollmentListing } from 'components/clerkFreeEnrollment/listing/ClerkFreeEnrollmentListing';

const TABS = ['pending', 'previous'] as const;

type FreeEnrollmentTabProps = {
  activeTab: 'pending' | 'previous';
  setActiveTab: Dispatch<SetStateAction<'pending' | 'previous'>>;
};

const FreeEnrollmentTabs = ({
  activeTab,
  setActiveTab,
}: FreeEnrollmentTabProps) => {
  return (
    <div className="clerk-free-enrollment__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-free-enrollment__filter-tabs__tab ${
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

export const ClerkFreeEnrollment = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'previous'>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <div className="rows gapped">
      <FreeEnrollmentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div>
        Tarkasta oikeuttavatko ilmoittautujan toimittamat liitteet tutkinnon
        maksuttomuuteen ja hyväksy maksuttomuus tai lähetä täydennyspyyntö.
      </div>
      <ClerkFreeEnrollmentListing
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        activeTab={activeTab}
      />
    </div>
  );
};
