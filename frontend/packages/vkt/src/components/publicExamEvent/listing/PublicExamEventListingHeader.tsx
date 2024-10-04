import { TableCell, TableHead, TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';

export const PublicExamEventListingHeader = () => {
  const { isPhone } = useWindowProperties();

  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing.header',
  });

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>{t('language')}</TableCell>
          <TableCell>{t('examDate')}</TableCell>
          <TableCell>{t('registrationDates')}</TableCell>
          <TableCell>{t('openings')}</TableCell>
          <TableCell>{t('actions')}</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
