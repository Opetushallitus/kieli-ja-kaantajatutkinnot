import { TableCell, TableHead, TableRow } from '@mui/material';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';

export const PublicEvaluationPeriodListingHeader = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{translateCommon('examination')}</TableCell>
        <TableCell>{translateCommon('examDate')} </TableCell>
        <TableCell>{t('evaluationPeriod')}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
  );
};
