import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { CustomTextField, ExtLink, H3 } from 'shared/components';
import { Color } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  DisplayContactInfo,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { updateContactRequest } from 'redux/reducers/contactRequest';
import { contactRequestSelector } from 'redux/selectors/contactRequest';

const PrivacyStatementCheckboxLabel = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm.privacyStatement',
  });

  return (
    <Trans t={t} i18nKey="label">
      <ExtLink
        className="contact-request-page__grid__privacy-statement-checkbox-label__link"
        text={t('linkLabel')}
        href={AppRoutes.PrivacyPolicyPage}
        endIcon={<OpenInNewIcon />}
        aria-label={t('ariaLabel')}
      />
    </Trans>
  );
};

export const PreviewAndSend = ({
  disableNext,
}: {
  disableNext: (disabled: boolean) => void;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm',
  });

  // Redux
  const { request } = useAppSelector(contactRequestSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    disableNext(!request?.confirmation);
  }, [disableNext, request]);

  const handleCheckboxClick = () => {
    dispatch(updateContactRequest({ confirmation: !request?.confirmation }));
  };

  const getMessageHelperText = () => {
    return `${request?.message?.length} / ${
      InputFieldUtils.defaultMaxTextAreaLength
    } ${t('characters')}`;
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
        <FormControlLabel
          control={
            <Checkbox
              onClick={handleCheckboxClick}
              color={Color.Secondary}
              data-testid="contact-request-page__privacy-statement-checkbox"
              checked={request?.confirmation}
            />
          }
          label={<PrivacyStatementCheckboxLabel />}
          className="contact-request-page__grid__privacy-statement-checkbox-label"
        />
      </div>
    </div>
  );
};
