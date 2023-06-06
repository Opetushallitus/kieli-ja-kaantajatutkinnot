import { useState } from 'react';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const Authenticate = ({
  isLoading,
  selectedExamEvent,
}: {
  isLoading: boolean;
  selectedExamEvent: PublicExamEvent;
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });

  return (
    <div className="margin-top-xxl gapped rows">
      <H3>{t('title')}</H3>
      <div className="columns">
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            className="public-enrollment__grid__form-container__auth-button"
            href={APIEndpoints.PublicAuthLogin.replace(
              ':examEventId',
              selectedExamEvent.id.toString()
            ).replace(
              ':type',
              ExamEventUtils.isEnrollingToQueue(selectedExamEvent)
                ? 'queue'
                : 'reservation'
            )}
            variant={Variant.Contained}
            onClick={() => setIsRedirecting(true)}
            color={Color.Secondary}
            data-testid="public-enrollment__authenticate-button"
            disabled={isLoading || isRedirecting}
          >
            {t('buttonText')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </div>
  );
};
