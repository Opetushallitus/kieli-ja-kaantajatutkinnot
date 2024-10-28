import { Box, Grid } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadExaminerDetails } from 'redux/reducers/examinerDetails';
import { clerkUserSelector } from 'redux/selectors/clerkUser';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';

export const ExaminerHomePage: FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const clerkUser = useAppSelector(clerkUserSelector);
  const { oid, status, examiner, initialized } = useAppSelector(
    examinerDetailsSelector,
  );
  useEffect(() => {
    if (
      oid &&
      (status === APIResponseStatus.NotStarted ||
        (status === APIResponseStatus.Success && oid !== examiner?.oid))
    ) {
      dispatch(loadExaminerDetails(oid));
    }
  }, [dispatch, status, oid, examiner?.oid]);

  // If examiner data is not initialized, redirect user to initialize the data
  useEffect(() => {
    if (initialized === false && oid) {
      navigate(AppRoutes.ExaminerDetailsPage.replace(/:oid/, oid));
    }
  }, [initialized, navigate, clerkUser.isExaminer, oid]);

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <Grid item>
          <H1>Hyvän ja tyydyttävän taidon kielitutkinnot</H1>
        </Grid>
      </Grid>
    </Box>
  );
};
