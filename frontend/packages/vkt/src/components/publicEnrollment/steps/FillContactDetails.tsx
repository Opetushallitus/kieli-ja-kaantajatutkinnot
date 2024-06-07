import { ChangeEvent, useEffect, useState } from 'react';
import { CustomButton, H2, LabeledTextField, Text } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  InputAutoComplete,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { TextField } from 'shared/interfaces';
import { FieldErrors, getErrors, hasErrors } from 'shared/utils';

import { PersonDetails } from 'components/publicEnrollment/steps/PersonDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  PublicEnrollment,
  PublicEnrollmentContactDetails,
} from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import {
  loadUploadPostPolicy,
  startFileUpload,
} from 'redux/reducers/publicFileUpload';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';

const fields: Array<TextField<PublicEnrollmentContactDetails>> = [
  {
    name: 'email',
    required: true,
    type: TextFieldTypes.Email,
    maxLength: 255,
  },
  {
    name: 'emailConfirmation',
    required: true,
    type: TextFieldTypes.Email,
    maxLength: 255,
  },
  {
    name: 'phoneNumber',
    required: true,
    type: TextFieldTypes.PhoneNumber,
    maxLength: 255,
  },
];

const emailsMatch = (
  t: (key: string) => string,
  errors: FieldErrors<PublicEnrollmentContactDetails>,
  values: PublicEnrollmentContactDetails,
  dirtyFields?: Array<keyof PublicEnrollmentContactDetails>,
) => {
  if (
    values.email !== values.emailConfirmation &&
    (!dirtyFields || dirtyFields.includes('emailConfirmation'))
  ) {
    return {
      ...errors,
      ['emailConfirmation']:
        errors['emailConfirmation'] ?? t('mismatchingEmailsError'),
    };
  }

  return errors;
};

const FileUpload = () => {
  // TODO Implement first as plain old form submit
  // TODO Then change implementation to go through redux store
  // and send form data with axios in a saga
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | null>(null);
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  const onUpload = () => {
    if (file) {
      // eslint-disable-next-line no-console
      console.log('starting upload.... file:', file);
      dispatch(startFileUpload(file));
    }
  };
  const policy = useAppSelector(publicFileUploadSelector).policy;
  const { status: fileUploadStatus } = useAppSelector(
    publicFileUploadSelector,
  ).fileUpload;
  const actionTarget = `https://${policy.bucket}.s3.localhost.localstack.cloud:4566`;

  if (!policy) {
    return null;
  }

  return (
    <form action={actionTarget} method="post" encType="multipart/form-data">
      <input type="file" name="file" onChange={onFileChange}></input>
      <button type="submit">Form submit</button>
      <CustomButton
        disabled={!file || fileUploadStatus === APIResponseStatus.InProgress}
        onClick={onUpload}
        variant={Variant.Outlined}
        color={Color.Secondary}
      >
        Submit
      </CustomButton>
      <input type="hidden" name="key" value={policy['key']} />
      <input type="hidden" name="Content-Type" value={policy['content-type']} />
      <input type="hidden" name="Expires" value={policy['expires']} />
      <input
        type="hidden"
        name="X-Amz-Credential"
        value={policy['x-amz-credential']}
      />
      <input
        type="hidden"
        name="X-Amz-Algorithm"
        value={policy['x-amz-algorithm']}
      />
      <input type="hidden" name="X-Amz-Date" value={policy['x-amz-date']} />
      <input
        type="hidden"
        name="X-Amz-Signature"
        value={policy['x-amz-signature']}
      />
      <input type="hidden" name="Policy" value={policy['policy']} />
    </form>
  );
};

export const FillContactDetails = ({
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
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.fillContactDetails',
  });
  const translateCommon = useCommonTranslation();

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PublicEnrollmentContactDetails>
  >([]);

  const dispatch = useAppDispatch();

  const { status: uploadPolicyStatus } = useAppSelector(
    publicFileUploadSelector,
  ).policy;

  const dirty = showValidation ? undefined : dirtyFields;
  const errors = getErrors<PublicEnrollmentContactDetails>({
    fields,
    values: enrollment,
    t: translateCommon,
    dirtyFields: dirty,
    extraValidation: emailsMatch.bind(this, t),
  });

  useEffect(() => {
    if (uploadPolicyStatus === APIResponseStatus.NotStarted) {
      dispatch(loadUploadPostPolicy(enrollment.examEventId as number));
    }
  }, [dispatch, enrollment.examEventId, uploadPolicyStatus]);

  useEffect(() => {
    setIsStepValid(
      !hasErrors<PublicEnrollmentContactDetails>({
        fields,
        values: enrollment,
        t: translateCommon,
        extraValidation: emailsMatch.bind(this, t),
      }),
    );
  }, [setIsStepValid, enrollment, t, translateCommon]);

  const handleChange =
    (fieldName: keyof PublicEnrollmentContactDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePublicEnrollment({
          [fieldName]: event.target.value,
        }),
      );
    };

  const handleBlur =
    (fieldName: keyof PublicEnrollmentContactDetails) => () => {
      if (!dirtyFields.includes(fieldName)) {
        setDirtyFields([...dirtyFields, fieldName]);
      }
      if (fieldName === 'phoneNumber') {
        dispatch(
          updatePublicEnrollment({
            phoneNumber: enrollment.phoneNumber.replace(/\s/g, ''),
          }),
        );
      }
    };

  const showCustomTextFieldError = (
    fieldName: keyof PublicEnrollmentContactDetails,
  ) => {
    return !!errors[fieldName];
  };

  const getCustomTextFieldAttributes = (
    fieldName: keyof PublicEnrollmentContactDetails,
  ) => ({
    id: `public-enrollment__contact-details__${fieldName}-field`,
    label: t(`${fieldName}.label`),
    onBlur: handleBlur(fieldName),
    onChange: handleChange(fieldName),
    error: showCustomTextFieldError(fieldName),
    helperText: errors[fieldName],
    required: true,
    disabled: isLoading,
  });

  return (
    <div className="margin-top-sm rows gapped public-enrollment__grid__contact-details">
      <PersonDetails />
      <div className="margin-top-lg rows gapped">
        <H2>{t('title')}</H2>
        <Text>{translateCommon('requiredFieldsInfo')}</Text>
        <div className="grid-2-columns gapped">
          <LabeledTextField
            {...getCustomTextFieldAttributes('email')}
            placeholder={t('email.placeholder')}
            type={TextFieldTypes.Email}
            value={enrollment.email}
            autoComplete={InputAutoComplete.Email}
          />
          <LabeledTextField
            {...getCustomTextFieldAttributes('emailConfirmation')}
            placeholder={t('emailConfirmation.placeholder')}
            type={TextFieldTypes.Email}
            value={enrollment.emailConfirmation}
            onPaste={(e) => {
              e.preventDefault();

              return false;
            }}
          />
        </div>
      </div>
      <LabeledTextField
        {...getCustomTextFieldAttributes('phoneNumber')}
        className="phone-number"
        value={enrollment.phoneNumber}
        type={TextFieldTypes.PhoneNumber}
        autoComplete={InputAutoComplete.PhoneNumber}
      />
      {uploadPolicyStatus === APIResponseStatus.Success && <FileUpload />}
    </div>
  );
};
