import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperTextProps,
} from '@mui/material';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import {
  ComboBox,
  CustomButton,
  CustomModal,
  CustomTextField,
  H2,
  H3,
  InfoText,
  Text,
  valueAsOption,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import {
  translateOutsideComponent,
  useClerkTranslation,
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EnrollmentAppointmentStatus, PaymentStatus } from 'enums/app';
import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
  ClerkPayment,
} from 'interfaces/clerkEnrollment';
import { ClerkEnrollmentTextFieldProps } from 'interfaces/clerkEnrollmentTextField';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';
import {
  resetClerkEnrollmentAppointmentGrades,
  upsertClerkEnrollmentAppointmentGrades,
} from 'redux/reducers/clerkEnrollmentAppointment';
import {
  createClerkEnrollmentPaymentLink,
  setClerkPaymentRefunded,
} from 'redux/reducers/clerkEnrollmentDetails';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';
import { DateTimeUtils } from 'utils/dateTime';

const CheckboxField = ({
  enrollment,
  fieldName,
  onClick,
  disabled,
}: {
  enrollment: ClerkEnrollmentAppointment;
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

const gradeToComboBoxOption = (grade: string) => ({
  value: grade,
  label: grade,
});

const GradeModal = ({
  open,
  skills,
  closeModal,
  enrollment,
}: {
  open: boolean;
  skills: PartialExamsAndSkills;
  closeModal: () => void;
  enrollment: ClerkEnrollmentAppointment;
}) => {
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const exams: Array<keyof ClerkEnrollmentAppointmentGrades> = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ];
  const selectedSkills = exams.filter(
    (skill: keyof ClerkEnrollmentAppointmentGrades) => skills[skill],
  );
  const { grades, gradesStatus } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );
  const [newGrades, setGrades] =
    useState<ClerkEnrollmentAppointmentGrades>(grades);
  const isLoading = gradesStatus === APIResponseStatus.InProgress;
  const handleSaveGradesButtonClick = () => {
    dispatch(
      upsertClerkEnrollmentAppointmentGrades({ enrollment, grades: newGrades }),
    );
  };

  useEffect(() => {
    if (gradesStatus === APIResponseStatus.Success) {
      closeModal();
      dispatch(resetClerkEnrollmentAppointmentGrades());
    }
  }, [gradesStatus, dispatch, closeModal]);

  const onSetComment =
    (exam: keyof ClerkEnrollmentAppointmentGrades) =>
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      setGrades((prev) => ({
        ...prev,
        [exam]: {
          ...prev[exam],
          comment: event.target.value,
        },
      }));

  const onSetGrade =
    (exam: keyof ClerkEnrollmentAppointmentGrades) => (grade?: string) =>
      setGrades((prev) => ({
        ...prev,
        [exam]: {
          ...prev[exam],
          grade,
        },
      }));

  return (
    <CustomModal
      onCloseModal={closeModal}
      open={open}
      modalTitle={'Anna arvosanat'}
    >
      <>
        <div style={{ width: '60vw' }} className="rows gapped-sm">
          <div style={{ margin: '2em' }} className="grid-3-columns gapped">
            <Text className="bold">Osakoe</Text>
            <Text className="bold">Arvosana</Text>
            <Text className="bold">Huomautuksia</Text>
            {selectedSkills.map(
              (skill: keyof ClerkEnrollmentAppointmentGrades, index) => (
                <Fragment key={index}>
                  <Text>
                    {translateCommon(
                      `enrollment.partialExamsAndSkills.${skill}`,
                    )}
                  </Text>
                  <ComboBox
                    autoHighlight
                    values={['ACCEPTED', 'FAILED'].map(valueAsOption)}
                    variant={TextFieldVariant.Outlined}
                    onChange={onSetGrade(skill)}
                    value={
                      newGrades[skill]?.grade
                        ? gradeToComboBoxOption(newGrades[skill]?.grade)
                        : null
                    }
                    disabled={isLoading}
                  />
                  <CustomTextField
                    value={newGrades[skill]?.comment ?? ''}
                    onChange={onSetComment(skill)}
                    disabled={isLoading}
                  />
                </Fragment>
              ),
            )}
          </div>
          <div className="columns gapped flex-end">
            <CustomButton
              onClick={closeModal}
              variant={Variant.Outlined}
              color={Color.Secondary}
              disabled={isLoading}
            >
              {translateCommon('cancel')}
            </CustomButton>
            <CustomButton
              onClick={handleSaveGradesButtonClick}
              variant={Variant.Contained}
              color={Color.Secondary}
              disabled={isLoading}
            >
              {translateCommon('save')}
            </CustomButton>
          </div>
        </div>
      </>
    </CustomModal>
  );
};

