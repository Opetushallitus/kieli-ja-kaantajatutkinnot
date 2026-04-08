import { Divider } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ClerkQuarantineListing } from 'components/clerkQuarantine/ClerkQuarantineListing';
import { usePublicTranslation } from 'configs/i18n';
import { loadClerkQuarantineMatches } from 'redux/reducers/clerkQuarantine';
import { selectSortedQuarantineMatches } from 'redux/selectors/clerkQuarantine';

const TABS = ['pending', 'previous', 'active'] as const;
type Tab = (typeof TABS)[number];

type QuarantineTabsProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  setPage: Dispatch<SetStateAction<number>>;
};

const QuarantineTabs = ({
  activeTab,
  setActiveTab,
  setPage,
}: QuarantineTabsProps) => {
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
  const dispatch = useDispatch();
  const matches = useSelector(selectSortedQuarantineMatches);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(loadClerkQuarantineMatches());
  }, [dispatch]);

  return (
    <div className="rows gapped">
      <QuarantineTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
      />
      <ClerkQuarantineListing
        matches={matches}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        activeTab={activeTab}
      />
    </div>
  );
};
