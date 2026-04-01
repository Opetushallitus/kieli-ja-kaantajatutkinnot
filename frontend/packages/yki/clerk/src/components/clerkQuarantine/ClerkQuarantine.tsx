import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

import { ClerkQuarantineListing } from 'components/clerkQuarantine/listing/ClerkQuarantineListing';
import { usePublicTranslation } from 'configs/i18n';

const TABS = ['pending', 'previous', 'active'] as const;
type Tab = (typeof TABS)[number];

type QuarantineTabProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  setPage: Dispatch<SetStateAction<number>>;
};

const QuarantineTabs = ({
  activeTab,
  setActiveTab,
  setPage,
}: QuarantineTabProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.tabs',
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="clerk-quarantine__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-quarantine__filter-tabs__tab ${
              activeTab === tab ? 'active' : ''
            }`}
            onClick={() => handleTabChange(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={() => handleTabChange(tab)}
          >
            {t(tab)}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

export const ClerkQuarantine = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  return (
    <div className="rows gapped">
      <QuarantineTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
      />
      <ClerkQuarantineListing
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        activeTab={activeTab}
      />
    </div>
  );
};
