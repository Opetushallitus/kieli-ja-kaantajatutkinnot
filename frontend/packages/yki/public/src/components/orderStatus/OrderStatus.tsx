import { useSearchParams } from 'react-router-dom';

import { PaymentStatus } from 'enums/api';

export const OrderStatus = ({
  onSuccess,
  onCancel,
  onDefault,
}: {
  onSuccess: () => JSX.Element;
  onCancel: () => JSX.Element;
  onDefault: () => JSX.Element;
}) => {
  const [params] = useSearchParams();
  const status = params.get('status');
  switch (status) {
    case PaymentStatus.Success:
      return onSuccess();
    case PaymentStatus.Cancel:
      return onCancel();
    default:
      return onDefault();
  }
};
