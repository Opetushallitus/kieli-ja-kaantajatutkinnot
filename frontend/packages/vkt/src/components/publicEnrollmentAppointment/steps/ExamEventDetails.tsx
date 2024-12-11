import { Divider } from '@mui/material';
import { H2, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { ENROLLMENT_APPOINTMENT_SKILL_PRICE } from 'utils/publicEnrollment';

const DesktopSkillsList = ({
  enrollment,
  clerkView,
}: {
  enrollment: PublicEnrollment | ClerkEnrollment;
  clerkView: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview',
  });
  const skills = ['textualSkill', 'oralSkill'].filter(
    (skill) => !!enrollment[skill as keyof PartialExamsAndSkills],
  );

  return (
    <div className="rows gapped-xxs">
      <div className="grid-3-columns gapped">
        <Text className="bold">
          {t('examEventDetails.desktop.selectedSkillsLabel')}
        </Text>
        {!clerkView && (
          <Text className="bold">{t('educationDetails.price')}</Text>
        )}
      </div>
      {skills.map((skill, i) => (
        <div key={i} className="grid-3-columns gapped">
          <Text>
            {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
          </Text>
          {!clerkView && (
            <Text>
              {ENROLLMENT_APPOINTMENT_SKILL_PRICE}
              &euro;
            </Text>
          )}
        </div>
      ))}
    </div>
  );
};

const DesktopExamsList = ({
  enrollment,
}: {
  enrollment: ClerkEnrollment | PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview.examEventDetails',
  });
  const translateCommon = useCommonTranslation();

  const partialExams = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof PartialExamsAndSkills]);

  return (
    <div className="rows gapped-xxs">
      <Text className="bold">
        {t('selectedPartialExamsLabel')}
        {':'}
      </Text>
      <ul className="public-enrollment__grid__preview__bullet-list">
        {partialExams.map((exam, i) => (
          <Text key={i}>
            <li>
              {translateCommon(`enrollment.partialExamsAndSkills.${exam}`)}
            </li>
          </Text>
        ))}
      </ul>
    </div>
  );
};

const PhoneSkillsAndExamsList = ({
  enrollment,
}: {
  enrollment: ClerkEnrollment | PublicEnrollment;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview',
  });
  const skills = ['textualSkill', 'oralSkill'].filter(
    (skill) => !!enrollment[skill as keyof PartialExamsAndSkills],
  );
  const partialExams = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ].filter((exam) => !!enrollment[exam as keyof PartialExamsAndSkills]);

  return (
    <>
      {skills.map((skill) => (
        <div key={skill} className="rows gapped">
          <div className="rows gapped-xxs">
            <Text>
              <b>
                {t('examEventDetails.phone.selectedSkillLabel')}:{' '}
                {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
              </b>
            </Text>
            <Text>
              <b>{t('educationDetails.freeEnrollmentsLeft')}</b>
            </Text>
            <Text>
              <b>{t('educationDetails.price')}</b>
            </Text>
            <Text>
              {ENROLLMENT_APPOINTMENT_SKILL_PRICE}
              &nbsp;&euro;
            </Text>
          </div>
          <Divider />
        </div>
      ))}
      <div className="rows gapped-xxs">
        <Text>
          <b>{t('examEventDetails.selectedPartialExamsLabel')}:</b>
        </Text>
        <ul>
          {partialExams.map((exam) => (
            <Text key={exam}>
              <li>
                {' '}
                {translateCommon(`enrollment.partialExamsAndSkills.${exam}`)}
              </li>
            </Text>
          ))}
        </ul>
      </div>
    </>
  );
};

export const ExamEventDetails = ({
  enrollment,
  clerkView = false,
}: {
  enrollment: PublicEnrollment | ClerkEnrollment;
  clerkView?: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.preview',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  return (
    <div className="rows gapped">
      <H2>{t('examEventDetails.title')}</H2>
      {isPhone && <PhoneSkillsAndExamsList enrollment={enrollment} />}
      {!isPhone && (
        <>
          <DesktopSkillsList enrollment={enrollment} clerkView={!!clerkView} />
          <DesktopExamsList enrollment={enrollment} />
        </>
      )}
      {!clerkView && (
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
      )}
    </div>
  );
};
