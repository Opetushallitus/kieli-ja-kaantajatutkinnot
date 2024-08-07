import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H2, Text, WebLink } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ExamEventDetails } from 'components/publicEnrollment/steps/ExamEventDetails';
import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicFreeEnrollmentBasis } from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

const EducationDetails = ({
  freeEnrollmentBasis,
}: {
  freeEnrollmentBasis: PublicFreeEnrollmentBasis;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps',
  });

  return (
    <div className="rows gapped">
      <H2>{t('preview.educationDetails.title')}</H2>
      <Text>{t('preview.educationDetails.description')}</Text>
      <div className="rows gapped">
        <div className="rows">
          <ul>
            <li>
              <Text>
                {t(
                  `fillContactDetails.educationDetails.type.${freeEnrollmentBasis.type}`,
                )}
              </Text>
            </li>
          </ul>
        </div>
        {freeEnrollmentBasis.attachments && (
          <div className="rows">
            <Text className="bold">
              {t('educationDetails.attachmentsCheck')}
            </Text>
            <ul>
              {freeEnrollmentBasis.attachments.map((attachment) => (
                <li key={`attachment-${attachment.id}`}>
                  <Text>{attachment.name}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ContactDetails = ({
  email,
  phoneNumber,
}: {
  email: string;
  phoneNumber: string;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.contactDetails',
  });

  return (
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      <div className="grid-2-columns gapped">
        <div className="rows">
          <Text className="bold">
            {t('email')}
            {':'}
          </Text>
          <Text data-testid="enrollment-preview-email">{email}</Text>
        </div>
        <div className="rows">
          <Text className="bold">
            {t('phoneNumber')}
            {':'}
          </Text>
          <Text data-testid="enrollment-preview-phoneNumber">
            {phoneNumber}
          </Text>
        </div>
      </div>
    </div>
  );
};

const CertificateShippingDetails = ({
  enrollment,
}: {
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.preview.certificateShippingDetails',
  });
  const translateCommon = useCommonTranslation();

  const digitalConsentEnabled = false;

  return (
    <div className="rows gapped-sm">
      <H2>{t('title')}</H2>
      {digitalConsentEnabled && (
        <div className="rows gapped-xxs">
          <Text className="bold">
            {translateCommon('enrollment.certificateShipping.consent')}
            {':'}
          </Text>
          <Text>
            {enrollment.digitalCertificateConsent
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        </div>
      )}
      <div className="rows gapped-xxs">
        <Text className="bold">
          {t('addressLabel')}
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
  );
};

const PrivacyStatementCheckboxLabel = ({
  enrollment,
}: {
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.privacyStatement',
  });
  const translateCommon = useCommonTranslation();

  return (
    <Trans
      t={t}
      i18nKey={
        enrollment.isFree ? 'freeEnrollmentLabel' : 'paidEnrollmentLabel'
      }
    >
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
  setIsStepValid,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  const { paymentLoadingStatus } = useAppSelector(publicEnrollmentSelector);

  useEffect(() => {
    setIsStepValid(enrollment.privacyStatementConfirmation);
  }, [setIsStepValid, enrollment]);

  const dispatch = useAppDispatch();

  const handleCheckboxClick = () => {
    dispatch(
      updatePublicEnrollment({
        privacyStatementConfirmation: !enrollment.privacyStatementConfirmation,
      }),
    );
  };

  const hasPrivacyStatementError =
    showValidation && !enrollment.privacyStatementConfirmation;

  return (
    <div className="margin-top-xxl rows gapped-xxl">
      <div className="rows gapped-xxl public-enrollment__grid__contact-details">
        <PersonDetails />
        <ContactDetails
          email={enrollment.email}
          phoneNumber={enrollment.phoneNumber}
        />
        {EnrollmentUtils.hasFreeBasis(enrollment) &&
          enrollment.freeEnrollmentBasis && (
            <EducationDetails
              freeEnrollmentBasis={enrollment.freeEnrollmentBasis}
            />
          )}
      </div>
      <ExamEventDetails enrollment={enrollment} />
      <CertificateShippingDetails enrollment={enrollment} />
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
            label={<PrivacyStatementCheckboxLabel enrollment={enrollment} />}
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
