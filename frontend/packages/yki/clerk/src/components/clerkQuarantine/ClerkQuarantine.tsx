import { Box, Divider } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APIResponseStatus } from 'shared/enums';

import { ClerkQuarantineListing } from 'components/clerkQuarantine/ClerkQuarantineListing';
import { usePublicTranslation } from 'configs/i18n';
import { H2 } from 'ophTheme/Text';
import {
  loadClerkQuarantineMatches,
  setQuarantineSort,
} from 'redux/reducers/clerkQuarantine';
import {
  clerkQuarantineSelector,
  selectSortedQuarantineMatches,
} from 'redux/selectors/clerkQuarantine';

const InfoText = ({ status }: { status: APIResponseStatus }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });

  return (
    <Box
      minHeight="10vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <H2>{t(`listing.apiResponseStatus.${status}`)}</H2>
    </Box>
  );
};

const TABS = ['pending', 'previous', 'active'] as const;
type Tab = (typeof TABS)[number];

type QuarantineTabsProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  setPage: Dispatch<SetStateAction<number>>;
  tableRowsCount?: number;
};

const QuarantineTabs = ({
  activeTab,
  setActiveTab,
  setPage,
  tableRowsCount,
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
            {tab === 'pending'
              ? t('pending', { count: tableRowsCount ?? 0 })
              : t(tab)}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

export const ClerkQuarantine = () => {
  const dispatch = useDispatch();
  const { status, sort } = useSelector(clerkQuarantineSelector);
  const rows = useSelector(selectSortedQuarantineMatches);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(loadClerkQuarantineMatches());
  }, [dispatch]);

  const renderListing = () => {
    switch (status) {
      case APIResponseStatus.Success:
        return (
          <ClerkQuarantineListing
            rows={rows}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            activeTab={activeTab}
            sort={sort}
            setSort={(s) => dispatch(setQuarantineSort(s))}
          />
        );
      default:
        return <InfoText status={status} />;
    }
  };

  return (
    <div className="rows gapped">
      <QuarantineTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
        tableRowsCount={rows?.length}
      />
      {renderListing()}
    </div>
  );
};
