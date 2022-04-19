import { H3 } from 'components/elements/Text';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { contactRequestSelector } from 'redux/selectors/contactRequest';
import { TextBox } from 'components/elements/TextBox';
import {
  StepHeading,
  stepsByIndex,
  ChosenTranslatorsHeading,
  RenderChosenTranslators,
  DisplayContactInfo,
} from 'components/contactRequest/ContactRequestFormUtils';

export const PreviewAndSend = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.contactRequestForm.formLabels',
  });
  const { request } = useAppSelector(contactRequestSelector);

  return (
    <div className="rows">
      <StepHeading step={stepsByIndex[3]} />
      <div className="rows gapped">
        <ChosenTranslatorsHeading />
        <RenderChosenTranslators />
        <DisplayContactInfo />
        <H3>{t('message')}</H3>
        <TextBox
          data-testid="contact-request-page__message-text"
          variant="standard"
          defaultValue={request?.message}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
          }}
          multiline
          fullWidth
          rows={5}
        />
      </div>
    </div>
  );
};
