import { APIResponseStatus } from 'shared/enums';

interface UploadPostPolicyState extends UploadPostPolicy {
  status: APIResponseStatus;
  examEventId?: number;
}

export interface UploadPostPolicy {
  key?: string;
  bucket?: string;
  policy?: string;
  expires?: string;
  'content-type'?: string;
  'x-amz-date'?: string;
  'x-amz-signature'?: string;
  'x-amz-algorithm'?: string;
  'x-amz-credential'?: string;
}

interface FileUploadState {
  status: APIResponseStatus;
}

export interface PublicFileUploadState {
  policy: UploadPostPolicyState;
  fileUpload: FileUploadState;
}
