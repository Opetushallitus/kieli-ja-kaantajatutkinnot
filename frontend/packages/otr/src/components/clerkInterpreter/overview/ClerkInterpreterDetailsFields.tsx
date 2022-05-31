import { ChangeEvent, useState } from 'react';
import { CustomTextField, H3 } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { translateOutsideComponent, useAppTranslation } from 'configs/i18n';
import { ClerkInterpreterTextFieldEnum } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { ClerkInterpreterTextFieldProps } from 'interfaces/clerkInterpreterTextFieldProps';

const getTextFieldType = (field: ClerkInterpreterTextFieldEnum) => {
  switch (field) {
    case ClerkInterpreterTextFieldEnum.PhoneNumber:
      return TextFieldTypes.PhoneNumber;
    case ClerkInterpreterTextFieldEnum.Email:
      return TextFieldTypes.Email;
    case ClerkInterpreterTextFieldEnum.ExtraInformation:
      return TextFieldTypes.Textarea;
    case ClerkInterpreterTextFieldEnum.IdentityNumber:
      return TextFieldTypes.PersonalIdentityCode;
    default:
      return TextFieldTypes.Text;
  }
};

const getFieldError = (
  interpreter: ClerkInterpreter | undefined,
  field: ClerkInterpreterTextFieldEnum
) => {
  const t = translateOutsideComponent();
  const type = getTextFieldType(field);
  const value = (interpreter && interpreter[field]) || '';
  const required =
    field == ClerkInterpreterTextFieldEnum.FirstName ||
    field == ClerkInterpreterTextFieldEnum.LastName;

  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    type,
    value,
    required
  );

  return error ? t(`otr.${error}`) : '';
};

const ClerkInterpreterDetailsTextField = ({
  interpreter,
  field,
  onChange,
  displayError,
  ...rest
}: ClerkInterpreterTextFieldProps) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix:
      'otr.component.clerkInterpreterOverview.interpreterDetails.fields',
  });
  const fieldError = getFieldError(interpreter, field);

  return (
    <CustomTextField
      value={interpreter ? interpreter[field] : undefined}
      label={t(field)}
      onChange={onChange}
      type={getTextFieldType(field)}
      error={displayError && fieldError?.length > 0}
      helperText={fieldError}
      {...rest}
    />
  );
};

export const ClerkInterpreterDetailsFields = ({
  interpreter,
  onFieldChange,
  editDisabled,
  topControlButtons,
  displayFieldErrorBeforeChange,
}: {
  interpreter?: ClerkInterpreter;
  onFieldChange: (
    field: keyof ClerkInterpreter
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  editDisabled: boolean;
  topControlButtons?: JSX.Element;
  displayFieldErrorBeforeChange: boolean;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.interpreterDetails',
  });
  const initialErrors = Object.values(ClerkInterpreterTextFieldEnum).reduce(
    (acc, val) => {
      return { ...acc, [val]: displayFieldErrorBeforeChange };
    },
    {}
  ) as Record<ClerkInterpreterTextFieldEnum, boolean>;

  const [displayFieldError, setDisplayFieldError] = useState(initialErrors);
  const displayFieldErrorOnBlur =
    (field: ClerkInterpreterTextFieldEnum) => () => {
      setDisplayFieldError({ ...displayFieldError, [field]: true });
    };

  const getCommonTextFieldProps = (field: ClerkInterpreterTextFieldEnum) => ({
    field,
    interpreter,
    disabled: editDisabled,
    onChange: onFieldChange(field),
    onBlur: displayFieldErrorOnBlur(field),
    displayError: displayFieldError[field],
    'data-testid': `clerk-interpreter__basic-information__${field}`,
  });

  return (
    <>
      <div className="columns margin-top-lg">
        <div className="columns margin-top-lg grow">
          <H3>{t('header.personalInformation')}</H3>
        </div>
        {topControlButtons}
      </div>
      <div className="grid-columns gapped">
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.LastName)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.FirstName)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(
            ClerkInterpreterTextFieldEnum.IdentityNumber
          )}
        />
      </div>
      <H3>{t('header.address')}</H3>
      <div className="grid-columns gapped">
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Street)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.PostalCode)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Town)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Country)}
        />
      </div>
      <H3>{t('header.contactInformation')}</H3>
      <div className="grid-columns gapped">
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(ClerkInterpreterTextFieldEnum.Email)}
        />
        <ClerkInterpreterDetailsTextField
          {...getCommonTextFieldProps(
            ClerkInterpreterTextFieldEnum.PhoneNumber
          )}
        />
      </div>
      <H3>{t('header.extraInformation')}</H3>
      <ClerkInterpreterDetailsTextField
        {...getCommonTextFieldProps(
          ClerkInterpreterTextFieldEnum.ExtraInformation
        )}
        multiline
        fullWidth
      />
    </>
  );
};
