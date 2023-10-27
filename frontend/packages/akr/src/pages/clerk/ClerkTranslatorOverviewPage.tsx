import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { AuthorisationDetails } from 'components/clerkTranslator/overview/AuthorisationDetails';
import { ClerkTranslatorDetails } from 'components/clerkTranslator/overview/ClerkTranslatorDetails';
import { BackButton } from 'components/common/BackButton';
import { ClerkTranslatorOverviewPageSkeleton } from 'components/skeletons/ClerkTranslatorOverviewPageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  loadClerkTranslatorOverview,
  resetClerkTranslatorOverview,
} from 'redux/reducers/clerkTranslatorOverview';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';

export const ClerkTranslatorOverviewPage = () => {
  // i18n
  const { t } = useAppTranslation({ keyPrefix: 'akr' });

  const { showToast } = useToast();
  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, translator } = useAppSelector(
    clerkTranslatorOverviewSelector
  );
  const translatorId = translator?.id;
  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const isLoading =
    overviewStatus === APIResponseStatus.InProgress || !translatorId;

  useEffect(() => {
    if (
      overviewStatus === APIResponseStatus.NotStarted &&
      !translatorId &&
      params.translatorId
    ) {
      // Fetch translator overview
      dispatch(loadClerkTranslatorOverview(+params.translatorId));
    } else if (
      overviewStatus === APIResponseStatus.Error ||
      isNaN(Number(params.translatorId))
    ) {
      // Show an error
      showToast({
        severity: Severity.Error,
        description: t('component.clerkTranslatorOverview.toasts.notFound'),
      });
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [
    overviewStatus,
    dispatch,
    navigate,
    params.translatorId,
    showToast,
    translatorId,
    t,
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkTranslatorOverview());
    };
  }, [dispatch]);

  return (
    <Box className="clerk-translator-overview-page">
      <H1>{t('pages.clerkTranslatorOverviewPage.title')}</H1>
      <Paper
        elevation={3}
        className="clerk-translator-overview-page__content-container rows"
      >
        {isLoading ? (
          <ClerkTranslatorOverviewPageSkeleton />
        ) : (
          <>
            <BackButton />
            <div className="rows gapped">
              <ClerkTranslatorDetails />
              <AuthorisationDetails />
            </div>
          </>
        )}
      </Paper>
    </Box>
  );
};
