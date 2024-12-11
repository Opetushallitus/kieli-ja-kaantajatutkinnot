import { Fragment } from 'react';
import { DateUtils } from 'shared/utils';

import { useExaminerTranslation } from 'configs/i18n';
import { EnrollmentAppointmentStatus } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';

export const ExaminerExamDatesSummary = ({
  examiner,
}: {
  examiner: ExaminerDetails;
}) => {
  const { examEvents } = examiner;
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerOverview.publicInformation',
  });

  return examEvents.length === 0 ? (
    t('labels.undefined')
  ) : (
    <>
      {examEvents.map(({ date, maxParticipants, enrollments }, i) => {
        const newline = examEvents.length > 1 && i > 0;
        const isFull =
          maxParticipants &&
          enrollments.filter(
            ({ status }) => status === EnrollmentAppointmentStatus.COMPLETED,
          ).length >= maxParticipants;

        return (
          <Fragment key={i}>
            {newline && <br />}
            {isFull && (
              <>
                <s>{DateUtils.formatOptionalDate(date)}</s>&nbsp;
                {t('labels.full')}
              </>
            )}
            {!isFull && DateUtils.formatOptionalDate(date)}
          </Fragment>
        );
      })}
    </>
  );
};
