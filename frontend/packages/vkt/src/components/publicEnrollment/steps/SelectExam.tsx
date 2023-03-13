import { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { Text } from 'shared/components';

import { CertificateShipping } from 'components/publicEnrollment/steps/CertificateShipping';
import { PartialExamsSelection } from 'components/publicEnrollment/steps/PartialExamsSelection';
import { PreviousEnrollment } from 'components/publicEnrollment/steps/PreviousEnrollment';
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

  const [isValidPartialExamsSelection, setIsValidPartialExamsSelection] =
    useState(false);
  const [isValidCertificateShipping, setIsValidCertificateShipping] =
    useState(false);
  const [isValidPreviousEnrollment, setIsValidPreviousEnrollment] =
    useState(false);

  const setPartialExamsSelection = (isValid: boolean) =>
    setIsValidPartialExamsSelection(isValid);
  const setCertificateShipping = (isValid: boolean) =>
    setIsValidCertificateShipping(isValid);
  const setPreviousEnrollment = (isValid: boolean) =>
    setIsValidPreviousEnrollment(isValid);

  useEffect(() => {
    setIsStepValid(
      isValidPartialExamsSelection &&
        isValidCertificateShipping &&
        isValidPreviousEnrollment
    );
  }, [
    setIsStepValid,
    isValidPartialExamsSelection,
    isValidCertificateShipping,
    isValidPreviousEnrollment,
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
        showValidation={showValidation}
        setValid={setPreviousEnrollment}
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
