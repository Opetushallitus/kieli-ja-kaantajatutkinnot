import { TableCell, TableHead, TableRow } from '@mui/material';
import { H3 } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';

export const ClerkInterpreterListingHeader = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterListing.header',
  });

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <H3>{t('name')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('languagePairs')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('examinationType')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('beginDate')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('endDate')}</H3>
        </TableCell>
        <TableCell>
          <H3>{t('permissionToPublish')}</H3>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
