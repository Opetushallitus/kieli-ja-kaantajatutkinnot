import { FormHelperTextProps } from '@mui/material';
import { FC, useEffect } from 'react';
import {
  CustomTextField,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  loadClerkEnrollmentOnrBirthdate,
  resetClerkEnrollmentOnrBirthdate,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';

interface OnrBirthdateProps {
  personOid?: string;
  examinerOid?: string;
  isViewMode: boolean;
}

export const OnrBirthdateField: FC<OnrBirthdateProps> = ({
  personOid,
  examinerOid,
  isViewMode,
}) => {
  const translateCommon = useCommonTranslation();
  const { onrBirthdate, birthdateStatus } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );
  const dispatch = useAppDispatch();
  const isLoading = birthdateStatus === APIResponseStatus.InProgress;

  useEffect(() => {
    if (
      birthdateStatus === APIResponseStatus.NotStarted &&
      examinerOid &&
      personOid
    ) {
      dispatch(
        loadClerkEnrollmentOnrBirthdate({ personOid, oid: examinerOid }),
      );
    }
  }, [dispatch, birthdateStatus, examinerOid, personOid]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkEnrollmentOnrBirthdate());
    };
  }, [dispatch]);

  const birthdate =
    onrBirthdate?.oid === personOid ? onrBirthdate?.birthdate : '';

  return isViewMode ? (
    <div className="rows">
      <H3>{translateCommon(`enrollment.textFields.birthdate`)}</H3>
      <LoadingProgressIndicator displayBlock={true} isLoading={isLoading}>
        <Text>{birthdate}</Text>
      </LoadingProgressIndicator>
    </div>
  ) : (
    <LoadingProgressIndicator isLoading={isLoading}>
      <CustomTextField
        data-testid={`clerk-enrollment__details-fields__birthdate`}
        value={birthdate}
        label={translateCommon(`enrollment.textFields.birthdate`)}
        FormHelperTextProps={{ component: 'div' } as FormHelperTextProps}
        disabled={true}
      />
    </LoadingProgressIndicator>
  );
};
