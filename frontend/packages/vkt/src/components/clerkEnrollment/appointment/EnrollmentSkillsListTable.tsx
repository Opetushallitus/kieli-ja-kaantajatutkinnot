import { Fragment } from 'react';
import { H3, Text } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import {
  ClerkEnrollmentAppointmentGrades,
  GradedExams,
} from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';

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
  ].filter((exam) => !!enrollment[exam as keyof GradedExams]) as Array<
    keyof GradedExams
  >;

  const partialOralExams = [
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof GradedExams]) as Array<
    keyof GradedExams
  >;

  const renderGrade = (grade: string) =>
    grade && grade !== '' ? translateCommon(`enrollment.grades.${grade}`) : '-';
  const renderComment = (comment: string) =>
    comment && comment !== '' ? comment : '-';

  const partialExamsRow = (exams: Array<keyof GradedExams>) => {
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
