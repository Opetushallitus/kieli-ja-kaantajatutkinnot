import { Fragment } from 'react';
import { H3, Text } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { ClerkEnrollmentAppointmentGrades } from 'interfaces/clerkEnrollment';
import {
  PartialExams,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';

interface GradedPartialExams extends Omit<PartialExams, 'understandingSkill'> {}

export const EnrollmentSkillsListTable = ({
  enrollment,
  grades,
}: {
  enrollment: PartialExamsAndSkills;
  grades: ClerkEnrollmentAppointmentGrades;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails',
  });

  const partialTextualExams = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof GradedPartialExams]) as Array<
    keyof GradedPartialExams
  >;

  const partialOralExams = [
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof GradedPartialExams]) as Array<
    keyof GradedPartialExams
  >;

  const renderGrade = (grade: string) =>
    grade && grade !== '' ? translateCommon(`enrollment.grades.${grade}`) : '-';
  const renderComment = (comment: string) =>
    comment && comment !== '' ? comment : '-';

  const partialExamsRow = (exams: Array<keyof GradedPartialExams>) => {
    return exams.map((exam, idx) => (
      <Fragment key={exam}>
        {idx > 0 && <div />}
        <div className="rows">
          <Text>
            {translateCommon(`enrollment.partialExamsAndSkills.${exam}`)}
          </Text>
        </div>
        <Text>{renderGrade(grades && grades[exam]?.grade)}</Text>
        <Text>{renderComment(grades && grades[exam]?.comment)}</Text>
      </Fragment>
    ));
  };

  return (
    <div className="rows">
      <div className="grid-4-columns">
        <H3 className="margin-bottom-lg">{t('header.selectedSkills')}</H3>
        <H3 className="margin-bottom-lg">{t('header.selectedPartialExams')}</H3>
        <H3 className="margin-bottom-lg">{t('header.grades')}</H3>
        <H3 className="margin-bottom-lg">{t('header.gradeComments')}</H3>
      </div>

      {enrollment.textualSkill && (
        <div className="grid-4-columns">
          <Text>
            {translateCommon('enrollment.partialExamsAndSkills.textualSkill')}
          </Text>
          {partialExamsRow(partialTextualExams)}
        </div>
      )}

      {enrollment.oralSkill && (
        <div className="grid-4-columns">
          <Text>
            {translateCommon('enrollment.partialExamsAndSkills.oralSkill')}
          </Text>
          {partialExamsRow(partialOralExams)}
        </div>
      )}
    </div>
  );
};
