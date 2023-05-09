import { TableCell, TableHead, TableRow } from '@mui/material';

import { useClerkTranslation } from 'configs/i18n';

export const ClerkEnrollmentListingHeader = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentListing.header',
  });

  return (
    <TableHead className="heading-text">
      <TableRow>
        <TableCell>{t('firstName')}</TableCell>
        <TableCell>{t('lastName')}</TableCell>
        <TableCell>{t('examEventCoverage')}</TableCell>
        <TableCell>{t('registrationTime')}</TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
