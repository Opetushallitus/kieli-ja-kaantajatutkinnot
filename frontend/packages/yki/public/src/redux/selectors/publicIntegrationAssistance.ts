import { RootState } from 'configs/redux';
import { PublicIntegrationAssistanceState } from 'interfaces/publicIntegrationAssistance';

export const publicIntegrationAssistanceSelector = (
  state: RootState,
): PublicIntegrationAssistanceState => state.publicIntegrationAssistance;
