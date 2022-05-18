import { TableCell, TableHead, TableRow } from '@mui/material';
import { H3 } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useAppTranslation } from 'configs/i18n';

export const PublicInterpreterListingHeader = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.pages.homepage.interpreter',
  });
  const { isPhone } = useWindowProperties();

  return (
    <TableHead>
      {!isPhone && (
        <TableRow>
          <TableCell />
          <TableCell>
            <H3>{t('name')}</H3>
          </TableCell>
          <TableCell>
            <H3>{t('languagePairs')}</H3>
          </TableCell>
          <TableCell>
            <div className="columns space-between">
              <H3>{t('area')}</H3>
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
