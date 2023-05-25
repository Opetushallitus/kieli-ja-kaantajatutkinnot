import { TableCell, TableHead, TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import { useAppTranslation } from 'configs/i18n';

export const PublicInterpreterListingHeader = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing.header',
  });
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell>{t('name')}</TableCell>
          <TableCell>{t('languagePairs')}</TableCell>
          <TableCell>{t('region')}</TableCell>
          <TableCell>{t('contactInformation')}</TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
