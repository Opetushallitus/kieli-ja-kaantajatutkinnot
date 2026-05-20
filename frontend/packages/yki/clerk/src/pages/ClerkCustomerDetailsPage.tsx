import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkCustomerDetails } from 'components/clerkCustomer/ClerkCustomerDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { RouteType } from 'interfaces/user';
import { H2 } from 'ophTheme/Text';
import {
  loadClerkCustomerDetails,
  loadOrganizerCustomerDetails,
  resetCustomerDetails,
} from 'redux/reducers/clerkCustomerDetails';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

export const ClerkCustomerDetailsPage = ({ route }: { route: RouteType }) => {
  const translateCommon = useCommonTranslation();
  const { customerDetails, status } = useAppSelector(
    clerkCustomerDetailsSelector,
  );

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });

  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    return () => {
      dispatch(resetCustomerDetails());
    };
  }, [dispatch]);

  const { cancelStatus } = useAppSelector(clerkExamSessionDetailsSelector);
  useEffect(() => {
    if (cancelStatus === APIResponseStatus.Success) {
      dispatch(resetCustomerDetails());
    }
  }, [cancelStatus, dispatch]);

  const { relocateStatus } = useAppSelector(clerkExamSessionDetailsSelector);
  useEffect(() => {
    if (relocateStatus === APIResponseStatus.Success) {
      dispatch(resetCustomerDetails());
    }
  }, [relocateStatus, dispatch]);

  useEffect(() => {
    if (
      route === 'clerk' &&
      status === APIResponseStatus.NotStarted &&
      params.personOid
    ) {
      dispatch(loadClerkCustomerDetails(params.personOid));
    } else if (
      route === 'organizer' &&
      status === APIResponseStatus.NotStarted &&
      params.personOid &&
      params.oid
    ) {
      dispatch(
        loadOrganizerCustomerDetails({
          oid: params.oid,
          personOid: params.personOid,
        }),
      );
    } else if (status === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.notFound'),
      });
    }
  }, [
    dispatch,
    navigate,
    route,
    params.oid,
    params.personOid,
    showToast,
    status,
    t,
  ]);

  return (
    <Box className="clerk-customer-details-page">
      <div className="columns gapped-xs">
        <IconButton
          color="secondary"
          className="clerk-customer-details-page__home-button"
          onClick={() => navigate(AppRoutes.CustomerSearch)}
        >
          <HomeOutlined color="secondary" fontSize="large" />
        </IconButton>
        <ChevronRight color="disabled" fontSize="large" />
        <H2>
          {customerDetails?.person
            ? `${customerDetails.person.lastName} ${customerDetails.person.firstName}`
            : translateCommon('loadingContent')}
        </H2>
      </div>

      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-customer-details-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-customer-details-page__grid-container__results"
        >
          <ClerkCustomerDetails route={route} />
        </Paper>
      </Grid>
    </Box>
  );
};
