import { TableCell, TableHead, TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';

export const PublicExamEventListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing.header',
  });
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>{t('language')}</TableCell>
          <TableCell>{t('examDate')}</TableCell>
          <TableCell>{t('registrationCloses')}</TableCell>
          <TableCell>{t('openings')}</TableCell>
          <TableCell>{t('actions')}</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
