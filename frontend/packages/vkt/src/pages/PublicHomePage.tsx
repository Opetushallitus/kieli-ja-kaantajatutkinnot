import { Box, Grid } from '@mui/material';
import { FC } from 'react';

import { PublicEnrollmentComplete } from 'components/publicEnrollment/PublicEnrollmentComplete';
import { PublicEnrollmentGrid } from 'components/publicEnrollment/PublicEnrollmentGrid';
import { PublicExamEventGrid } from 'components/publicExamEvent/PublicExamEventGrid';
import { useAppSelector } from 'configs/redux';
import { PublicUIViews } from 'enums/app';
import { publicUIViewSelector } from 'redux/selectors/publicUIView';

export const PublicHomePage: FC = () => {
  const { currentView } = useAppSelector(publicUIViewSelector);

  const renderView = () => {
    if (currentView === PublicUIViews.Enrollment) {
      return <PublicEnrollmentGrid />;
    } else if (currentView === PublicUIViews.EnrollmentComplete) {
      return <PublicEnrollmentComplete />;
    }

    return <PublicExamEventGrid />;
  };

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        {renderView()}
      </Grid>
    </Box>
  );
};
