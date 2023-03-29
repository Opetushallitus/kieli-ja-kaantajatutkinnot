import { TableCell, TableHead, TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import { ContactRequestButton } from 'components/publicTranslator/listing/ContactRequestButton';
import { useAppTranslation } from 'configs/i18n';

export const PublicTranslatorListingHeader = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akr.pages.translator' });
  const { isPhone } = useWindowProperties();

  return (
    <TableHead className="heading-text">
      {!isPhone && (
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          <TableCell>{t('name')}</TableCell>
          <TableCell>{t('languagePairs')}</TableCell>
          <TableCell>
            <div className="columns space-between">
              {t('town')}
              {!isPhone && <ContactRequestButton />}
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
