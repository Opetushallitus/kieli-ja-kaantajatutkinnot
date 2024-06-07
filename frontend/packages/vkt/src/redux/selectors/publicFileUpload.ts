import { RootState } from 'configs/redux';
import { PublicFileUploadState } from 'interfaces/publicFileUpload';

export const publicFileUploadSelector: (
  state: RootState,
) => PublicFileUploadState = (state: RootState) => state.publicFileUpload;
