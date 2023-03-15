import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { CustomTextField } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { getErrors, hasErrors } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

interface PreviousEnrollmentField {
  previousEnrollment?: string;
}

enum HasPrevious {
  Yes = 'yes',
  No = 'no',
}

const fields: TextField<PreviousEnrollmentField>[] = [
  {
    name: 'previousEnrollment',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 1024,
  },
];

export const PreviousEnrollment = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid?: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.previousEnrollment',
  });

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PreviousEnrollmentField>
  >([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!setValid) {
      return;
    }

    if (enrollment.hasPreviousEnrollment === undefined) {
      setValid(false);

      return;
    }

    if (enrollment.hasPreviousEnrollment === false) {
      setValid(true);

      return;
    }

    setValid(
      !hasErrors<PreviousEnrollmentField>({
        fields,
        values: enrollment,
        t: translateCommon,
      })
    );
  }, [setValid, enrollment, translateCommon]);

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<PreviousEnrollmentField>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
  });

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hasPreviousEnrollment = event.target.value == HasPrevious.Yes;
    const previousEnrollment = '';

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

  const handleBlur = () => {
    if (!dirtyFields.includes('previousEnrollment')) {
      setDirtyFields([...dirtyFields, 'previousEnrollment']);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(
      updatePublicEnrollment({
        previousEnrollment: event.target.value,
      })
    );
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped">
      <FormControl component="fieldset">
        <FormLabel component="legend" className="heading-label">
          {t('description')}
        </FormLabel>
        <RadioGroup
          name="has-previous-enrollment-group"
          value={
            enrollment.hasPreviousEnrollment ? HasPrevious.Yes : HasPrevious.No
          }
          onChange={handleRadioButtonChange}
        >
          <div className="columns">
            <FormControlLabel
              disabled={editingDisabled}
              value={HasPrevious.Yes}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={translateCommon('yes')}
              checked={enrollment.hasPreviousEnrollment}
            />
            <FormControlLabel
              disabled={editingDisabled}
              value={HasPrevious.No}
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
          onBlur={handleBlur}
          onChange={handleChange}
          error={showCustomTextFieldError('previousEnrollment')}
          helperText={errors['previousEnrollment']}
          disabled={editingDisabled}
        />
      </Collapse>
    </div>
  );
};
