import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { Trans } from 'react-i18next';
import { H2, Text, WebLink } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ExamEventDetails } from 'components/publicEnrollment/steps/ExamEventDetails';
import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollmentAppointment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

const ContactDetails = ({
  enrollment,
}: {
  enrollment: PublicEnrollmentAppointment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.contactDetails',
  });
  const translateCommon = useCommonTranslation();

  return (
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      <div className="grid-3-columns gapped">
        <div className="rows">
          <Text className="bold">
            {t('email')}
            {':'}
          </Text>
          <Text data-testid="enrollment-preview-email">{enrollment.email}</Text>
        </div>
        <div className="rows">
          <Text className="bold">
            {t('phoneNumber')}
            {':'}
          </Text>
          <Text data-testid="enrollment-preview-phoneNumber">
            {enrollment.phoneNumber}
          </Text>
        </div>
        <div className="rows">
          <Text className="bold">
            {translateCommon('enrollment.certificateShipping.addressTitle')}
            {':'}
          </Text>
          <Text data-testid="enrollment-preview-certificate-shipping-details">
            {enrollment.street}
            {', '}
            {enrollment.postalCode}
            {', '}
            {enrollment.town}
            {', '}
            {enrollment.country}
          </Text>
        </div>
      </div>
    </div>
  );
};

const PrivacyStatementCheckboxLabel = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.privacyStatement',
  });
  const translateCommon = useCommonTranslation();

  return (
    <Trans t={t} i18nKey={'paidEnrollmentLabel'}>
      <WebLink
        href={translateCommon('vktPrivacyPolicy.link')}
        label={t('linkLabel')}
        endIcon={<OpenInNewIcon />}
      />
    </Trans>
  );
};

export const Preview = ({
  enrollment,
  isLoading,
}: {
  enrollment: PublicEnrollmentAppointment;
  isLoading: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  const { paymentLoadingStatus } = useAppSelector(publicEnrollmentSelector);

  const dispatch = useAppDispatch();

  const handleCheckboxClick = () => {
    dispatch(
      updatePublicEnrollment({
        privacyStatementConfirmation: !enrollment.privacyStatementConfirmation,
      }),
    );
  };

  const hasPrivacyStatementError = !enrollment.privacyStatementConfirmation;

  return (
    <div className="margin-top-xxl rows gapped-xxl">
      <PersonDetails isPreviewStep={true} />
      <ContactDetails enrollment={enrollment} />
      <Divider />
      <ExamEventDetails enrollment={enrollment} />
      <Divider />
      <div className="rows gapped-sm">
        <H2>{translateCommon('acceptTerms')}</H2>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                onClick={handleCheckboxClick}
                color={Color.Secondary}
                checked={enrollment.privacyStatementConfirmation}
                disabled={
                  isLoading ||
                  paymentLoadingStatus === APIResponseStatus.InProgress
                }
              />
            }
            label={<PrivacyStatementCheckboxLabel />}
            className={`public-enrollment__grid__preview__privacy-statement-checkbox-label ${
              hasPrivacyStatementError && 'checkbox-error'
            }`}
          />
          {hasPrivacyStatementError && (
            <FormHelperText
              id="has-privacy-statement-error"
              error={hasPrivacyStatementError}
            >
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </div>
      </div>
    </div>
  );
};
