import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H2, Text, WebLink } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ExamEventDetails } from 'components/publicEnrollmentAppointment/steps/ExamEventDetails';
import { PersonDetails } from 'components/publicEnrollmentAppointment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollmentAppointment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

const PrivacyStatementCheckboxLabel = () => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentAppointment.steps.preview.privacyStatement',
  });
  const translateCommon = useCommonTranslation();

  return (
    <Trans t={t} i18nKey={'label'}>
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
  showValidation,
  setIsStepValid,
}: {
  enrollment: PublicEnrollmentAppointment;
  isLoading: boolean;
  showValidation: boolean;
  setIsStepValid: (isValid: boolean) => void;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.steps.preview',
  });

  const { paymentLoadingStatus } = useAppSelector(publicEnrollmentSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsStepValid(enrollment.privacyStatementConfirmation);
  }, [setIsStepValid, enrollment.privacyStatementConfirmation]);

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
      <Text>{t('description')}</Text>
      <PersonDetails showContactDetails={true} />
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
            className={hasPrivacyStatementError ? 'checkbox-error' : undefined}
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