const PaymentDetails = ({ payment }: { payment: ClerkPayment }) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });
  const translateCommon = useCommonTranslation();

  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();
  const refundLoadingStatus = useAppSelector(
    clerkEnrollmentDetailsSelector,
  ).paymentRefundStatus;

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const handleSetRefundedButtonClick = (paymentId: number) => {
    showDialog({
      title: t('payment.refundDialog.header'),
      severity: Severity.Info,
      description: t('payment.refundDialog.description'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => dispatch(setClerkPaymentRefunded(paymentId)),
        },
      ],
    });
  };

  return (
    <div className="rows">
      <Text>
        {t('payment.details.status')}:{' '}
        <b>{t(`paymentStatus.${payment.status}`)}</b>
        {payment.refundedAt && ` (${t('payment.details.refunded')})`}
      </Text>
      <Text>
        {t('payment.details.reference')}: <b>{payment.transactionId}</b>
      </Text>
      <Text>
        {t('payment.details.date')}:{' '}
        <b>{DateTimeUtils.renderDateTime(payment.createdAt)}</b>
      </Text>
      <Text>
        {t('payment.details.amount')}:{' '}
        <b>{formatAmount(payment.amount)} &euro;</b>
      </Text>
      {payment.refundedAt ? (
        <Text data-testid={`clerk-payment-${payment.id}__refunded-at`}>
          {t('payment.details.refunded')}:{' '}
          <b>{DateTimeUtils.renderDate(payment.refundedAt)}</b>
        </Text>
      ) : (
        payment.status === PaymentStatus.OK && (
          <div className="margin-top-sm flex-start">
            <CustomButton
              data-testid={`clerk-payment-${payment.id}__set-refunded`}
              variant={Variant.Outlined}
              color={Color.Secondary}
              onClick={handleSetRefundedButtonClick.bind(this, payment.id)}
              disabled={refundLoadingStatus === APIResponseStatus.InProgress}
            >
              {t('payment.setRefunded')}
            </CustomButton>
          </div>
        )
      )}
    </div>
  );
};

