import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H2, Text, WebLink } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicFreeEnrollmentBasis } from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ENROLLMENT_SKILL_PRICE } from 'utils/publicEnrollment';

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
      <div className="grid-2-columns gapped">
        <div className="rows">
          <Text>
            {t(
              `fillContactDetails.educationDetails.type.${freeEnrollmentBasis.type}`,
            )}
          </Text>
        </div>
        {freeEnrollmentBasis.attachments && (
          <>
            <Text className="bold">
              {t('preview.educationDetails.attachments')}
            </Text>
            {freeEnrollmentBasis.attachments.map((attachment) => (
              <div key={`attachment-${attachment.id}`} className="rows">
                <Text>{attachment.name}</Text>
              </div>
            ))}
          </>
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

const ExamEventDetails = ({ enrollment }: { enrollment: PublicEnrollment }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview',
  });
  const translateCommon = useCommonTranslation();
  const { freeEnrollmentDetails } = useAppSelector(publicEnrollmentSelector);

  const skills = ['textualSkill', 'oralSkill'].filter(
    (skill) => !!enrollment[skill as keyof PartialExamsAndSkills],
  );

  const partialExams = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof PartialExamsAndSkills]);

  const getFreeEnrollmentsLeft = (skill: string) => {
    if (!freeEnrollmentDetails) {
      return '';
    }

    switch (skill) {
      case 'textualSkill':
        return freeEnrollmentDetails.freeTextualSkillLeft;
      case 'oralSkill':
        return freeEnrollmentDetails.freeOralSkillLeft;
      default:
        return '';
    }
  };

  const getEnrollmentSkillPrice = (skill: string) => {
    if (!freeEnrollmentDetails) {
      return ENROLLMENT_SKILL_PRICE;
    }

    switch (skill) {
      case 'textualSkill':
        return freeEnrollmentDetails.freeTextualSkillLeft > 0
          ? 0
          : ENROLLMENT_SKILL_PRICE;
      case 'oralSkill':
        return freeEnrollmentDetails.freeOralSkillLeft > 0
          ? 0
          : ENROLLMENT_SKILL_PRICE;
      default:
        return ENROLLMENT_SKILL_PRICE;
    }
  };

  const hasFreeEnrollments =
    freeEnrollmentDetails &&
    enrollment.freeEnrollmentBasis &&
    (freeEnrollmentDetails.freeTextualSkillLeft > 0 ||
      freeEnrollmentDetails.freeOralSkillLeft > 0);

  const displaySkillsList = () => (
    <div className="rows gapped-xxs">
      <div className="grid-3-columns gapped">
        <Text className="bold">
          {t('examEventDetails.selectedPartialExamsLabel')}
        </Text>
        {hasFreeEnrollments && (
          <Text className="bold">
            {t('educationDetails.freeEnrollmentsLeft')}
          </Text>
        )}
        <Text className="bold">{t('educationDetails.price')}</Text>
      </div>
      {skills.map((skill, i) => (
        <div key={i} className="grid-3-columns gapped">
          <Text>
            {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
          </Text>
          {enrollment.isFree && (
            <Text>{getFreeEnrollmentsLeft(skill)} / 3</Text>
          )}
          <Text>{getEnrollmentSkillPrice(skill)}&euro;</Text>
        </div>
      ))}
    </div>
  );

  const displayExamsList = () => (
    <div className="rows gapped-xxs">
      <Text className="bold">
        {t('examEventDetails.selectedSkillsLabel')}
        {':'}
      </Text>
      <ul className="public-enrollment__grid__preview__bullet-list">
        {partialExams.map((skill, i) => (
          <Text key={i}>
            <li>
              {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
            </li>
          </Text>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="rows gapped">
      <H2>{t('examEventDetails.title')}</H2>
      {displaySkillsList()}
      {displayExamsList()}
      <div className="rows gapped-xxs">
        <Text className="bold">
          {t('examEventDetails.previousEnrollmentLabel')}
          {':'}
        </Text>
        <Text>
          {enrollment.hasPreviousEnrollment
            ? `${translateCommon('yes')}: ${enrollment.previousEnrollment}`
            : translateCommon('no')}
        </Text>
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

const PrivacyStatementCheckboxLabel = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.privacyStatement',
  });

  return (
    <Trans t={t} i18nKey="label">
      <WebLink
        href={AppRoutes.PrivacyPolicyPage}
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
        {enrollment.freeEnrollmentBasis && (
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
