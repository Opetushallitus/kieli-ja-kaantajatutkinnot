import { CustomButton, CustomButtonLink } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  resetClerkTranslatorFilters,
  setPaginatedPage,
} from 'redux/reducers/clerkTranslator';
import { selectFilteredSelectedIds } from 'redux/selectors/clerkTranslator';

export const ClerkHomePageControlButtons = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages.clerkHomepage.buttons',
  });
  const dispatch = useAppDispatch();
  const sendEmailButtonDisabled =
    useAppSelector(selectFilteredSelectedIds).length === 0;

  return (
    <>
      <CustomButton
        data-testid="clerk-translator-registry__reset-filters-btn"
        color={Color.Secondary}
        variant={Variant.Outlined}
        onClick={() => {
          dispatch(resetClerkTranslatorFilters());
          dispatch(setPaginatedPage(0));
        }}
      >
        {t('emptySelection')}
      </CustomButton>
      <CustomButtonLink
        data-testid="clerk-translator-registry__send-email-btn"
        to={AppRoutes.ClerkSendEmailPage}
        color={Color.Secondary}
        variant={Variant.Contained}
        disabled={sendEmailButtonDisabled}
      >
        {t('sendEmail')}
      </CustomButtonLink>
    </>
  );
};
