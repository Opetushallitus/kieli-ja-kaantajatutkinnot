import { H1 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { ExamSession } from 'interfaces/examSessions';

export const PublicRegistrationPaymentSum = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.paymentSum',
  });

  if (!examSession?.exam_fee) {
    return null;
  }

  const content = `${t('title')}: ${examSession.exam_fee}.00 €`;

  return (
    <div className="columns flex-end">
      <H1 className="margin-top-lg">{content}</H1>
    </div>
  );
};
