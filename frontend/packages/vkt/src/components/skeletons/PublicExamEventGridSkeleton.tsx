import { CustomSkeleton, H1, Text } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';

export const PublicExamEventGridSkeleton = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid',
  });
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');

  return (
    <>
      <CustomSkeleton variant={SkeletonVariant.Text} ariaLabel={ariaLabel}>
        <H1 className="public-homepage__exam-events__heading-title">
          {t('title')}
        </H1>
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Text}
        ariaLabel={ariaLabel}
      >
        <Text className="public-homepage__exam-events__heading-description">
          {t('description.text')}
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
