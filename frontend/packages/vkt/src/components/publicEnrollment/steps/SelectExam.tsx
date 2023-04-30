import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { Text } from 'shared/components';

import { CertificateShipping } from 'components/publicEnrollment/steps/selectExam/CertificateShipping';
import { PartialExamsSelection } from 'components/publicEnrollment/steps/selectExam/PartialExamsSelection';
import { PreviousEnrollment } from 'components/publicEnrollment/steps/selectExam/PreviousEnrollment';
import { useCommonTranslation } from 'configs/i18n';
import { PublicEnrollment } from 'interfaces/publicEnrollment';

export const SelectExam = ({
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
  const translateCommon = useCommonTranslation();

  const [isValidPreviousEnrollment, setIsValidPreviousEnrollment] =
    useState(false);
  const [isValidPartialExamsSelection, setIsValidPartialExamsSelection] =
    useState(false);
  const [isValidCertificateShipping, setIsValidCertificateShipping] =
    useState(false);

  const setPreviousEnrollment = (isValid: boolean) =>
    setIsValidPreviousEnrollment(isValid);
  const setPartialExamsSelection = (isValid: boolean) =>
    setIsValidPartialExamsSelection(isValid);
  const setCertificateShipping = (isValid: boolean) =>
    setIsValidCertificateShipping(isValid);

  useEffect(() => {
    setIsStepValid(
      isValidPreviousEnrollment &&
        isValidPartialExamsSelection &&
        isValidCertificateShipping
    );
  }, [
    setIsStepValid,
    isValidPreviousEnrollment,
    isValidPartialExamsSelection,
    isValidCertificateShipping,
  ]);

  return (
    <div className="margin-top-xxl rows gapped-xxl">
      <Text>
        <Trans
          t={translateCommon}
          i18nKey="examinationPaymentsDescription"
        ></Trans>
      </Text>
      <PreviousEnrollment
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPreviousEnrollment}
        showValidation={showValidation}
      />
      <PartialExamsSelection
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPartialExamsSelection}
      />
      <CertificateShipping
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setCertificateShipping}
        showValidation={showValidation}
      />
    </div>
  );
};
