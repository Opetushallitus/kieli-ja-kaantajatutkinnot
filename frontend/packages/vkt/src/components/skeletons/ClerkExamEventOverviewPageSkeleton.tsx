import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { ClerkExamEventDetails } from 'components/clerkExamEvent/overview/ClerkExamEventDetails';
import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { AppRoutes } from 'enums/app';

export const ClerkExamEventOverviewPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}>
        <TopControls backTo={AppRoutes.ClerkExcellentLevelPage} />
      </Skeleton>
      <Skeleton
        className="full-max-width half-height margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      >
        <ClerkExamEventDetails />
      </Skeleton>
    </>
  );
};
