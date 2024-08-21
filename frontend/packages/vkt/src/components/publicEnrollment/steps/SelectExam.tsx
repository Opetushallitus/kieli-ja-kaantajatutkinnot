import { useEffect, useState } from 'react';
import { H2, Text } from 'shared/components';

import { PartialExamsSelection } from 'components/publicEnrollment/steps/selectExam/PartialExamsSelection';
import { PreviousEnrollment } from 'components/publicEnrollment/steps/selectExam/PreviousEnrollment';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
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
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.selectExam',
  });

  const [isValidPreviousEnrollment, setIsValidPreviousEnrollment] =
    useState(false);
  const [isValidPartialExamsSelection, setIsValidPartialExamsSelection] =
    useState(false);

  const setPreviousEnrollment = (isValid: boolean) =>
    setIsValidPreviousEnrollment(isValid);
  const setPartialExamsSelection = (isValid: boolean) =>
    setIsValidPartialExamsSelection(isValid);

  useEffect(() => {
    setIsStepValid(isValidPreviousEnrollment && isValidPartialExamsSelection);
  }, [setIsStepValid, isValidPreviousEnrollment, isValidPartialExamsSelection]);

  return (
    <div className="margin-top-xxl rows gapped">
      <Text>{translateCommon('requiredFieldsInfo')}</Text>
      <H2>{t('title')}</H2>
      <Text>
        {t('part1')}
        <br />
        {t('part2')}
      </Text>
      <PartialExamsSelection
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPartialExamsSelection}
        showValidation={showValidation}
      />
      <PreviousEnrollment
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPreviousEnrollment}
        showValidation={showValidation}
      />
    </div>
  );
};
