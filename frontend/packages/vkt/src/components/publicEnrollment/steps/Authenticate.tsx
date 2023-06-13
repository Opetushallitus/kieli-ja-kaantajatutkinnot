import { useState } from 'react';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const Authenticate = ({
  selectedExamEvent,
}: {
  selectedExamEvent: PublicExamEvent;
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });
  const translateCommon = useCommonTranslation();

  const onClick = () => {
    setIsRedirecting(true);

    window.location.href = APIEndpoints.PublicAuthLogin.replace(
      ':examEventId',
      selectedExamEvent.id.toString()
    ).replace(
      ':type',
      ExamEventUtils.hasOpenings(selectedExamEvent) ? 'reservation' : 'queue'
    );
  };

  return (
    <div className="margin-top-xxl gapped rows">
      <H3>{t('title')}</H3>
      <div className="columns">
        <LoadingProgressIndicator
          translateCommon={translateCommon}
          isLoading={isRedirecting}
        >
          <CustomButton
            className="public-enrollment__grid__form-container__auth-button"
            variant={Variant.Contained}
            onClick={onClick}
            color={Color.Secondary}
            data-testid="public-enrollment__authenticate-button"
            disabled={isRedirecting}
          >
            {t('buttonText')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </div>
  );
};
