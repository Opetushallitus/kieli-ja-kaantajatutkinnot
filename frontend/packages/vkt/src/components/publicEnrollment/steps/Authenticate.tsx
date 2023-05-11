import { useParams } from 'react-router-dom';
import { CustomButton, H3, LoadingProgressIndicator } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';

export const Authenticate = ({
  isLoading,
  isExpectedToHaveOpenings,
}: {
  isLoading: boolean;
  isExpectedToHaveOpenings: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.authenticate',
  });
  const params = useParams();

  return (
    <div className="margin-top-xxl gapped rows">
      <H3>{t('title')}</H3>
      <div className="columns">
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            className="public-enrollment__grid__form-container__auth-button"
            href={APIEndpoints.PublicAuthLogin.replace(
              ':examEventId',
              +params.examEventId
            ).replace(
              ':type',
              isExpectedToHaveOpenings ? 'reservation' : 'queue'
            )}
            variant={Variant.Contained}
            onClick={() => setIsLoading(true)}
            color={Color.Secondary}
            data-testid="public-enrollment__authenticate-button"
            disabled={isLoading}
          >
            {t('buttonText')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </div>
  );
};
