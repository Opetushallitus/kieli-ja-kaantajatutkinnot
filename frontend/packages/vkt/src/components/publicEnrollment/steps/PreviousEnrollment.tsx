import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { CustomTextField } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { getErrors } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

interface PreviousEnrollmentField {
  previousEnrollment?: string;
}

const fields: TextField<PreviousEnrollmentField>[] = [
  {
    name: 'previousEnrollment',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 255,
  },
];

export const PreviousEnrollment = ({
  enrollment,
  editingDisabled,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.previousEnrollment',
  });

  const yes = 'yes';
  const no = 'no';
  const dispatch = useAppDispatch();

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<PreviousEnrollmentField>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
  });

  const errors = showValidation
    ? getErrors(fields, enrollment, translateCommon)
    : fieldError;

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hasPreviousEnrollment = event.target.value == yes;
    const previousEnrollment = '';
    setFieldError(getEmptyErrorState(fields));

    dispatch(
      updatePublicEnrollment({
        hasPreviousEnrollment,
        previousEnrollment,
      })
    );
  };

  const hasRadioButtonError =
    showValidation && enrollment.hasPreviousEnrollment === undefined;

  const showCustomTextFieldError = (
    fieldName: keyof PreviousEnrollmentField
  ) => {
    return !!errors[fieldName];
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const error = getErrors(fields, enrollment, translateCommon);

    setFieldError(error);

    dispatch(
      updatePublicEnrollment({
        previousEnrollment: event.target.value,
      })
    );
  };

  const getError = () =>
    InputFieldUtils.inspectCustomTextFieldErrors(
      TextFieldTypes.Text,
      enrollment.previousEnrollment,
      true
    );

  const hasError = showValidation ? !!getError() : fieldError;

  const handleErrors = (hasPreviousEnrollment: boolean) => {
    if (!hasPreviousEnrollment) {
      return false;
    }

    const error = getError();

    setFieldError(!!error);
  };

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hasPreviousEnrollment = event.target.value == yes;

    handleErrors(hasPreviousEnrollment);

    dispatch(updatePublicEnrollment({ hasPreviousEnrollment }));
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped">
      <FormControl component="fieldset">
        <FormLabel component="legend" className="heading-label">
          {t('description')}
        </FormLabel>
        <RadioGroup
          name="has-previous-enrollment-group"
          value={enrollment.hasPreviousEnrollment ? yes : no}
          onChange={handleRadioButtonChange}
        >
          <div className="columns">
            <FormControlLabel
              disabled={editingDisabled}
              value={yes}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={translateCommon('yes')}
              checked={enrollment.hasPreviousEnrollment}
            />
            <FormControlLabel
              disabled={editingDisabled}
              value={no}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={translateCommon('no')}
              checked={enrollment.hasPreviousEnrollment === false}
            />
          </div>
        </RadioGroup>
        {hasRadioButtonError && (
          <FormHelperText
            id="has-previous-enrollment-error"
            error={hasRadioButtonError}
          >
            {translateCommon('errors.customTextField.required')}
          </FormHelperText>
        )}
      </FormControl>
      <Collapse orientation="vertical" in={enrollment.hasPreviousEnrollment}>
        <FormLabel className="heading-label gapped-sm">
          {t('whenPrevious')}
        </FormLabel>
        <CustomTextField
          className="margin-top-sm public-enrollment__grid__previous-enrollment__input"
          label={t('label')}
          value={enrollment.previousEnrollment || ''}
          onBlur={handleChange}
          onChange={handleChange}
          error={showCustomTextFieldError('previousEnrollment')}
          helperText={errors['previousEnrollment']}
          disabled={editingDisabled}
        />
      </Collapse>
    </div>
  );
};
