import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect } from 'react';
import { AnyAction } from 'redux';
import { H2, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollmentCommon } from 'interfaces/publicEnrollment';

enum PreviouslyEnrolled {
  Yes = 'yes',
  No = 'no',
}

export const PreviousEnrollment = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
  updatePublicEnrollment,
}: {
  enrollment: PublicEnrollmentCommon;
  editingDisabled: boolean;
  setValid: (isValid: boolean) => void;
  showValidation: boolean;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentCommon>,
  ) => AnyAction;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.selectExam.previousEnrollment',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    setValid(enrollment.hasPreviousEnrollment !== undefined);
  }, [setValid, enrollment, translateCommon]);

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const hasPreviousEnrollment = event.target.value === PreviouslyEnrolled.Yes;

    dispatch(
      updatePublicEnrollment({
        hasPreviousEnrollment,
      }),
    );
  };

  const hasRadioButtonError =
    showValidation && enrollment.hasPreviousEnrollment === undefined;

  return (
    <div className="rows gapped">
      <div className="public-enrollment-contact__grid__phone-extra-margin margin-top-sm rows gapped">
        <H2>{t('title')}</H2>
        <Text>{t('part1')}</Text>
      </div>
      <div className="public-enrollment-contact__grid__phone-extra-margin rows gapped">
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            className="heading-label margin-bottom-sm"
          >
            {t('radioButtons.label')}
          </FormLabel>
          <RadioGroup
            className="margin-top-sm"
            name="has-previous-enrollment-group"
            value={
              enrollment.hasPreviousEnrollment
                ? PreviouslyEnrolled.Yes
                : PreviouslyEnrolled.No
            }
            onChange={handleRadioButtonChange}
          >
            <FormControlLabel
              disabled={editingDisabled}
              data-testid="enrollment-checkbox-previously-enrolled-no"
              value={PreviouslyEnrolled.No}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={t('hasPreviousEnrollment.no')}
              checked={enrollment.hasPreviousEnrollment === false}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
            <FormControlLabel
              disabled={editingDisabled}
              data-testid="enrollment-checkbox-previously-enrolled-yes"
              value={PreviouslyEnrolled.Yes}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={t('hasPreviousEnrollment.yes')}
              checked={enrollment.hasPreviousEnrollment}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
          </RadioGroup>
          {hasRadioButtonError && (
            <FormHelperText id="has-previous-enrollment-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </FormControl>
      </div>
    </div>
  );
};
