import { TableCell, TableHead, TableRow } from '@mui/material';
import { H3 } from 'shared/components';

import { useClerkTranslation } from 'configs/i18n';

export const ClerkEnrollmentListingHeader = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentListing.header',
  });

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <H3>{t('firstName')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('lastName')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('examEventCoverage')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('registrationTime')}</H3>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
