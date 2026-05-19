import { Box, Divider } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ActiveQuarantinesListing } from 'components/clerkQuarantine/listing/ActiveQuarantinesListing';
import { PastReviewsListing } from 'components/clerkQuarantine/listing/PastReviewsListing';
import { PendingReviewsListing } from 'components/clerkQuarantine/listing/PendingReviewsListing';
import { usePublicTranslation } from 'configs/i18n';
import { H2 } from 'ophTheme/Text';
import {
  loadClerkActiveQuarantines,
  loadClerkQuarantineMatches,
  loadClerkQuarantineReviews,
  resetCreateClerkQuarantineStatus,
  resetQuarantineReviewStatus,
  setActiveQuarantinesSort,
  setQuarantineReview,
  setQuarantineSort,
} from 'redux/reducers/clerkQuarantine';
import {
  clerkQuarantineSelector,
  selectSortedActiveQuarantines,
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

const TABS = ['pendingReviews', 'pastReviews', 'activeQuarantines'] as const;
type ClerkQuarantineTab = (typeof TABS)[number];

type QuarantineTabsProps = {
  activeTab: ClerkQuarantineTab;
  setActiveTab: Dispatch<SetStateAction<ClerkQuarantineTab>>;
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

  const handleTabChange = (tab: ClerkQuarantineTab) => {
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
            {tab === 'pendingReviews'
              ? t('pendingReviews', { count: tableRowsCount ?? 0 })
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
  const {
    status,
    sort,
    reviewStatus,
    lastReviewAction,
    reviews,
    reviewsStatus,
    activeQuarantinesStatus,
    activeQuarantinesSort,
    createStatus,
  } = useSelector(clerkQuarantineSelector);
  const prevCreateStatus = useRef(createStatus);
  const rows = useSelector(selectSortedQuarantineMatches);
  const activeQuarantineRows = useSelector(selectSortedActiveQuarantines);
  const [activeTab, setActiveTab] =
    useState<ClerkQuarantineTab>('pendingReviews');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { showToast } = useToast();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });

  useEffect(() => {
    dispatch(loadClerkQuarantineMatches());
  }, [dispatch]);

  useEffect(() => {
    if (
      activeTab === 'pastReviews' &&
      reviewsStatus === APIResponseStatus.NotStarted
    ) {
      dispatch(loadClerkQuarantineReviews());
    }
  }, [dispatch, activeTab, reviewsStatus]);

  useEffect(() => {
    if (
      activeTab === 'activeQuarantines' &&
      activeQuarantinesStatus === APIResponseStatus.NotStarted
    ) {
      dispatch(loadClerkActiveQuarantines());
    }
  }, [dispatch, activeTab, activeQuarantinesStatus]);

  useEffect(() => {
    if (!lastReviewAction) return;
    if (reviewStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t(`toasts.${lastReviewAction}Success`),
      });
      dispatch(resetQuarantineReviewStatus());
    } else if (reviewStatus === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t(`toasts.${lastReviewAction}Error`),
      });
      dispatch(resetQuarantineReviewStatus());
    }
  }, [dispatch, showToast, t, reviewStatus, lastReviewAction]);

  useEffect(() => {
    if (prevCreateStatus.current === APIResponseStatus.InProgress) {
      if (createStatus === APIResponseStatus.Success) {
        showToast({
          severity: Severity.Success,
          description: t('toasts.quarantineAdded'),
        });
        dispatch(resetCreateClerkQuarantineStatus());
      } else if (createStatus === APIResponseStatus.Error) {
        dispatch(resetCreateClerkQuarantineStatus());
      }
    }
    prevCreateStatus.current = createStatus;
  }, [dispatch, showToast, t, createStatus]);

  const renderListing = () => {
    switch (activeTab) {
      case 'pastReviews':
        return reviewsStatus !== APIResponseStatus.Success ? (
          <InfoText status={reviewsStatus} />
        ) : (
          <PastReviewsListing
            rows={reviews}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            sort={sort}
            setSort={(s) => dispatch(setQuarantineSort(s))}
            onCancelRegistration={(quarantineId, registrationId) =>
              dispatch(
                setQuarantineReview({
                  quarantineId,
                  registrationId,
                  matchConfirmed: false,
                }),
              )
            }
          />
        );

      case 'activeQuarantines':
        return activeQuarantinesStatus !== APIResponseStatus.Success ? (
          <InfoText status={activeQuarantinesStatus} />
        ) : (
          <ActiveQuarantinesListing
            rows={activeQuarantineRows}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            sort={activeQuarantinesSort}
            setSort={(s) => dispatch(setActiveQuarantinesSort(s))}
          />
        );

      case 'pendingReviews':
      default:
        return status !== APIResponseStatus.Success ? (
          <InfoText status={status} />
        ) : (
          <PendingReviewsListing
            rows={rows}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            activeTab={activeTab}
            sort={sort}
            setSort={(s) => dispatch(setQuarantineSort(s))}
            onSetReview={(quarantineId, registrationId, matchConfirmed) =>
              dispatch(
                setQuarantineReview({
                  quarantineId,
                  registrationId,
                  matchConfirmed,
                }),
              )
            }
          />
        );
    }
  };

  return (
    <div className="rows gapped">
      <QuarantineTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
        tableRowsCount={rows.length}
      />
      {renderListing()}
    </div>
  );
};
