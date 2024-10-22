import { RootState } from 'configs/redux';
import { PublicEnrollmentAppointmentState } from 'redux/reducers/publicEnrollmentAppointment';

export const publicEnrollmentAppointmentSelector = (
  state: RootState,
): PublicEnrollmentAppointmentState => state.publicEnrollmentAppointment;
