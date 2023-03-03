import { TableCell, TableRow } from '@mui/material';
import { CustomSkeleton, H3, NormalTable } from 'shared/components';
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
        <H3>{t('heading')}</H3>
      </CustomSkeleton>
      <CustomSkeleton
        ariaLabel={translateCommon('loadingContent')}
        className="full-max-width"
        variant={SkeletonVariant.Rectangular}
      >
        <NormalTable
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
