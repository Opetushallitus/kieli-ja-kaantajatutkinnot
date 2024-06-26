import { H2, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ENROLLMENT_SKILL_PRICE } from 'utils/publicEnrollment';
export const ExamEventDetails = ({
  enrollment,
}: {
  enrollment: PublicEnrollment | ClerkEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview',
  });
  const translateCommon = useCommonTranslation();
  const publicEnrollment = useAppSelector(publicEnrollmentSelector);
  const freeEnrollmentDetails =
    (enrollment as ClerkEnrollment).freeEnrollmentDetails ||
    publicEnrollment.freeEnrollmentDetails;

  const skills = ['textualSkill', 'oralSkill'].filter(
    (skill) => !!enrollment[skill as keyof PartialExamsAndSkills],
  );

  const partialExams = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof PartialExamsAndSkills]);

  const getFreeEnrollmentsLeft = (skill: string) => {
    if (!freeEnrollmentDetails) {
      return '';
    }

    switch (skill) {
      case 'textualSkill':
        return freeEnrollmentDetails.freeTextualSkillLeft;
      case 'oralSkill':
        return freeEnrollmentDetails.freeOralSkillLeft;
      default:
        return '';
    }
  };

  const getEnrollmentSkillPrice = (skill: string) => {
    if (!freeEnrollmentDetails) {
      return ENROLLMENT_SKILL_PRICE;
    }

    switch (skill) {
      case 'textualSkill':
        return freeEnrollmentDetails.freeTextualSkillLeft > 0
          ? 0
          : ENROLLMENT_SKILL_PRICE;
      case 'oralSkill':
        return freeEnrollmentDetails.freeOralSkillLeft > 0
          ? 0
          : ENROLLMENT_SKILL_PRICE;
      default:
        return ENROLLMENT_SKILL_PRICE;
    }
  };

  const hasFreeEnrollments =
    freeEnrollmentDetails &&
    enrollment.freeEnrollmentBasis &&
    (freeEnrollmentDetails.freeTextualSkillLeft > 0 ||
      freeEnrollmentDetails.freeOralSkillLeft > 0);

  const displaySkillsList = () => (
    <div className="rows gapped-xxs">
      <div className="grid-3-columns gapped">
        <Text className="bold">
          {t('examEventDetails.selectedPartialExamsLabel')}
        </Text>
        {hasFreeEnrollments && (
          <Text className="bold">
            {t('educationDetails.freeEnrollmentsLeft')}
          </Text>
        )}
        <Text className="bold">{t('educationDetails.price')}</Text>
      </div>
      {skills.map((skill, i) => (
        <div key={i} className="grid-3-columns gapped">
          <Text>
            {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
          </Text>
          {(enrollment.isFree || enrollment.freeEnrollmentBasis) && (
            <Text>{getFreeEnrollmentsLeft(skill)} / 3</Text>
          )}
          <Text>{getEnrollmentSkillPrice(skill)}&euro;</Text>
        </div>
      ))}
    </div>
  );

  const displayExamsList = () => (
    <div className="rows gapped-xxs">
      <Text className="bold">
        {t('examEventDetails.selectedSkillsLabel')}
        {':'}
      </Text>
      <ul className="public-enrollment__grid__preview__bullet-list">
        {partialExams.map((skill, i) => (
          <Text key={i}>
            <li>
              {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
            </li>
          </Text>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="rows gapped">
      <H2>{t('examEventDetails.title')}</H2>
      {displaySkillsList()}
      {displayExamsList()}
      <div className="rows gapped-xxs">
        <Text className="bold">
          {t('examEventDetails.previousEnrollmentLabel')}
          {':'}
        </Text>
        <Text>
          {enrollment.previousEnrollment
            ? `${translateCommon('yes')}: ${enrollment.previousEnrollment}`
            : translateCommon('no')}
        </Text>
      </div>
    </div>
  );
};
