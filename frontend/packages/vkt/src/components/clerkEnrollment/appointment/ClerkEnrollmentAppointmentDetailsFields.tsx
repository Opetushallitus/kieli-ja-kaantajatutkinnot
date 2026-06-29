import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperTextProps,
} from '@mui/material';
import dayjs from 'dayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CustomButton,
  CustomModal,
  CustomTextField,
  H2,
  H3,
  InfoText,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { InputFieldUtils } from 'shared/utils';

import { EnrollmentHistoryModal } from 'components/clerkEnrollment/appointment/EnrollmentHistoryModal';
import { EnrollmentSkillsListTable } from 'components/clerkEnrollment/appointment/EnrollmentSkillsListTable';
import { GradeModal } from 'components/clerkEnrollment/appointment/GradeModal';
import { OnrBirthdateField } from 'components/clerkEnrollment/appointment/OnrBirthdateField';
import {
  translateOutsideComponent,
  useClerkTranslation,
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { EnrollmentAppointmentStatus, ExamLevel } from 'enums/app';
import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import {
  ClerkEnrollmentAppointment,
  ClerkPayment,
} from 'interfaces/clerkEnrollment';
import { ClerkEnrollmentTextFieldProps } from 'interfaces/clerkEnrollmentTextField';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  loadClerkEnrollmentAppointment,
  saveClerkEnrollmentBirthdateOrSsn,
  sendClerkEnrollmentAppointmentAuthLink,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';
import { DateTimeUtils } from 'utils/dateTime';
import { EnrollmentUtils } from 'utils/enrollment';
import { ExamEventUtils } from 'utils/examEvent';

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

const PaymentDetails = ({ payment }: { payment: ClerkPayment }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventDetails',
  });

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="rows">
      <Text>
        {t('payment.details.status')}:{' '}
        <b>{t(`paymentStatus.${payment.status}`)}</b>
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
    </div>
  );
};

