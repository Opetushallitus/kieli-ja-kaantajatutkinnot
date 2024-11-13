import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { Trans } from 'react-i18next';
import { H2, WebLink } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ExamEventDetails } from 'components/publicEnrollment/steps/ExamEventDetails';
import { PersonDetails } from 'components/publicEnrollmentAppointment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollmentAppointment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';

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
  showValidation,
}: {
  enrollment: PublicEnrollmentAppointment;
  isLoading: boolean;
  showValidation: boolean;
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

  const hasPrivacyStatementError =
    showValidation && !enrollment.privacyStatementConfirmation;

  return (
    <div className="margin-top-xxl rows gapped-xxl">
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
