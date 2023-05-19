import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { ExtLink, H2, Text } from 'shared/components';
import { Color } from 'shared/enums';

import {
  ChosenTranslators,
  ChosenTranslatorsHeading,
  DisplayContactInfo,
  StepHeading,
} from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
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
    keyPrefix: 'akr.component.contactRequestForm.previewAndSend',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const { request } = useAppSelector(contactRequestSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    disableNext(!request?.confirmation);
  }, [disableNext, request]);

  const handleCheckboxClick = () => {
    dispatch(updateContactRequest({ confirmation: !request?.confirmation }));
  };

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.PreviewAndSend} />
      <div className="rows gapped-xxl">
        <div className="rows gapped-xs">
          <ChosenTranslatorsHeading />
          <ChosenTranslators />
        </div>
        <DisplayContactInfo />
        <div className="rows gapped-xs">
          <H2>{t('yourMessage')}</H2>
          <Text className="contact-request-page__grid__preview-and-send__message">
            {request?.message}
          </Text>
        </div>
        <div className="rows gapped-xs">
          <H2>{translateCommon('acceptTerms')}</H2>
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
    </div>
  );
};
