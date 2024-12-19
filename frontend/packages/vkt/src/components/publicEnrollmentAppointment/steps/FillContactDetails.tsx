import { Divider } from '@mui/material';

import { CertificateShipping } from 'components/publicEnrollmentAppointment/steps/CertificateShipping';
import { PersonDetails } from 'components/publicEnrollmentAppointment/steps/PersonDetails';
import { PublicEnrollmentAppointment } from 'interfaces/publicEnrollment';

export const FillContactDetails = ({
  isLoading,
  enrollment,
  setIsStepValid,
  showValidation,
}: {
  isLoading: boolean;
  enrollment: PublicEnrollmentAppointment;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  return (
    <div className="margin-top-sm rows gapped-xxl public-enrollment__grid__contact-details">
      <PersonDetails showContactDetails={false} />
      <Divider />
      <CertificateShipping
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setIsStepValid}
        showValidation={showValidation}
      />
    </div>
  );
};
