import { TableCell, TableHead, TableRow } from '@mui/material';

import { useClerkTranslation } from 'configs/i18n';

export const ClerkExamEventListingHeader = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('language')}</TableCell>
        <TableCell>{t('examDate')}</TableCell>
        <TableCell>{t('registrationCloses')}</TableCell>
        <TableCell>{t('fillings')}</TableCell>
        <TableCell>{t('hidden')}</TableCell>
      </TableRow>
    </TableHead>
  );
};
