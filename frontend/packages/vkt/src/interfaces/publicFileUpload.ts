import { APIResponseStatus } from 'shared/enums';

export interface UploadPostPolicy {
  key: string;
  bucket: string;
  bucketURI: string;
  policy: string;
  expires: string;
  'content-type': string;
  'x-amz-date': string;
  'x-amz-signature': string;
  'x-amz-algorithm': string;
  'x-amz-credential': string;
}

export interface PublicFileUploadState {
  status: APIResponseStatus;
}

export interface PublicFileUploadParameters {
  examEventId: number;
  file: File;
}
