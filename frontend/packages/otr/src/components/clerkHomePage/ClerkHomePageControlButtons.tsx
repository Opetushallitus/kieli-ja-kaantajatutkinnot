import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { resetClerkInterpreterFilters } from 'redux/reducers/clerkInterpreter';

export const ClerkHomePageControlButtons = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.pages.clerkHomepage.buttons',
  });
  const dispatch = useAppDispatch();

  return (
    <>
      <CustomButton
        data-testid="clerk-interpreter-registry__reset-filters-btn"
        color={Color.Secondary}
        variant={Variant.Outlined}
        onClick={() => dispatch(resetClerkInterpreterFilters())}
      >
        {t('emptySelection')}
      </CustomButton>
    </>
  );
};
