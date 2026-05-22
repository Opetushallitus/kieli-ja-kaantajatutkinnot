import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkExamSession } from 'components/clerkExamSession/ClerkExamSession';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { RouteType } from 'interfaces/user';
import { H2 } from 'ophTheme/Text';
import {
  loadClerkExamSessionDetails,
  loadOrganizerExamSessionDetails,
} from 'redux/reducers/clerkExamSession';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

export const ClerkExamSessionPage = ({ route }: { route: RouteType }) => {
  const { status } = useAppSelector(clerkExamSessionDetailsSelector);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });

  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const oid = params.oid ?? '';

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted && params.id) {
      dispatch(
        route === 'clerk'
          ? loadClerkExamSessionDetails(+params.id)
          : loadOrganizerExamSessionDetails({ oid, examSessionId: +params.id }),
      );
    } else if (status === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.notFound'),
      });
    }
  }, [dispatch, navigate, params.id, oid, route, showToast, status, t]);

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
          <ClerkExamSession oid={oid} route={route} />
        </Paper>
      </Grid>
    </Box>
  );
};
