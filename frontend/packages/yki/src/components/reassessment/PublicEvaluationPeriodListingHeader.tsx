import { TableCell, TableHead } from '@mui/material';

import { usePublicTranslation } from 'configs/i18n';

export const PublicEvaluationPeriodListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing.header',
  });

  return (
    <TableHead>
      <TableCell>{t('examination')}</TableCell>
      <TableCell>{t('examDate')} </TableCell>
      <TableCell>{t('evaluationPeriod')}</TableCell>
      <TableCell></TableCell>
    </TableHead>
  );
};
