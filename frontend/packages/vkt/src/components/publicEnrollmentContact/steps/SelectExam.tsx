import { Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { AnyAction } from 'redux';

import { ExamFee } from 'components/publicEnrollmentContact/steps/selectExam/ExamFee';
import { ExamSelection } from 'components/publicEnrollmentContact/steps/selectExam/ExamSelection';
import { Message } from 'components/publicEnrollmentContact/steps/selectExam/Message';
import { PreviousEnrollment } from 'components/publicEnrollmentContact/steps/selectExam/PreviousEnrollment';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';

export const SelectExam = ({
  enrollment,
  isLoading,
  setIsStepValid,
  showValidation,
  updatePublicEnrollment,
}: {
  enrollment: PublicEnrollmentContact;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentContact>,
  ) => AnyAction;
}) => {
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
    <div className="rows gapped">
      <ExamFee />
      <Divider />
      <ExamSelection
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPartialExamsSelection}
        showValidation={showValidation}
        updatePublicEnrollment={updatePublicEnrollment}
      />
      <Divider />
      <PreviousEnrollment
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPreviousEnrollment}
        showValidation={showValidation}
        updatePublicEnrollment={updatePublicEnrollment}
      />
      <Divider />
      <Message
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setPreviousEnrollment}
        showValidation={showValidation}
        updatePublicEnrollment={updatePublicEnrollment}
      />
    </div>
  );
};
