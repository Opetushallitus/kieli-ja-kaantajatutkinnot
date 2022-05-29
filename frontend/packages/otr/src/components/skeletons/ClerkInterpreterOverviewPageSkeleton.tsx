import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { TopControls } from 'components/clerkInterpreter/overview/TopControls';

export const ClerkInterpreterOverviewPageSkeleton = () => {
  return (
    <Skeleton variant={SkeletonVariant.Rectangular}>
      <TopControls />
    </Skeleton>
  );
};
