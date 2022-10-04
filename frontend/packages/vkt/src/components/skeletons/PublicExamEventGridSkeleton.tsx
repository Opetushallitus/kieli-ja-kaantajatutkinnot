import { CustomSkeleton, H1, Text } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';

export const PublicExamEventGridSkeleton = () => {
  const { t } = usePublicTranslation({ keyPrefix: 'vkt.pages.homepage' });
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return (
    <>
      <CustomSkeleton variant={SkeletonVariant.Text} ariaLabel={ariaLabel}>
        <H1 className="public-homepage__exam-events__heading-title">
          {t('filters.title')}
        </H1>
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Text}
        ariaLabel={ariaLabel}
      >
        <Text className="public-homepage__exam-events__heading-description">
          {t('note')}
        </Text>
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      />
    </>
  );
};
