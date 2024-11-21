import { ChangeEvent, useEffect, useState } from 'react';
import { AnyAction } from 'redux';
import { H2, LabeledTextField } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { getErrors, hasErrors } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';

interface MessageField {
  message?: string;
}

const fields: TextField<MessageField>[] = [
  {
    name: 'message',
    required: true,
    type: TextFieldTypes.Text,
    maxLength: 10240,
  },
];

export const Message = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
  updatePublicEnrollment,
}: {
  enrollment: PublicEnrollmentContact;
  editingDisabled: boolean;
  setValid: (isValid: boolean) => void;
  showValidation: boolean;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentContact>,
  ) => AnyAction;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact.steps.selectExam.message',
  });

  const [dirtyFields, setDirtyFields] = useState<Array<keyof MessageField>>([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (enrollment.hasPreviousEnrollment === undefined) {
      setValid(false);

      return;
    }

    if (enrollment.hasPreviousEnrollment === false) {
      setValid(true);

      return;
    }

    setValid(
      !hasErrors<MessageField>({
        fields,
        values: enrollment,
        t: translateCommon,
      }),
    );
  }, [setValid, enrollment, translateCommon]);

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<MessageField>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
  });

  const showCustomTextFieldError = (fieldName: keyof MessageField) => {
    return !!errors[fieldName];
  };

  const handleTextFieldBlur = () => {
    if (!dirtyFields.includes('message')) {
      setDirtyFields([...dirtyFields, 'message']);
    }
  };

  const handleTextFieldChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(
      updatePublicEnrollment({
        message: event.target.value,
      }),
    );
  };

  return (
    <>
      <div className="margin-top-sm rows gapped">
        <H2>{t('title')}</H2>
      </div>
      <div className="public-enrollment__grid__previous-enrollment--good-and-satisfactory-level rows gapped">
        <div className="margin-top-sm grow full-max-width">
          <LabeledTextField
            className="public-enrollment__grid__previous-enrollment--good-and-satisfactory-level__textField"
            id="public-enrollment__previous-enrollment__textField"
            label={t('textField.label')}
            placeholder={t('textField.placeholder')}
            value={enrollment.message}
            onBlur={handleTextFieldBlur}
            onChange={handleTextFieldChange}
            error={showCustomTextFieldError('message')}
            helperText={errors['message']}
            disabled={editingDisabled}
            fullWidth
            multiline
          />
        </div>
      </div>
    </>
  );
};
