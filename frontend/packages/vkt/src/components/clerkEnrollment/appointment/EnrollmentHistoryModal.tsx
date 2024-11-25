import { Fragment, useEffect } from 'react';
import {
  CustomButton,
  CustomModal,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { EnrollmentSkillsListTable } from 'components/clerkEnrollment/appointment/EnrollmentSkillsListTable';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLevel } from 'enums/app';
import { ClerkEnrollmentAppointmentHistory } from 'interfaces/clerkEnrollment';
import { loadClerkEnrollmentAppointmentHistory } from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamEventUtils } from 'utils/examEvent';

export const EnrollmentHistoryModal = ({
  open,
  closeModal,
  oid,
  enrollmentId,
}: {
  open: boolean;
  closeModal: () => void;
  oid: string;
  enrollmentId: number;
}) => {
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();
  const { historyStatus, enrollmentHistory } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );
  const isLoading = historyStatus === APIResponseStatus.InProgress;

  useEffect(() => {
    if (historyStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkEnrollmentAppointmentHistory({ enrollmentId, oid }));
    }
  }, [dispatch, historyStatus, enrollmentId, oid]);

  return (
    <CustomModal
      onCloseModal={closeModal}
      open={open}
      modalTitle={'Aiempien tutkintojen tiedot'}
    >
      <>
        <div style={{ width: '60vw' }} className="rows gapped-sm">
          <LoadingProgressIndicator displayBlock={true} isLoading={isLoading}>
            {enrollmentHistory &&
              enrollmentHistory.map(
                (enrollment: ClerkEnrollmentAppointmentHistory) => (
                  <Fragment key={enrollment.enrollmentTime.toString()}>
                    <Text className="bold">
                      {ExamEventUtils.languageAndLevelText(
                        enrollment.examEvent.language,
                        ExamLevel.GOOD_AND_SATISFACTORY,
                        translateCommon,
                      )}
                      {', '}
                      {DateTimeUtils.renderDate(enrollment.examEvent.date)}
                    </Text>
                    <br />
                    <EnrollmentSkillsListTable enrollment={enrollment} />
                  </Fragment>
                ),
              )}
          </LoadingProgressIndicator>
          <div className="columns gapped flex-end">
            <CustomButton
              onClick={closeModal}
              variant={Variant.Outlined}
              color={Color.Secondary}
              disabled={isLoading}
            >
              {translateCommon('close')}
            </CustomButton>
          </div>
        </div>
      </>
    </CustomModal>
  );
};
