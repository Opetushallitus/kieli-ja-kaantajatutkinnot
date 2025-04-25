import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { useEffect } from 'react';
import {
  CustomButton,
  CustomModal,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { EnrollmentSkillsListTable } from 'components/clerkEnrollment/appointment/EnrollmentSkillsListTable';
import { useCommonTranslation, useExaminerTranslation } from 'configs/i18n';
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
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.enrollmentAppointment.historyModal',
  });
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
    <CustomModal onCloseModal={closeModal} open={open} modalTitle={t('title')}>
      <>
        <div style={{ width: '60vw' }} className="rows gapped-sm">
          <LoadingProgressIndicator displayBlock={true} isLoading={isLoading}>
            {!enrollmentHistory || enrollmentHistory?.length <= 0 ? (
              <Text>{t('noHistory')}</Text>
            ) : (
              enrollmentHistory.map(
                (
                  enrollment: ClerkEnrollmentAppointmentHistory,
                  idx: number,
                ) => (
                  <Accordion
                    defaultExpanded={idx === 0}
                    key={enrollment.enrollmentTime.toString()}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Text className="bold">
                        {ExamEventUtils.languageAndLevelText(
                          enrollment.examEvent.language,
                          ExamLevel.GOOD_AND_SATISFACTORY,
                          translateCommon,
                        )}
                        {', '}
                        {DateTimeUtils.renderDate(enrollment.examEvent.date)}
                      </Text>
                    </AccordionSummary>
                    <br />
                    <AccordionDetails>
                      <div className="rows margin-bottom-lg">
                        <Text className="bold">{t('examinerName')}</Text>
                        <Text>{enrollment.examinerName}</Text>
                      </div>
                      <EnrollmentSkillsListTable
                        grades={enrollment.grades}
                        enrollment={enrollment}
                      />
                    </AccordionDetails>
                  </Accordion>
                ),
              )
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
