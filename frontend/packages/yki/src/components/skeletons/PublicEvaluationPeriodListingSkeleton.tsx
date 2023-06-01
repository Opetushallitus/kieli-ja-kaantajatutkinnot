import { TableCell, TableRow } from '@mui/material';
import { CustomSkeleton, CustomTable, H2 } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { PublicEvaluationPeriodListingHeader } from 'components/reassessment/PublicEvaluationPeriodListingHeader';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';

const getRowDetails = () => (
  <TableRow>
    <TableCell></TableCell>
    <TableCell></TableCell>
    <TableCell></TableCell>
    <TableCell></TableCell>
  </TableRow>
);

export const PublicEvaluationPeriodListingSkeleton = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing',
  });

  return (
    <>
      <CustomSkeleton
        ariaLabel={translateCommon('loadingContent')}
        className="full-max-width"
        variant={SkeletonVariant.Text}
      >
        <H2>{t('heading')}</H2>
      </CustomSkeleton>
      <CustomSkeleton
        ariaLabel={translateCommon('loadingContent')}
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
      >
        <CustomTable
          className=""
          header={<PublicEvaluationPeriodListingHeader />}
          data={[]}
          getRowDetails={getRowDetails}
          stickyHeader
        />
      </CustomSkeleton>
    </>
  );
};
