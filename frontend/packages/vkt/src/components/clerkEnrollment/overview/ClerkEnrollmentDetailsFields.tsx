import { Checkbox, FormControlLabel, FormHelperTextProps } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import {
  CustomButton,
  CustomModal,
  CustomTextField,
  H2,
  H3,
  InfoText,
  Text,
} from 'shared/components';
import { Color, TextFieldTypes, Variant } from 'shared/enums';
import { DateUtils, InputFieldUtils } from 'shared/utils';

import {
  translateOutsideComponent,
  useClerkTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentStatus } from 'enums/app';
import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import { ClerkEnrollment, ClerkPayment } from 'interfaces/clerkEnrollment';
import { ClerkEnrollmentTextFieldProps } from 'interfaces/clerkEnrollmentTextField';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { createClerkEnrollmentPaymentLink } from 'redux/reducers/clerkEnrollmentDetails';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';

const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2);
};

const CheckboxField = ({
  enrollment,
  fieldName,
  onClick,
  disabled,
}: {
  enrollment: ClerkEnrollment;
  fieldName: keyof PartialExamsAndSkills;
  onClick: (fieldName: keyof PartialExamsAndSkills) => void;
  disabled: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <FormControlLabel
      control={
        <Checkbox
          data-testid={`clerk-enrollment__details-fields__${fieldName}`}
          onClick={() => onClick(fieldName)}
          color={Color.Secondary}
          checked={enrollment[fieldName]}
          disabled={disabled}
        />
      }
      label={translateCommon(`enrollment.partialExamsAndSkills.${fieldName}`)}
    />
  );
};

const PaymentDetails = ({ payment }: { payment: ClerkPayment }) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });

  return (
    <>
      <Text>
        {t('payment.paymentStatus')}: {payment.status}
      </Text>
      <Text>
        {t('payment.reference')}: {payment.id}
      </Text>
      <Text>
        {t('payment.date')}:{' '}
        {DateUtils.formatOptionalDateTime(payment.modifiedAt)}
      </Text>
      <Text>
        {t('payment.amount')}: {formatAmount(payment.amount)} &euro;
      </Text>
    </>
  );
};

const getTextValue = (
  enrollment: ClerkEnrollment,
  field: ClerkEnrollmentTextFieldEnum
) => {
  if (
    field === ClerkEnrollmentTextFieldEnum.FirstName ||
    field === ClerkEnrollmentTextFieldEnum.LastName
  ) {
    return enrollment.person[field] || '';
  } else {
    return enrollment[field] || '';
  }
};

const getTextFieldType = (field: ClerkEnrollmentTextFieldEnum) => {
  switch (field) {
    case ClerkEnrollmentTextFieldEnum.PhoneNumber:
      return TextFieldTypes.PhoneNumber;
    case ClerkEnrollmentTextFieldEnum.Email:
      return TextFieldTypes.Email;
    default:
      return TextFieldTypes.Text;
  }
};

const getFieldError = (
  enrollment: ClerkEnrollment,
  field: ClerkEnrollmentTextFieldEnum,
  required: boolean
) => {
  const t = translateOutsideComponent();
  const type = getTextFieldType(field);
  const value = getTextValue(enrollment, field);

  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    type,
    value,
    required,
    255
  );

  return error ? t(`vkt.common.${error}`) : '';
};

const getHelperText = (isRequiredFieldError: boolean, fieldError: string) =>
  isRequiredFieldError ? fieldError : <InfoText>{fieldError}</InfoText>;

const ClerkEnrollmentDetailsTextField = ({
  enrollment,
  field,
  showFieldError,
  onChange,
  ...rest
}: ClerkEnrollmentTextFieldProps) => {
  const translateCommon = useCommonTranslation();

  const required = field !== ClerkEnrollmentTextFieldEnum.PreviousEnrollment;
  const fieldError = getFieldError(enrollment, field, required);
  const showRequiredFieldError =
    showFieldError && fieldError?.length > 0 && required;
  const showHelperText =
    (showFieldError || !required) && fieldError?.length > 0;

  return (
    <CustomTextField
      data-testid={`clerk-enrollment__details-fields__${field}`}
      value={getTextValue(enrollment, field)}
      label={translateCommon(`enrollment.textFields.${field}`)}
      onChange={onChange}
      type={getTextFieldType(field)}
      FormHelperTextProps={{ component: 'div' } as FormHelperTextProps}
      error={showRequiredFieldError}
      showHelperText={showHelperText}
      helperText={getHelperText(showRequiredFieldError, fieldError)}
      {...rest}
    />
  );
};

