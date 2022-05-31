import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { ClerkInterpreterDetails } from 'components/clerkInterpreter/overview/ClerkInterpreterDetails';
import { TopControls } from 'components/clerkInterpreter/overview/TopControls';

export const ClerkInterpreterOverviewPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}>
        <TopControls />
      </Skeleton>
      <Skeleton
        className="full-max-width half-height margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      >
        <ClerkInterpreterDetails />
      </Skeleton>
    </>
  );
};
