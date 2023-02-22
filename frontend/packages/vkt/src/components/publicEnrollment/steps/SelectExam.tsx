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
  disableNext,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  const [isValidPartialExamsSelection, setIsValidPartialExamsSelection] =
    useState(false);
  const [isValidCertificateShipping, setIsValidCertificateShipping] =
    useState(false);

  const setPartialExamsSelection = (isValid: boolean) =>
    setIsValidPartialExamsSelection(isValid);
  const setCertificateShipping = (isValid: boolean) =>
    setIsValidCertificateShipping(isValid);

  useEffect(() => {
    disableNext(!isValidPartialExamsSelection || !isValidCertificateShipping);
  }, [disableNext, isValidPartialExamsSelection, isValidCertificateShipping]);

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
      />
    </div>
  );
};
