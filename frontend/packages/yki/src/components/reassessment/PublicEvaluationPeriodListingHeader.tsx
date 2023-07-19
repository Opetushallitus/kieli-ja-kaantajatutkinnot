import { TableCell, TableHead, TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';

export const PublicEvaluationPeriodListingHeader = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing.header',
  });
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>{translateCommon('examination')}</TableCell>
          <TableCell>{translateCommon('examDate')} </TableCell>
          <TableCell>{t('evaluationPeriod')}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
