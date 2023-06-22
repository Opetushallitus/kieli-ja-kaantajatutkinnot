import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { ExtLink, H2, Text } from 'shared/components';
import { Color } from 'shared/enums';

import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

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
      <div className="grid-columns gapped">
        <div className="rows">
          <Text className="bold">
            {t('email')}
            {':'}
          </Text>
          <Text>{email}</Text>
        </div>
        <div className="rows">
          <Text className="bold">
            {t('phoneNumber')}
            {':'}
          </Text>
          <Text>{phoneNumber}</Text>
        </div>
      </div>
    </div>
  );
};

const ExamEventDetails = ({ enrollment }: { enrollment: PublicEnrollment }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.examEventDetails',
  });
  const translateCommon = useCommonTranslation();

  const translateIfSelected = (skill: keyof PartialExamsAndSkills) => {
    return enrollment[skill]
      ? translateCommon(`enrollment.partialExamsAndSkills.${skill}`)
      : undefined;
  };

  const skills = [
    translateIfSelected('textualSkill'),
    translateIfSelected('oralSkill'),
    translateIfSelected('understandingSkill'),
  ].filter((s) => !!s);

  const partialExams = [
    translateIfSelected('writingPartialExam'),
    translateIfSelected('readingComprehensionPartialExam'),
    translateIfSelected('speakingPartialExam'),
    translateIfSelected('speechComprehensionPartialExam'),
  ].filter((s) => !!s);

  const displayBulletList = (label: string, items: Array<string>) => (
    <div className="rows gapped-xxs">
      <Text className="bold">
        {label}
        {':'}
      </Text>
      <ul className="public-enrollment__grid__preview__bullet-list">
        {items.map((item, i) => (
          <Text key={i}>
            <li>{item}</li>
          </Text>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="rows gapped">
      <H2>{t('title')}</H2>
      {displayBulletList(t('selectedSkillsLabel'), skills)}
      {displayBulletList(t('selectedPartialExamsLabel'), partialExams)}
      <div className="rows gapped-xxs">
        <Text className="bold">
          {t('previousEnrollmentLabel')}
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
    <div className="rows gapped">
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
        <Text>
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
      <ExtLink
        className="public-enrollment__grid__preview__privacy-statement-checkbox-label__link"
        text={t('linkLabel')}
        href={AppRoutes.PrivacyPolicyPage}
        endIcon={<OpenInNewIcon />}
        aria-label={t('ariaLabel')}
      />
    </Trans>
  );
};

export const Preview = ({
  enrollment,
  isLoading,
  setIsStepValid,
}: {
  enrollment: PublicEnrollment;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
}) => {
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    setIsStepValid(enrollment.privacyStatementConfirmation);
  }, [setIsStepValid, enrollment]);

  const dispatch = useAppDispatch();

  const handleCheckboxClick = () => {
    dispatch(
      updatePublicEnrollment({
        privacyStatementConfirmation: !enrollment.privacyStatementConfirmation,
      })
    );
  };

  return (
    <div className="margin-top-xxl rows gapped-xxl">
      <PersonDetails />
      <ContactDetails
        email={enrollment.email}
        phoneNumber={enrollment.phoneNumber}
      />
      <ExamEventDetails enrollment={enrollment} />
      <CertificateShippingDetails enrollment={enrollment} />
      <div className="rows gapped">
        <H2>{translateCommon('acceptTerms')}</H2>
        <FormControlLabel
          control={
            <Checkbox
              onClick={handleCheckboxClick}
              color={Color.Secondary}
              checked={enrollment.privacyStatementConfirmation}
              disabled={isLoading}
            />
          }
          label={<PrivacyStatementCheckboxLabel />}
          className="public-enrollment__grid__preview__privacy-statement-checkbox-label"
        />
      </div>
    </div>
  );
};
