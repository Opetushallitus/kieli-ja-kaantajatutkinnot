import { Dispatch, SetStateAction } from 'react';
import { CustomSkeleton, H1, Text } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { PublicTranslatorFilters } from 'components/publicTranslator/filters/PublicTranslatorFilters';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';

export const PublicTranslatorGridSkeleton = ({
  showTable,
  setShowTable,
}: {
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useAppTranslation({ keyPrefix: 'otr.pages.homepage' });
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return (
    <>
      <CustomSkeleton variant={SkeletonVariant.Text} ariaLabel={ariaLabel}>
        <H1 className="public-homepage__filters__heading-title">
          {t('filters.title')}
        </H1>
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Text}
        ariaLabel={ariaLabel}
      >
        <Text className="public-homepage__filters__heading-description">
          {t('note')}
        </Text>
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <PublicTranslatorFilters
          showTable={showTable}
          setShowTable={setShowTable}
        />
      </CustomSkeleton>
    </>
  );
};
