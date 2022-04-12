import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  DisplayContactInfo,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { CustomTextField } from 'components/elements/CustomTextField';
import { H3 } from 'components/elements/Text';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import { Utils } from 'utils';

export const PreviewAndSend = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm',
  });
  const { request } = useAppSelector(contactRequestSelector);

  const getMessageHelperText = () => {
    return `${request?.message?.length} / ${Utils.getMaxTextAreaLength()} ${t(
      'characters'
    )}`;
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