const getTextValue = (
  enrollment: ClerkEnrollmentAppointment,
  field: ClerkEnrollmentTextFieldEnum,
) => {
  if (
    enrollment.person &&
    (field === ClerkEnrollmentTextFieldEnum.FirstName ||
      field === ClerkEnrollmentTextFieldEnum.LastName)
  ) {
    return enrollment.person[field] || enrollment[field] || '';
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

const requiredFields = [
  ClerkEnrollmentTextFieldEnum.FirstName,
  ClerkEnrollmentTextFieldEnum.LastName,
  ClerkEnrollmentTextFieldEnum.Email,
  ClerkEnrollmentTextFieldEnum.PhoneNumber,
];

const getHelperText = (isRequiredFieldError: boolean, fieldError: string) =>
  isRequiredFieldError ? fieldError : <InfoText>{fieldError}</InfoText>;

const ClerkEnrollmentDetailsTextField = ({
  enrollment,
  field,
  showFieldError,
  isViewMode,
  onChange,
  ...rest
}: ClerkEnrollmentTextFieldProps<ClerkEnrollmentAppointment>) => {
  const translateCommon = useCommonTranslation();

  const required = requiredFields.includes(field);
  const fieldError = getFieldError(enrollment, field, required);
  const showRequiredFieldError =
    showFieldError && fieldError?.length > 0 && required;

  return isViewMode ? (
    <div className="rows">
      <H3>{translateCommon(`enrollment.textFields.${field}`)}</H3>
      <Text>{getTextValue(enrollment, field)}</Text>
    </div>
  ) : (
    <CustomTextField
      data-testid={`clerk-enrollment__details-fields__${field}`}
      value={getTextValue(enrollment, field)}
      label={translateCommon(`enrollment.textFields.${field}`)}
      onChange={onChange}
      type={getTextFieldType(field)}
      FormHelperTextProps={{ component: 'div' } as FormHelperTextProps}
      error={showRequiredFieldError}
      helperText={
        fieldError?.length > 0
          ? getHelperText(showRequiredFieldError, fieldError)
          : ' '
      }
      {...rest}
    />
  );
};

const ClerkEnrollmentSkillsListFields = ({
  enrollment,
  editDisabled,
  onCheckboxFieldChange,
}: {
  enrollment: ClerkEnrollmentAppointment;
  editDisabled: boolean;
  onCheckboxFieldChange: (
    field:
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollmentAppointment, 'digitalCertificateConsent'>,
    fieldValue: boolean,
  ) => void;
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });
  const translateCommon = useCommonTranslation();

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

  return (
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
          <CheckboxField
            enrollment={enrollment}
            fieldName={'understandingSkill'}
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
              {translateCommon('enrollment.partialExamsAndSkills.oralSkill')} *
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
                (!enrollment.oralSkill && !enrollment.understandingSkill) ||
                editDisabled
              }
            />
          </div>
          <div className="rows clerk-enrollment-details-fields__skills__checkboxes gapped-sm">
            <H3>
              {translateCommon('enrollment.partialExamsAndSkills.textualSkill')}{' '}
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
                (!enrollment.textualSkill && !enrollment.understandingSkill) ||
                editDisabled
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamAndEnrollmentDetailsSection = ({
  enrollment,
  isViewMode,
  onCheckboxFieldChange,
  editDisabled,
  openGradeModal,
  openEnrollmentHistoryModal,
}: {
  enrollment: ClerkEnrollmentAppointment;
  isViewMode: boolean;
  onCheckboxFieldChange: (
    field:
      | keyof PartialExamsAndSkills
      | keyof Pick<ClerkEnrollmentAppointment, 'digitalCertificateConsent'>,
    fieldValue: boolean,
  ) => void;
  editDisabled: boolean;
  openGradeModal: () => void;
  openEnrollmentHistoryModal: () => void;
}) => {
  const { grades } = useAppSelector(clerkEnrollmentAppointmentSelector);
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventDetails',
  });
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const translateCommon = useCommonTranslation();
  const examTime =
    enrollment.examEvent?.examTime &&
    DateTimeUtils.parseTime(enrollment.examEvent?.examTime);
  const isEnrollmentCompleted =
    enrollment.status === EnrollmentAppointmentStatus.COMPLETED ||
    enrollment.status === EnrollmentAppointmentStatus.EXPECTING_PAYMENT;

  return (
    <>
      <div className="columns margin-top-lg space-between">
        <H2>{t('heading')}</H2>
      </div>
      <Text>{t('examinerHelpText')}</Text>
      {enrollment.examEvent && (
        <div className="rows gapped-xxs">
          <H3>{t('header.examEvent')}:</H3>
          <Text>
            {ExamEventUtils.languageAndLevelText(
              enrollment.examEvent.language,
              ExamLevel.GOOD_AND_SATISFACTORY,
              translateCommon,
            )}
            <br aria-hidden={true} />
            {DateTimeUtils.renderDate(enrollment.examEvent.date)}
            <br aria-hidden={true} />
            {translateMunicipality(enrollment.examEvent.municipality.code)}
            {', '}
            {enrollment.examEvent.location}
            {examTime && <br aria-hidden={true} />}
            {examTime && DateTimeUtils.renderTime(examTime)}
          </Text>
        </div>
      )}
      {isViewMode ? (
        <EnrollmentSkillsListTable grades={grades} enrollment={enrollment} />
      ) : (
        <ClerkEnrollmentSkillsListFields
          enrollment={enrollment}
          editDisabled={editDisabled || isEnrollmentCompleted}
          onCheckboxFieldChange={onCheckboxFieldChange}
        />
      )}
      <div className="columns flex-start">
        <CustomButton
          onClick={openGradeModal}
          color={Color.Secondary}
          variant={Variant.Outlined}
        >
          {t('appointment.giveGrades')}
        </CustomButton>
      </div>
      <div className="columns flex-start">
        <CustomButton
          onClick={openEnrollmentHistoryModal}
          color={Color.Secondary}
          variant={Variant.Outlined}
        >
          {t('appointment.showHistory')}
        </CustomButton>
      </div>
    </>
  );
};

