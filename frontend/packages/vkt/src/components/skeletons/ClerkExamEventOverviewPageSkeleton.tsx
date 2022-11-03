import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { ClerkExamEventDetails } from 'components/clerkExamEvent/overview/ClerkExamEventDetails';
import { TopControls } from 'components/clerkExamEvent/overview/TopControls';

export const ClerkExamEventOverviewPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}>
        <TopControls />
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
