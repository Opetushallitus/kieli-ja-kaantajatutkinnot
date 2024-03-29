import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { CommonUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicUIViews } from 'enums/app';
import { setPublicUIView } from 'redux/reducers/publicUIView';
import { publicTranslatorsSelector } from 'redux/selectors/publicTranslator';

export const ContactRequestButton = () => {
  const { selectedTranslators } = useAppSelector(publicTranslatorsSelector);
  const { t } = useAppTranslation({ keyPrefix: 'akr.pages.homepage' });
  const dispatch = useAppDispatch();

  const handleButtonClick = () => {
    dispatch(setPublicUIView(PublicUIViews.ContactRequest));
    CommonUtils.scrollToTop();
  };

  return (
    <CustomButton
      color={Color.Secondary}
      variant={Variant.Contained}
      onClick={handleButtonClick}
      disabled={selectedTranslators.length == 0}
      data-testid="public-translators__contact-request-btn"
      aria-label={t('requestContactAriaLabel')}
    >
      {t('requestContact')}
    </CustomButton>
  );
};
