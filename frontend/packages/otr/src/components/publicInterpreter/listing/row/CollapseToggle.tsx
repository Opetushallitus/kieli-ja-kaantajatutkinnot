import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { CustomIconButton } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';

export const CollapseToggle = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing',
  });

  return (
    <CustomIconButton
      aria-label={t('row.ariaLabel')}
      size="small"
      aria-pressed={isOpen}
    >
      {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </CustomIconButton>
  );
};
