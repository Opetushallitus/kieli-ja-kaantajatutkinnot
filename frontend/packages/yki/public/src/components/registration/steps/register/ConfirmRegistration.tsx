import { OphLink } from '@opetushallitus/oph-design-system';
import { Trans } from 'react-i18next';
import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { PaymentServiceProvider } from 'components/elements/PaymentServiceProvider';
import { H2, Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';
import { PaymentDetails } from 'interfaces/confirmRegistration';

export const ConfirmRegistration = ({
  paymentDetails,
}: {
  paymentDetails: PaymentDetails;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'yki.component.registration.registrationFormSubmitted.proceedToPayment',
  });
  const { t: translateTerms } = usePublicTranslation({
    keyPrefix:
      'yki.component.registration.registrationDetails.termsAndConditions',
  });
  const { isPhone } = useWindowProperties();

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        <b>{t('verifyRegistrationDetails.text1')}</b>{' '}
        {t('verifyRegistrationDetails.text2')} {translateTerms('description2')}:{' '}
        <OphLink href={translateTerms('link')} target="_blank">
          {translateTerms('linkText')}
        </OphLink>
      </Text>
      <Text>
        <Trans
          t={t}
          i18nKey={'dueDateReminder.text1'}
          values={{
            dueDate: DateUtils.formatOptionalDate(paymentDetails.due_date, 'l'),
          }}
        />{' '}
        {t('dueDateReminder.text2')}
      </Text>{' '}
      <Text>
        {t('paymentLinkEmail.text1')}
        <br />
        {t('paymentLinkEmail.text2')}
      </Text>
      <Text>
        {t('payImmediately.text1')} {t('payImmediately.text2')}
      </Text>
      <div className="columns">
        <a href={paymentDetails.payment_url}>
          <CustomButton
            color={Color.Secondary}
            variant={Variant.Contained}
            fullWidth={isPhone}
          >
            {t('payImmediately.action')}
          </CustomButton>
        </a>
      </div>
      <PaymentServiceProvider />
    </div>
  );
};
