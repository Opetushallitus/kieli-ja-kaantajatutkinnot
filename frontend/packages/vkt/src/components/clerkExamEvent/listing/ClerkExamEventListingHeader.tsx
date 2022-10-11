import { TableCell, TableHead, TableRow } from '@mui/material';
import { H3 } from 'shared/components';

import { useClerkTranslation } from 'configs/i18n';

export const ClerkExamEventListingHeader = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing.header',
  });

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <H3>{t('language')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('examDate')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('registrationCloses')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('fillings')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('public')}</H3>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
