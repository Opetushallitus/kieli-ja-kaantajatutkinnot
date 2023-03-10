import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { CustomTextField, ExtLink, H3 } from 'shared/components';
import { Color } from 'shared/enums';

import { CertificateShipping } from 'components/publicEnrollment/steps/CertificateShipping';
import { PartialExamsSelection } from 'components/publicEnrollment/steps/PartialExamsSelection';
import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { PreviousEnrollment } from 'components/publicEnrollment/steps/PreviousEnrollment';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
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
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });

  return (
    <div className="rows gapped">
      <H3>{t('title')}</H3>
      <div className="grid-columns gapped">
        <CustomTextField label={t('email')} value={email} disabled />
        <CustomTextField
          label={t('phoneNumber')}
          value={phoneNumber}
          disabled
        />
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
  showValidation,
}: {
  enrollment: PublicEnrollment;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
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
      <PreviousEnrollment
        enrollment={enrollment}
        editingDisabled={true}
        showValidation={showValidation}
      />
      <PartialExamsSelection enrollment={enrollment} editingDisabled={true} />
      <CertificateShipping
        enrollment={enrollment}
        editingDisabled={true}
        showValidation={showValidation}
      />
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
  );
};
