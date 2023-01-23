import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { ClerkInterpreterDetails } from 'components/clerkInterpreter/overview/ClerkInterpreterDetails';
import { BackButton } from 'components/common/BackButton';

export const ClerkInterpreterOverviewPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}>
        <BackButton />
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
