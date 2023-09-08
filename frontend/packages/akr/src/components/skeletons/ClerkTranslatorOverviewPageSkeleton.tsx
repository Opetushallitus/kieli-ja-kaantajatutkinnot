import { Skeleton } from '@mui/material';
import { SkeletonVariant } from 'shared/enums';

import { AuthorisationDetails } from 'components/clerkTranslator/overview/AuthorisationDetails';
import { ClerkTranslatorDetails } from 'components/clerkTranslator/overview/ClerkTranslatorDetails';
import { BackButton } from 'components/common/BackButton';

export const ClerkTranslatorOverviewPageSkeleton = () => {
  return (
    <>
      <Skeleton variant={SkeletonVariant.Rectangular}>
        <BackButton />
      </Skeleton>
      <Skeleton
        className="full-max-width half-height margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      >
        <ClerkTranslatorDetails />
      </Skeleton>
      <Skeleton
        className="full-max-width margin-top-lg"
        variant={SkeletonVariant.Rectangular}
      >
        <AuthorisationDetails />
      </Skeleton>
    </>
  );
};
