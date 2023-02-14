import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APIResponseStatus } from 'shared/enums';

import { PublicAuthGrid } from 'components/publicAuth/PublicAuthGrid';
import { AppRoutes } from 'enums/app';
import { startAuthentication } from 'redux/reducers/auth';
import { AuthSelector } from 'redux/selectors/auth';

export const PublicAuthPage: FC = () => {
  const { status } = useSelector(AuthSelector);
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get('ticket');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (ticket && status !== APIResponseStatus.InProgress) {
      navigate(AppRoutes.PublicAuth, { replace: true });
      dispatch(startAuthentication(ticket));
    }
  }, [navigate, dispatch, ticket, status]);

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <PublicAuthGrid />
      </Grid>
    </Box>
  );
};
