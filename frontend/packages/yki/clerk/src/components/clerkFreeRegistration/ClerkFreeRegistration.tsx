import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

import { ClerkFreeRegistrationListing } from 'components/clerkFreeRegistration/listing/ClerkFreeRegistrationListing';
import { usePublicTranslation } from 'configs/i18n';

const TABS = ['pending', 'previous'] as const;
type Tab = (typeof TABS)[number];

type FreeRegistrationTabProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  setPage: Dispatch<SetStateAction<number>>;
};

const FreeRegistrationTabs = ({
  activeTab,
  setActiveTab,
  setPage,
}: FreeRegistrationTabProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration.tabs',
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="clerk-free-registration__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-free-registration__filter-tabs__tab ${
              activeTab === tab ? 'active' : ''
            }`}
            onClick={() => handleTabChange(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={() => handleTabChange(tab)}
          >
            {tab === 'pending' ? t('pending') : t('previous')}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

export const ClerkFreeRegistration = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkFreeRegistration',
  });

  return (
    <div className="rows gapped">
      <FreeRegistrationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
      />
      <div>{t('description')}</div>
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
