import { CustomSkeleton, H2 } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { ClerkHomePageControlButtons } from 'components/clerkHomePage/ClerkHomePageControlButtons';
import { ClerkInterpreterAutocompleteFilters } from 'components/clerkInterpreter/filters/ClerkInterpreterAutocompleteFilters';
import { ClerkInterpreterToggleFilters } from 'components/clerkInterpreter/filters/ClerkInterpreterToggleFilters';
import { ClerkInterpreterListing } from 'components/clerkInterpreter/listing/ClerkInterpreterListing';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';

export const ClerkHomePageSkeleton = () => {
  const { t } = useAppTranslation({ keyPrefix: 'otr.pages.clerkHomePage' });
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return (
    <>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <H2>{t('register')}</H2>
      </CustomSkeleton>
      <CustomSkeleton
        ariaLabel={ariaLabel}
        variant={SkeletonVariant.Rectangular}
      >
        <ClerkInterpreterToggleFilters />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <ClerkInterpreterAutocompleteFilters />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <ClerkHomePageControlButtons />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width full-height"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <ClerkInterpreterListing />
      </CustomSkeleton>
    </>
  );
};
