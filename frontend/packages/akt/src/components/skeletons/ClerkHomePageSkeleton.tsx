import { CustomSkeleton, H2 } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { ClerkHomePageControlButtons } from 'components/clerkHomePage/ClerkHomePageControlButtons';
import { ClerkTranslatorAutocompleteFilters } from 'components/clerkTranslator/filters/ClerkTranslatorAutocompleteFilters';
import { ClerkTranslatorToggleFilters } from 'components/clerkTranslator/filters/ClerkTranslatorToggleFilters';
import { ClerkTranslatorListing } from 'components/clerkTranslator/listing/ClerkTranslatorListing';
import { useCommonTranslation } from 'configs/i18n';

export const ClerkHomePageSkeleton = () => {
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return (
    <>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <H2>{translateCommon('register')}</H2>
      </CustomSkeleton>
      <CustomSkeleton
        ariaLabel={ariaLabel}
        variant={SkeletonVariant.Rectangular}
      >
        <ClerkTranslatorToggleFilters />
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <ClerkTranslatorAutocompleteFilters />
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
        <ClerkTranslatorListing />
      </CustomSkeleton>
    </>
  );
};
