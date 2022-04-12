import { CustomButton } from 'components/elements/CustomButton';
import { CustomButtonLink } from 'components/elements/CustomButtonLink';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, Color, Variant } from 'enums/app';
import { resetClerkTranslatorFilters } from 'redux/actions/clerkTranslator';
import { selectFilteredSelectedIds } from 'redux/selectors/clerkTranslator';

export const ClerkHomePageControlButtons = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.pages.clerkHomepage.buttons',
  });
  const dispatch = useAppDispatch();
  const sendEmailButtonDisabled =
    useAppSelector(selectFilteredSelectedIds).length === 0;

  return (
    <>
      <CustomButton
        color={Color.Secondary}
        variant={Variant.Outlined}
        onClick={() => dispatch(resetClerkTranslatorFilters)}
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
