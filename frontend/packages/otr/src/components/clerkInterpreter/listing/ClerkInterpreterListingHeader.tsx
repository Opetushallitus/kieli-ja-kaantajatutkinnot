import { TableCell, TableHead, TableRow } from '@mui/material';

import { useAppTranslation } from 'configs/i18n';

export const ClerkInterpreterListingHeader = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('name')}</TableCell>
        <TableCell>{t('languagePairs')}</TableCell>
        <TableCell>{t('examinationType')}</TableCell>
        <TableCell>{t('beginDate')}</TableCell>
        <TableCell>{t('endDate')}</TableCell>
        <TableCell>{t('permissionToPublish')}</TableCell>
      </TableRow>
    </TableHead>
  );
};