const PaymentDetailsSection = ({
  enrollment,
}: {
  enrollment: ClerkEnrollmentAppointment;
}) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventDetails',
  });
  const displayPaymentInformation =
    [
      EnrollmentAppointmentStatus.COMPLETED,
      EnrollmentAppointmentStatus.EXPECTING_PAYMENT,
    ].includes(enrollment.status) || enrollment.payments.length > 0;

  const displayPaymentHistory = enrollment.payments.length > 1;

  return (
    <>
      <div className="columns margin-top-lg space-between">
        <H2>{t('appointment.paymentInfoHeader')}</H2>
      </div>
      <Text>{t('examinerPaymentHelpText')}</Text>
      {displayPaymentInformation && (
        <div className="rows gapped-xxl margin-top-lg">
          <div className="rows gapped">
            <H3>{t('payment.recentTitle')}</H3>
            {enrollment.payments.length > 0 && (
              <PaymentDetails payment={enrollment.payments[0]} />
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
    </>
  );
};

const EnrollmentStatus = ({
  oid,
  setPaymentLinkModalOpen,
  isViewMode,
}: {
  oid: string;
  setPaymentLinkModalOpen: (open: boolean) => void;
  isViewMode: boolean;
}) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventDetails',
  });
  const { t: t2 } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const translateCommon = useCommonTranslation();
  const { showDialog } = useDialog();

  const { sendLinkStatus, enrollment } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (sendLinkStatus === APIResponseStatus.Success) {
      showDialog({
        title: t('authLinkSuccessDialog.header'),
        severity: Severity.Success,
        description: t('authLinkSuccessDialog.description'),
        actions: [
          {
            title: translateCommon('close'),
            variant: Variant.Outlined,
          },
        ],
      });
      dispatch(loadClerkEnrollmentAppointment({ id: enrollment.id, oid }));
    }
  }, [
    showDialog,
    translateCommon,
    t,
    sendLinkStatus,
    oid,
    enrollment.id,
    dispatch,
  ]);

  const sendAuthLinkAction = () =>
    dispatch(
      sendClerkEnrollmentAppointmentAuthLink({
        enrollmentId: enrollment.id,
        oid: oid,
      }),
    );

  const examTime =
    enrollment.examEvent?.examTime &&
    DateTimeUtils.parseTime(enrollment.examEvent?.examTime);

  const expiresAt = DateTimeUtils.renderDate(dayjs().add(3, 'day'));

  const sendAuthLinkConfirmContent = (
    <>
      <Text>{t('authLinkConfirmDialog.description.part1')}</Text>
      <br />
      <Text>
        <b>{t2('labels.language')}</b>:{' '}
        {translateCommon(`examLanguage.${enrollment.examEvent.language}`)}
      </Text>
      <Text>
        <b>{t2('labels.level')}</b>:{' '}
        {translateCommon(`examLevel.${ExamLevel.GOOD_AND_SATISFACTORY}`)}
      </Text>
      <Text>
        <b>{t2('labels.date')}</b>:{' '}
        {DateTimeUtils.renderDate(enrollment.examEvent.date)}
      </Text>
      <Text>
        <b>{t2('labels.municipality')}</b>:{' '}
        {translateMunicipality(enrollment.examEvent.municipality.code)}
      </Text>
      <Text>
        <b>{t2('labels.location')}</b>: {enrollment.examEvent.location}
      </Text>
      <Text>
        <b>{t2('labels.examTime')}</b>:{' '}
        {examTime && DateTimeUtils.renderTime(examTime)}
      </Text>
      <br />
      <Text>{t('authLinkConfirmDialog.description.part2')}</Text>
      <ul>
        <li>
          <Text>{t('authLinkConfirmDialog.description.bullet1')}</Text>
        </li>
        <li>
          <Text>{t('authLinkConfirmDialog.description.bullet2')}</Text>
        </li>
        <li>
          <Text>{t('authLinkConfirmDialog.description.bullet3')}</Text>
        </li>
        <li>
          <Text>{t('authLinkConfirmDialog.description.bullet4')}</Text>
        </li>
      </ul>
      <br />
      <Text>{t('authLinkConfirmDialog.description.part3', { expiresAt })}</Text>
      <br />
      <Text>{t('authLinkConfirmDialog.description.part4')}</Text>
      <Text>{t('authLinkConfirmDialog.description.part5')}</Text>
      <br />
      <Text>{t('authLinkConfirmDialog.description.part6')}</Text>
      <br />
      <Text>{t('authLinkConfirmDialog.description.part7')}</Text>
      <Text>{t('authLinkConfirmDialog.description.part8')}</Text>
    </>
  );

  const onSendAuthLink = () => {
    if (
      !enrollment.examEvent ||
      !EnrollmentUtils.isValidPartialExamsAndSkills(enrollment)
    ) {
      showDialog({
        title: t('authLinkErrorDialog.header'),
        severity: Severity.Error,
        description: t('authLinkErrorDialog.description'),
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
        ],
      });
    } else if (!isViewMode) {
      showDialog({
        title: t('authLinkErrorDialog.headerViewMode'),
        severity: Severity.Error,
        description: t('authLinkErrorDialog.descriptionViewMode'),
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
        ],
      });
    } else {
      showDialog({
        title: t('authLinkConfirmDialog.title'),
        severity: Severity.Info,
        content: sendAuthLinkConfirmContent,
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
          {
            title: t('authLinkConfirmDialog.send'),
            variant: Variant.Contained,
            action: sendAuthLinkAction,
          },
        ],
      });
    }
  };

  const onOpenPaymentLinkModal = () => {
    if (
      !enrollment.examEvent ||
      !EnrollmentUtils.isValidPartialExamsAndSkills(enrollment)
    ) {
      showDialog({
        title: t('authLinkErrorDialog.header'),
        severity: Severity.Error,
        description: t('authLinkErrorDialog.description'),
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
        ],
      });
    } else {
      setPaymentLinkModalOpen(true);
    }
  };

  const isCompleted =
    EnrollmentAppointmentStatus.COMPLETED === enrollment.status;

  return (
    <>
      <div className="rows gapped-sm margin-top-lg">
        <H3>{t('status')}</H3>
        <Text>{t(`enrollmentStatus.${enrollment.status}`)}</Text>
      </div>
      {(enrollment.authLink?.sentAt ||
        enrollment.authLink?.expiresAt ||
        !isCompleted) && (
        <div className="rows gapped-sm margin-top-lg">
          <H3>{t('appointment.authLink')}</H3>
          {enrollment.authLink?.sentAt && (
            <Text>
              {t('appointment.linkSentAt')}:{' '}
              {DateTimeUtils.renderDateTime(enrollment.authLink.sentAt)}
            </Text>
          )}
          {enrollment.authLink?.expiresAt && (
            <Text>
              {t('appointment.linkExpiresAt')}:{' '}
              {DateTimeUtils.renderDateTime(enrollment.authLink.expiresAt)}
            </Text>
          )}
        </div>
      )}
      {!isCompleted && (
        <>
          <div className="columns flex-start">
            <CustomButton
              onClick={onSendAuthLink}
              color={Color.Secondary}
              variant={Variant.Outlined}
            >
              {enrollment.authLink?.sentAt
                ? t('appointment.sendAuthLinkAgain')
                : t('appointment.sendAuthLink')}
            </CustomButton>
          </div>
          <div className="columns flex-start">
            <CustomButton
              onClick={onOpenPaymentLinkModal}
              color={Color.Secondary}
              variant={Variant.Text}
            >
              {t('appointment.noAuthPossible')}
            </CustomButton>
          </div>
        </>
      )}
    </>
  );
};

