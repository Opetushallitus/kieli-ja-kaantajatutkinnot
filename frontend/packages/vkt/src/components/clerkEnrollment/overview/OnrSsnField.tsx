import { FormHelperTextProps } from '@mui/material';
import { FC, useEffect } from 'react';
import { CustomTextField, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  loadClerkEnrollmentOnrSsn,
  resetClerkEnrollmentOnrSsn,
} from 'redux/reducers/clerkEnrollmentDetails';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';

interface OnrSsnProps {
  oid?: string;
}

export const OnrSsnField: FC<OnrSsnProps> = ({ oid }) => {
  const translateCommon = useCommonTranslation();
  const { onrSsn, ssnStatus } = useAppSelector(clerkEnrollmentDetailsSelector);
  const dispatch = useAppDispatch();
  const isLoading = ssnStatus === APIResponseStatus.InProgress;

  useEffect(() => {
    if (ssnStatus === APIResponseStatus.NotStarted && oid) {
      dispatch(loadClerkEnrollmentOnrSsn(oid));
    }
  }, [dispatch, ssnStatus, oid]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkEnrollmentOnrSsn());
    };
  }, [dispatch]);

  const ssn = onrSsn?.oid === oid ? onrSsn?.ssn : '';

  return (
    <LoadingProgressIndicator isLoading={isLoading}>
      <CustomTextField
        data-testid={`clerk-enrollment__details-fields__ssn`}
        value={ssn}
        label={translateCommon(`enrollment.textFields.ssn`)}
        FormHelperTextProps={{ component: 'div' } as FormHelperTextProps}
        disabled={true}
      />
    </LoadingProgressIndicator>
  );
};
