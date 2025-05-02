import { TableCell, TableHead, TableRow } from '@mui/material';

import { usePublicTranslation } from 'configs/i18n';

export const ClerkRegisterListingHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegisterListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('organizer')}</TableCell>
        <TableCell>{t('agreements')}</TableCell>
        <TableCell>{t('munincipality')}</TableCell>
      </TableRow>
    </TableHead>
  );
};