const getTextValue = (
  enrollment: ClerkEnrollmentAppointment,
  field: ClerkEnrollmentTextFieldEnum,
) => {
  return enrollment[field] || '';
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
  enrollment: ClerkEnrollmentAppointment,
  field: ClerkEnrollmentTextFieldEnum,
  required: boolean,
) => {
  const t = translateOutsideComponent();
  const type = getTextFieldType(field);
  const value = getTextValue(enrollment, field);

  const error = InputFieldUtils.inspectCustomTextFieldErrors(
    type,
    value,
    required,
    255,
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
}: ClerkEnrollmentTextFieldProps<ClerkEnrollmentAppointment>) => {
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

export const ClerkEnrollmentAppointmentDetailsFields = ({
  enrollment,
  examEvents,
  newExamEvent,
  onExamEventChange,
  editDisabled,
  topControlButtons,
  onTextFieldChange,
  onCheckboxFieldChange,
  showFieldErrorBeforeChange,
}: {
  enrollment: ClerkEnrollmentAppointment;
  examEvents: Array<ExaminerExamEvent>;
  newExamEvent: ExaminerExamEvent | undefined;
  editDisabled: boolean;
  topControlButtons: JSX.Element;
  showFieldErrorBeforeChange: boolean;
  onExamEventChange: (value?: string) => void;
  onTextFieldChange: (
    field: ClerkEnrollmentTextFieldEnum,
  ) => (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onCheckboxFieldChange: (
    field:
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollmentAppointment, 'digitalCertificateConsent'>,
    fieldValue: boolean,
  ) => void;
}) => {
  // I18n
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const paymentLink = useAppSelector(
    clerkEnrollmentDetailsSelector,
  ).paymentLink;

  const [paymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);

  const initialFieldErrors = Object.values(
    ClerkEnrollmentAppointmentDetailsFields,
  ).reduce((acc, val) => {
    return { ...acc, [val]: showFieldErrorBeforeChange };
  }, {}) as Record<ClerkEnrollmentTextFieldEnum, boolean>;

  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);

  const setFieldErrorOnBlur = (field: ClerkEnrollmentTextFieldEnum) => () => {
    setFieldErrors((prevFieldErrors) => ({
      ...prevFieldErrors,
      [field]: true,
    }));
  };

  const getCommonTextFieldProps = (
    field: ClerkEnrollmentTextFieldEnum,
    disabled: boolean,
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

  const displayPaymentInformation =
    [
      EnrollmentAppointmentStatus.COMPLETED,
      EnrollmentAppointmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
    ].includes(enrollment.status) || enrollment.payments.length > 0;

  const displayPaymentHistory = enrollment.payments.length > 1;

  const examEventToOption = (examEvent: ExaminerExamEvent) => ({
    value: examEvent.id.toString(),
    label: examEvent.location ?? '',
  });

  // TODO Remove this flag once digital certificates are available
  return (
    <div className="clerk-enrollment-details-fields">
      <div className="columns margin-top-lg space-between">
        <H2>{t('title')}</H2>
        {topControlButtons}
      </div>
      <div className="rows gapped">
        <div className="margin-top-lg columns gapped">
          <div className="columns margin-top-lg grow">
            <H3>{t('header.personalInformation')}</H3>
          </div>
        </div>
        <div className="columns align-items-start gapped">
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.LastName,
              true,
            )}
          />
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.FirstName,
              true,
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
              editDisabled,
            )}
          />
          <ClerkEnrollmentDetailsTextField
            {...getCommonTextFieldProps(
              ClerkEnrollmentTextFieldEnum.PhoneNumber,
              editDisabled,
            )}
          />
        </div>
        {!enrollment.digitalCertificateConsent && (
          <div className="rows gapped margin-top-lg">
            <H3>
              {translateCommon('enrollment.certificateShipping.addressTitle')}
            </H3>
            <div className="grid-columns gapped">
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.Street,
                  editDisabled,
                )}
              />
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.PostalCode,
                  editDisabled,
                )}
              />
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.Town,
                  editDisabled,
                )}
              />
              <ClerkEnrollmentDetailsTextField
                {...getCommonTextFieldProps(
                  ClerkEnrollmentTextFieldEnum.Country,
                  editDisabled,
                )}
              />
            </div>
          </div>
        )}
        <Divider className="margin-top-lg" />
        <div className="columns margin-top-lg space-between">
          <H2>Tutkinnon tiedot</H2>
        </div>
        {enrollment.examEvent ? (
          <div className="rows">
            <H3>Tutkinnon kieli, aika ja paikka</H3>
            <Text>
              {translateCommon(`examLanguage.${enrollment.examEvent.language}`)}
              {', '}
              {DateTimeUtils.renderDate(enrollment.examEvent.date)}
              {', '}
              {translateMunicipality(enrollment.examEvent.municipality.code)}
              {', '}
              {enrollment.examEvent.location}
            </Text>
          </div>
        ) : (
          <div className="half-max-width">
            <ComboBox
              autoHighlight
              label={'Tutkinto'}
              values={examEvents.map(examEventToOption)}
              value={newExamEvent ? examEventToOption(newExamEvent) : null}
              variant={TextFieldVariant.Outlined}
              onChange={onExamEventChange}
            />
          </div>
        )}
        {!editDisabled && (
          <div className="rows align-items-start clerk-enrollment-details-fields__skills">
            <div className="rows gapped-sm">
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
              </div>
            </div>
            <div className="rows gapped margin-top-sm">
              <H3>{t('header.selectedPartialExams')}</H3>
              <div className="columns gapped-xxl">
                <div className="rows clerk-enrollment-details-fields__skills__checkboxes gapped-sm">
                  <H3>
                    {translateCommon(
                      'enrollment.partialExamsAndSkills.oralSkill',
                    )}{' '}
                    *
                  </H3>
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
                      (!enrollment.oralSkill &&
                        !enrollment.understandingSkill) ||
                      editDisabled
                    }
                  />
                </div>
                <div className="rows clerk-enrollment-details-fields__skills__checkboxes gapped-sm">
                  <H3>
                    {translateCommon(
                      'enrollment.partialExamsAndSkills.textualSkill',
                    )}{' '}
                    *
                  </H3>
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
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="margin-top-sm">
          <H3>{t('header.previousEnrollment')}</H3>
        </div>
        <ClerkEnrollmentDetailsTextField
          className="previous-enrollment"
          {...getCommonTextFieldProps(
            ClerkEnrollmentTextFieldEnum.PreviousEnrollment,
            editDisabled,
          )}
        />
        <div className="columns flex-start">
          <CustomButton
            onClick={setGradeModalOpen.bind(this, true)}
            color={Color.Secondary}
            variant={Variant.Outlined}
          >
            Anna arvosanat
          </CustomButton>
        </div>
        <Divider className="margin-top-lg" />
        <div className="columns margin-top-lg space-between">
          <H2>Maksutiedot</H2>
        </div>
        {displayPaymentInformation && (
          <div className="rows gapped-xxl margin-top-lg">
            <div className="rows gapped">
              <H3>{t('payment.recentTitle')}</H3>
              {enrollment.payments.length > 0 && (
                <PaymentDetails payment={enrollment.payments[0]} />
              )}
              {enrollment.status ===
                EnrollmentAppointmentStatus.AWAITING_PAYMENT && (
                <div className="columns flex-start">
                  <CustomButton
                    color={Color.Secondary}
                    variant={Variant.Outlined}
                    onClick={() => {
                      setPaymentLinkModalOpen(true);
                      dispatch(createClerkEnrollmentPaymentLink(enrollment.id));
                    }}
                  >
                    {t('payment.create')}
                  </CustomButton>
                </div>
              )}
            </div>
            {displayPaymentHistory && (
              <div className="rows gapped">
                <H3>{t('payment.historyTitle')}</H3>
                {enrollment.payments.slice(1).map((payment: ClerkPayment) => (
                  <PaymentDetails
                    key={`payment-row-${payment.id}`}
                    payment={payment}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <div className="rows gapped-sm margin-top-lg">
          <H3>{t('status')}</H3>
          <Text>{t(`enrollmentStatus.${enrollment.status}`)}</Text>
        </div>
        <div className="rows gapped-sm margin-top-lg">
          <H3>Ilmoittautumislinkki</H3>
          {enrollment.authLink?.sentAt && (
            <Text>
              Lähetetty:{' '}
              {DateTimeUtils.renderDateTime(enrollment.authLink.sentAt)}
            </Text>
          )}
          {enrollment.authLink?.expiresAt && (
            <Text>
              Erääntyy:{' '}
              {DateTimeUtils.renderDateTime(enrollment.authLink.expiresAt)}
            </Text>
          )}
        </div>
        <div className="columns flex-start">
          <CustomButton
            onClick={setGradeModalOpen.bind(this, true)}
            color={Color.Secondary}
            variant={Variant.Outlined}
          >
            Lähetä ilmoittautumislinkki
          </CustomButton>
        </div>
      </div>
      {gradeModalOpen && (
        <GradeModal
          closeModal={setGradeModalOpen.bind(this, false)}
          skills={enrollment}
          open={gradeModalOpen}
          enrollment={enrollment}
        />
      )}
      <CustomModal
        open={paymentLinkModalOpen}
        modalTitle={t('payment.modal.title')}
        onCloseModal={() => setPaymentLinkModalOpen(false)}
      >
        <>
          {paymentLink && (
            <div className="rows gapped">
              <div className="rows gapped-xs">
                <H3>{t('payment.modal.link')}</H3>
                <Text>{paymentLink.url}</Text>
              </div>
              <div className="rows gapped-xs">
                <H3>{t('payment.modal.expires')}</H3>
                <Text>
                  {DateTimeUtils.renderDateTime(paymentLink.expiresAt)}
                </Text>
              </div>
            </div>
          )}
          <div className="columns gapped flex-end">
            <CustomButton
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={() => setPaymentLinkModalOpen(false)}
            >
              {translateCommon('close')}
            </CustomButton>
          </div>
        </>
      </CustomModal>
    </div>
  );
};
