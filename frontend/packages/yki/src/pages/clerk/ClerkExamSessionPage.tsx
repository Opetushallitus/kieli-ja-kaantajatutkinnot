import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkExamSession } from 'components/clerkExamSession/ClerkExamSession';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { H2 } from 'ophTheme/Text';
import { loadClerkExamSessionDetails } from 'redux/reducers/clerkExamSession';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

export const ClerkExamSessionPage: FC = () => {
  const { status } = useAppSelector(clerkExamSessionDetailsSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });

  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted && params.id) {
      dispatch(loadClerkExamSessionDetails(+params.id));
    } else if (status === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.notFound'),
      });
      navigate(AppRoutes.ClerkCustomerDetails);
    }
  }, [dispatch, navigate, params.id, showToast, status, t]);

  return (
    <Box className="clerk-exam-session-page">
      <div className="columns gapped-xs">
        <IconButton
          color="secondary"
          className="clerk-exam-session-page__home-button"
          onClick={() => navigate(AppRoutes.CustomerSearch)}
        >
          <HomeOutlined color="secondary" fontSize="large" />
        </IconButton>
        <ChevronRight color="disabled" fontSize="large" />
        <H2>Tutkintotilaisuus</H2>
      </div>

      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-exam-session-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-exam-session-page__grid-container__results"
        >
          <ClerkExamSession />
        </Paper>
      </Grid>
    </Box>
  );
};
