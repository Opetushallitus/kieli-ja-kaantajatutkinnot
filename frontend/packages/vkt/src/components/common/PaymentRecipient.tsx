import { Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const PaymentRecipient = ({
  includeLegalBasis = true,
}: {
  includeLegalBasis?: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.paymentRecipient',
  });

  return <Text>{t(includeLegalBasis ? 'description' : 'recipient')}</Text>;
};
