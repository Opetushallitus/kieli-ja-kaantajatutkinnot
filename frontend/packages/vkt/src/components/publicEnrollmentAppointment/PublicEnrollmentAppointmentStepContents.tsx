import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { Authenticate } from 'components/publicEnrollmentAppointment/steps/Authenticate';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export const PublicEnrollmentAppointmentStepContents = ({
  activeStep,
  enrollment,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
  enrollment: PublicEnrollment;
}) => {
  const navigate = useNavigate();

  switch (activeStep) {
    case PublicEnrollmentAppointmentFormStep.Authenticate:
      return <Authenticate enrollment />;
  }
};
