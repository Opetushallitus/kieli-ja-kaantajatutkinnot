import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus } from 'shared/enums';

import { ClerkRegisterOrganizerDetails } from 'components/clerkRegister/ClerkRegisterOrganizerDetails';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { RouteType } from 'interfaces/user';
import { H2 } from 'ophTheme/Text';
import {
  loadClerkOrganizerRegistry,
  loadOrganizerRegistry,
} from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';

export const ClerkOrganizerRegisterDetailsPage = ({
  user,
}: {
  user: RouteType;
}) => {
  const { organizerRegistryStatus, organizerRegistry } = useAppSelector(
    clerkOrganizersSelector,
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const params = useParams();
  const oid = params.oid;

  const rows = organizerRegistry.map((organizer) => ({
    ...organizer.organizer,
    nimi: organizer?.organization?.nimi?.fi ?? '',
  }));

  const row = rows.find((organizer) => organizer.oid === oid);

  useEffect(() => {
    if (organizerRegistryStatus === APIResponseStatus.NotStarted) {
      if (user === 'clerk') {
        dispatch(loadClerkOrganizerRegistry());
      } else if (user === 'organizer' && oid) {
        dispatch(loadOrganizerRegistry(oid));
      }
    }
  }, [dispatch, organizerRegistryStatus, user, oid]);

  return (
    <Box className="clerk-register-page">
      <div className="columns gapped-xs">
        <IconButton
          color="secondary"
          className="clerk-register-page__home-button"
          onClick={() => navigate(AppRoutes.ClerkOrganizerRegister)}
        >
          <HomeOutlined color="secondary" fontSize="large" />
        </IconButton>
        <ChevronRight color="disabled" fontSize="large" />
        {row && <H2>{row.nimi}</H2>}
      </div>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-register-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-register-page__grid-container__results"
        >
          {row && <ClerkRegisterOrganizerDetails user={user} row={row} />}
        </Paper>
      </Grid>
    </Box>
  );
};