const PaymentLinkModal = ({
  paymentLinkModalOpen,
  setPaymentLinkModalOpen,
  enrollmentId,
  oid,
}: {
  paymentLinkModalOpen: boolean;
  setPaymentLinkModalOpen: (open: boolean) => void;
  enrollmentId: number;
  oid: string;
}) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventDetails',
  });
  const dispatch = useAppDispatch();
  const {
    enrollment,
    status,
    onrBirthdate,
    birthdateStatus,
    saveBirthdateOrSsnStatus,
  } = useAppSelector(clerkEnrollmentAppointmentSelector);
  const { showToast } = useToast();
  const birthdate = onrBirthdate?.birthdate ?? '';
  const [birthdateOrSsn, setbirthdateOrSsn] = useState(birthdate);
  const translateCommon = useCommonTranslation();
  const isLoading =
    birthdateStatus === APIResponseStatus.InProgress ||
    saveBirthdateOrSsnStatus === APIResponseStatus.InProgress ||
    status === APIResponseStatus.InProgress;
  const save = () =>
    dispatch(
      saveClerkEnrollmentBirthdateOrSsn({
        enrollmentId,
        oid,
        birthdateOrSsn,
      }),
    );

  useEffect(() => {
    if (saveBirthdateOrSsnStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('appointment.paymentLinkModal.success'),
      });

      dispatch(
        loadClerkEnrollmentAppointment({
          id: enrollmentId,
          oid: oid,
        }),
      );

      setbirthdateOrSsn('');
    }
  }, [enrollmentId, oid, showToast, saveBirthdateOrSsnStatus, t, dispatch]);

  return (
    <CustomModal
      open={paymentLinkModalOpen}
      modalTitle={t('appointment.paymentLinkModal.title')}
      onCloseModal={() => setPaymentLinkModalOpen(false)}
    >
      <>
        <div className="rows gapped">
          <Text>{t('appointment.paymentLinkModal.description')}</Text>
          <div className="rows align-items-start">
            <LoadingProgressIndicator isLoading={isLoading}>
              <CustomTextField
                value={birthdate || birthdateOrSsn}
                label={translateCommon('enrollment.textFields.birthdate')}
                onChange={(event) => setbirthdateOrSsn(event.target.value)}
                disabled={isLoading || !!birthdate}
              />
            </LoadingProgressIndicator>
            <CustomButton
              className="margin-top-sm"
              variant={Variant.Contained}
              color={Color.Secondary}
              onClick={save}
              disabled={isLoading || !!birthdate}
            >
              {translateCommon('save')}
            </CustomButton>
          </div>
          <div className="rows gapped-xs">
            <H3>{t('payment.modal.link')}</H3>
            <Text>
              {enrollment.paymentLinkUrl && (
                <pre>{enrollment.paymentLinkUrl}</pre>
              )}
            </Text>
          </div>
        </div>
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
  );
};