export const ClerkEnrollmentDetailsFields = ({
  enrollment,
  editDisabled,
  topControlButtons,
  onTextFieldChange,
  onCheckboxFieldChange,
  showFieldErrorBeforeChange,
}: {
  enrollment: ClerkEnrollment;
  editDisabled: boolean;
  topControlButtons: JSX.Element;
  showFieldErrorBeforeChange: boolean;
  onTextFieldChange: (
    field: ClerkEnrollmentTextFieldEnum
  ) => (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onCheckboxFieldChange: (
    field:
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollment, 'digitalCertificateConsent'>,
    fieldValue: boolean
  ) => void;
}) => {
  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const paymentLink = useAppSelector(
    clerkEnrollmentDetailsSelector
  ).paymentLink;

  const [paymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false);

  const initialFieldErrors = Object.values(ClerkEnrollmentDetailsFields).reduce(
    (acc, val) => {
      return { ...acc, [val]: showFieldErrorBeforeChange };
    },
    {}
  ) as Record<ClerkEnrollmentTextFieldEnum, boolean>;

  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);

  const setFieldErrorOnBlur = (field: ClerkEnrollmentTextFieldEnum) => () => {
    setFieldErrors((prevFieldErrors) => ({
      ...prevFieldErrors,
      [field]: true,
    }));
  };

  const getCommonTextFieldProps = (
    field: ClerkEnrollmentTextFieldEnum,
    disabled: boolean
  ) => {
    return {
      field,
      enrollment,
      disabled,
      onChange: onTextFieldChange(field),
      showFieldError: fieldErrors[field],
      onBlur: setFieldErrorOnBlur(field),
      fullWidth: true,
    };
  };

  const toggleSkill = (fieldName: keyof PartialExamsAndSkills) => {
    const partialExamsToUncheck: Array<keyof PartialExamsAndSkills> = [];

    if (fieldName === 'oralSkill' && enrollment.oralSkill) {
      partialExamsToUncheck.push('speakingPartialExam');
      !enrollment.understandingSkill &&
        partialExamsToUncheck.push('speechComprehensionPartialExam');
    } else if (fieldName === 'textualSkill' && enrollment.textualSkill) {
      partialExamsToUncheck.push('writingPartialExam');
      !enrollment.understandingSkill &&
        partialExamsToUncheck.push('readingComprehensionPartialExam');
    } else if (
      fieldName === 'understandingSkill' &&
      enrollment.understandingSkill
    ) {
      if (!enrollment.oralSkill) {
        partialExamsToUncheck.push('speakingPartialExam');
        partialExamsToUncheck.push('speechComprehensionPartialExam');
      }
      if (!enrollment.textualSkill) {
        partialExamsToUncheck.push('writingPartialExam');
        partialExamsToUncheck.push('readingComprehensionPartialExam');
      }
    }

    togglePartialExam(fieldName);
    partialExamsToUncheck.forEach(uncheckPartialExam);
  };

  const togglePartialExam = (fieldName: keyof PartialExamsAndSkills) => {
    onCheckboxFieldChange(fieldName, !enrollment[fieldName]);
  };

  const uncheckPartialExam = (fieldName: keyof PartialExamsAndSkills) => {
    onCheckboxFieldChange(fieldName, false);
  };

  const statusToDescription = (status: EnrollmentStatus) => {
    return t(`enrollmentStatus.${status}`);
  };

  return (
    <div className="clerk-enrollment-details-fields">
      <div className="columns margin-top-lg space-between">
        <H2>{t('title')}</H2>
        {topControlButtons}
      </div>
      <div className="rows gapped">
        <div className="margin-top-lg columns gapped">
          <div className="columns margin-top-lg grow">
            <H3>{t('header.nameAndSSN')}</H3>
          </div>
        </div>
        <div className="columns align-items-start gapped">
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.LastName,
              true
            )}
          />
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.FirstName,
              true
            )}
          />
        </div>
        <div className="margin-top-sm columns gapped">
          <H3>{t('header.contactDetails')}</H3>
        </div>
        <div className="columns align-items-start gapped">
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.Email,
              editDisabled
            )}
          />
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.PhoneNumber,
              editDisabled
            )}
          />
        </div>
        <div className="margin-top-sm">
          <H3>{t('header.previousEnrollment')}</H3>
        </div>
        <ClerkEnrollmentDetailsTextField
          className="previous-enrollment"
          {...getCommonTextFieldProps(
            ClerkEnrollmentTextFieldEnum.PreviousEnrollment,
            editDisabled
          )}
        />
        <div className="columns align-items-start clerk-enrollment-details-fields__skills">
          <div className="rows gapped-xs">
            <div className="margin-top-sm columns gapped">
              <H3>{t('header.selectedSkills')}</H3>
            </div>
            <div className="rows clerk-enrollment-details-fields__skills__checkboxes">
              <CheckboxField
                enrollment={enrollment}
                fieldName={'textualSkill'}
                onClick={toggleSkill}
                disabled={editDisabled}
              />
              <CheckboxField
                enrollment={enrollment}
                fieldName={'oralSkill'}
                onClick={toggleSkill}
                disabled={editDisabled}
              />
              <CheckboxField
                enrollment={enrollment}
                fieldName={'understandingSkill'}
                onClick={toggleSkill}
                disabled={editDisabled}
              />
            </div>
          </div>
          <div className="rows gapped-xs margin-top-sm">
            <H3>{t('header.selectedPartialExams')}</H3>
            <div className="rows clerk-enrollment-details-fields__skills__checkboxes">
              <CheckboxField
                enrollment={enrollment}
                fieldName={'writingPartialExam'}
                onClick={togglePartialExam}
                disabled={!enrollment.textualSkill || editDisabled}
              />
              <CheckboxField
                enrollment={enrollment}
                fieldName={'readingComprehensionPartialExam'}
                onClick={togglePartialExam}
                disabled={
                  (!enrollment.textualSkill &&
                    !enrollment.understandingSkill) ||
                  editDisabled
                }
              />
              <CheckboxField
                enrollment={enrollment}
                fieldName={'speakingPartialExam'}
                onClick={togglePartialExam}
                disabled={!enrollment.oralSkill || editDisabled}
              />
              <CheckboxField
                enrollment={enrollment}
                fieldName={'speechComprehensionPartialExam'}
                onClick={togglePartialExam}
                disabled={
                  (!enrollment.oralSkill && !enrollment.understandingSkill) ||
                  editDisabled
                }
              />
            </div>
          </div>
        </div>
        <div className="rows gapped-sm margin-top-lg">
          <H3>{t('payment.title')}</H3>
          <Text>{statusToDescription(enrollment.status)}</Text>
          {enrollment.payments?.length > 0 && (
            <div className="margin-top-lg">
              <H3>{t('payment.status')}</H3>
              <PaymentDetails payment={enrollment.payments[0]} />
            </div>
          )}
          {enrollment.payments?.length > 1 && (
            <div className="margin-top-lg">
              <H3>{t('payment.history')}</H3>
              {enrollment.payments.map((payment: ClerkPayment) => (
                <PaymentDetails
                  key={`payment-row-${payment.id}`}
                  payment={payment}
                />
              ))}
            </div>
          )}
          {enrollment.status === 'EXPECTING_PAYMENT' && (
            <div className="columns gapped flex-start">
              <CustomButton
                color={Color.Secondary}
                variant={Variant.Outlined}
                onClick={() => {
                  setPaymentLinkModalOpen(true);
                  dispatch(createClerkEnrollmentPaymentLink(enrollment));
                }}
              >
                {t('payment.create')}
              </CustomButton>
            </div>
          )}
        </div>
        <div className="rows gapped-sm margin-top-lg">
          <H3>{t('header.digitalCertificateConsent')}</H3>
          <FormControlLabel
            className="clerk-enrollment-details-fields__certificate-shipping__consent"
            control={
              <Checkbox
                data-testid="clerk-enrollment__details-fields__digitalCertificateConsent"
                onClick={() =>
                  onCheckboxFieldChange(
                    'digitalCertificateConsent',
                    !enrollment.digitalCertificateConsent
                  )
                }
                color={Color.Secondary}
                checked={enrollment.digitalCertificateConsent}
                disabled={editDisabled}
              />
            }
            label={translateCommon('enrollment.certificateShipping.consent')}
          />
        </div>
        {!enrollment.digitalCertificateConsent && (
          <div className="rows gapped margin-top-sm">
            <H3>
              {translateCommon('enrollment.certificateShipping.addressTitle')}
            </H3>
            <div className="grid-columns gapped">
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.Street,
                  editDisabled
                )}
              />
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.PostalCode,
                  editDisabled
                )}
              />
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.Town,
                  editDisabled
                )}
              />
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.Country,
                  editDisabled
                )}
              />
            </div>
          </div>
        )}
      </div>
      <CustomModal
        open={paymentLinkModalOpen}
        modalTitle={t('payment.linkTitle')}
        onCloseModal={() => setPaymentLinkModalOpen(false)}
      >
        <>
          {paymentLink && (
            <>
              <H3>{t('payment.link')}</H3>
              <Text>{paymentLink.url}</Text>
              <H3>{t('payment.expires')}</H3>
              <Text>
                {DateUtils.formatOptionalDateTime(paymentLink.expiresAt)}
              </Text>
            </>
          )}
          <div className="columns gapped flex-end">
            <CustomButton
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={() => setPaymentLinkModalOpen(false)}
            >
              Sulje
            </CustomButton>
          </div>
        </>
      </CustomModal>
    </div>
  );
};
