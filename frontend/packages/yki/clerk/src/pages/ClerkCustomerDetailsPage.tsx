import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkCustomerDetails } from 'components/clerkCustomer/ClerkCustomerDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { H2 } from 'ophTheme/Text';
import {
  loadClerkCustomerDetails,
  resetCustomerDetails,
} from 'redux/reducers/clerkCustomerDetails';
import { clerkCustomerDetailsSelector } from 'redux/selectors/clerkCustomerDetailsSelector';

export const ClerkCustomerDetailsPage: FC = () => {
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

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted && params.oid) {
      dispatch(loadClerkCustomerDetails(params.oid));
    } else if (status === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('details.toasts.notFound'),
      });
      navigate(AppRoutes.ClerkCustomerDetails);
    }
  }, [dispatch, navigate, params.oid, showToast, status, t]);

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
          <ClerkCustomerDetails />
        </Paper>
      </Grid>
    </Box>
  );
};
