import { Divider } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

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
  const { isPhone } = useWindowProperties();

  return (
    <div className="margin-top-sm rows gapped public-enrollment__grid__contact-details">
      <PersonDetails showContactDetails={false} />
      {!isPhone && <Divider />}
      <CertificateShipping
        enrollment={enrollment}
        editingDisabled={isLoading}
        setValid={setIsStepValid}
        showValidation={showValidation}
      />
    </div>
  );
};
