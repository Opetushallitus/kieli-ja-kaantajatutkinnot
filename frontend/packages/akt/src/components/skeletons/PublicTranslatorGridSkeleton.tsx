import { Dispatch, SetStateAction } from 'react';

import { CustomSkeleton } from 'components/elements/CustomSkeleton';
import { H1, Text } from 'components/elements/Text';
import { PublicTranslatorFilters } from 'components/publicTranslator/filters/PublicTranslatorFilters';
import { useAppTranslation } from 'configs/i18n';
import { SkeletonVariant } from 'enums/app';

export const PublicTranslatorGridSkeleton = ({
  showTable,
  setShowTable,
}: {
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useAppTranslation({ keyPrefix: 'akt.pages.homepage' });

  return (
    <>
      <CustomSkeleton variant={SkeletonVariant.Text}>
        <H1 className="public-homepage__filters__heading-title">
          {t('filters.title')}
        </H1>
      </CustomSkeleton>
      <CustomSkeleton className="full-max-width" variant={SkeletonVariant.Text}>
        <Text className="public-homepage__filters__heading-description">
          {t('note')}
        </Text>
      </CustomSkeleton>
      <CustomSkeleton
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
      >
        <PublicTranslatorFilters
          showTable={showTable}
          setShowTable={setShowTable}
        />
      </CustomSkeleton>
    </>
  );
};
