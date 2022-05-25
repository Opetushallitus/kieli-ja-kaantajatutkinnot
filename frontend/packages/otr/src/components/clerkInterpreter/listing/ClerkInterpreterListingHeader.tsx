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
          <H3>{t('validFor')}</H3>
        </TableCell>
        <TableCell>
          <div className="columns space-between">
            <H3>{t('region')}</H3>
          </div>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
