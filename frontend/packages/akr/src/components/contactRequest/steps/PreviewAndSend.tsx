import { CustomTextField, H3 } from 'shared/components';
import { InputFieldUtils } from 'shared/utils';

import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  DisplayContactInfo,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

export const PreviewAndSend = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm',
  });
  const { request } = useAppSelector(contactRequestSelector);

  const getMessageHelperText = () => {
    return `${
      request?.message?.length
    } / ${InputFieldUtils.getMaxTextAreaLength()} ${t('characters')}`;
  };

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.PreviewAndSend} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        <ChosenTranslators />
        <DisplayContactInfo />
        <H3>{t('formLabels.message')}</H3>
        <CustomTextField
          disabled
          data-testid="contact-request-page__message-text"
          defaultValue={request?.message}
          InputProps={{
            readOnly: true,
          }}
          showHelperText
          helperText={getMessageHelperText()}
          multiline
          fullWidth
        />
      </div>
    </div>
  );
};
