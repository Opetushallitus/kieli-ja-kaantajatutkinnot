import { TableCell, TableHead, TableRow } from '@mui/material';

import { H3 } from 'components/elements/Text';
import { ContactRequestButton } from 'components/publicTranslator/listing/ContactRequestButton';
import { useAppTranslation } from 'configs/i18n';
import { useWindowProperties } from 'hooks/useWindowProperties';

export const PublicTranslatorListingHeader = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akt.pages.translator' });
  const { isPhone } = useWindowProperties();

  return (
    <TableHead>
      {!isPhone && (
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          <TableCell>
            <H3>{t('name')}</H3>
          </TableCell>
          <TableCell>
            <H3>{t('languagePairs')}</H3>
          </TableCell>
          <TableCell>
            <div className="columns space-between">
              <H3>{t('town')}</H3>
              {!isPhone && <ContactRequestButton />}
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableHead>
  );
};