export const ClerkEnrollmentAppointmentDetailsFields = ({
  enrollment,
  editDisabled,
  isViewMode,
  oid,
  topControlButtons,
  onTextFieldChange,
  onCheckboxFieldChange,
  showFieldErrorBeforeChange,
}: {
  enrollment: ClerkEnrollmentAppointment;
  editDisabled: boolean;
  isViewMode: boolean;
  oid: string;
  topControlButtons: JSX.Element;
  showFieldErrorBeforeChange: boolean;
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
  const translateCommon = useCommonTranslation();

  const [paymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false);
  const [enrollmentHistoryModalOpen, setEnrollmentHistoryModalOpen] =
    useState(false);
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
      isViewMode,
    };
  };

  return (
    <div className="clerk-enrollment-details-fields">
      <div className="columns margin-top-lg space-between">
        <H2>{t('title')}</H2>
        {topControlButtons}
      </div>
      <Text className="margin-top-lg">{t('examinerHelpText')}</Text>
      <div className="rows gapped">
        <div className="margin-top-lg columns gapped">
          <div className="columns margin-top-lg grow">
            <H3>{t('header.personalInformation')}</H3>
          </div>
        </div>
        <div className="grid-3-columns align-items-start gapped">
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
          <OnrBirthdateField
            isViewMode={isViewMode}
            examinerOid={oid}
            personOid={enrollment.person?.oid}
          />
        </div>
        <div className="margin-top-sm columns gapped">
          <H3>{t('header.contactDetails')}</H3>
        </div>
        <div className="grid-3-columns align-items-start gapped">
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
        <div className="rows gapped-xxs margin-top-lg">
          <H3>{t('header.previousEnrollment')}:</H3>
          <Text>
            {enrollment.hasPreviousEnrollment
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        </div>
        {enrollment.attachments && enrollment.attachments.length > 0 && (
          <div className="rows gapped-xxs">
            <H3>{t('header.previousExamDecision')}:</H3>
            <ul className="public-enrollment__grid__preview__bullet-list">
              {enrollment.attachments.map((attachment) => (
                <Text key={attachment.id}>
                  <li>
                    <Link
                      className="columns gapped-xxs"
                      to={`${APIEndpoints.ExaminerEnrollmentAttachment.replace(
                        ':oid',
                        oid,
                      ).replace(
                        ':enrollmentAppointmentId',
                        String(enrollment.id),
                      )}?key=${attachment.id}`}
                      target="_blank"
                    >
                      {attachment.name}
                      <OpenInNewIcon fontSize="small" />
                    </Link>
                  </li>
                </Text>
              ))}
            </ul>
          </div>
        )}
        <Divider className="margin-top-lg" />
        <ExamAndEnrollmentDetailsSection
          enrollment={enrollment}
          isViewMode={isViewMode}
          onCheckboxFieldChange={onCheckboxFieldChange}
          editDisabled={editDisabled}
          openGradeModal={() => setGradeModalOpen(true)}
          openEnrollmentHistoryModal={() => setEnrollmentHistoryModalOpen(true)}
        />
        <Divider className="margin-top-lg" />
        <PaymentDetailsSection enrollment={enrollment} />
        <EnrollmentStatus
          oid={oid}
          setPaymentLinkModalOpen={setPaymentLinkModalOpen}
          isViewMode={isViewMode}
        />
      </div>
      {gradeModalOpen && (
        <GradeModal
          closeModal={setGradeModalOpen.bind(this, false)}
          skills={enrollment}
          open={gradeModalOpen}
          enrollment={enrollment}
          oid={oid}
        />
      )}
      {enrollmentHistoryModalOpen && (
        <EnrollmentHistoryModal
          closeModal={setEnrollmentHistoryModalOpen.bind(this, false)}
          open={enrollmentHistoryModalOpen}
          enrollmentId={enrollment.id}
          oid={oid}
        />
      )}
      <PaymentLinkModal
        paymentLinkModalOpen={paymentLinkModalOpen}
        setPaymentLinkModalOpen={setPaymentLinkModalOpen}
        enrollmentId={enrollment.id}
        oid={oid}
      />
    </div>
  );
};
