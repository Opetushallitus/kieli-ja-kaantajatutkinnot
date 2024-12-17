import { Divider } from '@mui/material';
import { H2, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { ENROLLMENT_APPOINTMENT_SKILL_PRICE } from 'utils/publicEnrollment';

const allPartialExams = [
  'writingPartialExam',
  'readingComprehensionPartialExam',
  'speakingPartialExam',
  'speechComprehensionPartialExam',
];

const allSkills = ['textualSkill', 'oralSkill', 'understandingSkill'];

const getSelectedSkills = (enrollment: PublicEnrollment | ClerkEnrollment) => {
  return allSkills.filter(
    (skill) => !!enrollment[skill as keyof PartialExamsAndSkills],
  );
};

const getSelectedPartialExams = (
  enrollment: PublicEnrollment | ClerkEnrollment,
) => {
  return allPartialExams.filter(
    (exam) => !!enrollment[exam as keyof PartialExamsAndSkills],
  );
};

const isFullExamSelection = (
  enrollment: PublicEnrollment | ClerkEnrollment,
) => {
  return allPartialExams.every(
    (exam) => !!enrollment[exam as keyof PartialExamsAndSkills],
  );
};

const DesktopSkillsList = ({
  enrollment,
}: {
  enrollment: PublicEnrollment | ClerkEnrollment;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.steps.preview',
  });
  const skills = getSelectedSkills(enrollment);
  const isFullExam = isFullExamSelection(enrollment);

  return (
    <div className="rows gapped-xxs">
      <div className="grid-3-columns gapped">
        <Text className="bold">
          {t('examEventDetails.selectedSkillsLabel')}
        </Text>
        <Text className="bold">{t('examEventDetails.price')}</Text>
      </div>
      {isFullExam ? (
        <div className="grid-3-columns gapped">
          <Text>{t('examEventDetails.fullExam')}</Text>
          <Text>
            {2 * ENROLLMENT_APPOINTMENT_SKILL_PRICE}
            &euro;
          </Text>
        </div>
      ) : (
        <div className="grid-3-columns gapped">
          <Text>
            {skills
              .map((skill) =>
                translateCommon(`enrollment.partialExamsAndSkills.${skill}`),
              )
              .join(', ')}
          </Text>
          <Text>
            {Math.min(
              2 * ENROLLMENT_APPOINTMENT_SKILL_PRICE,
              skills.length * ENROLLMENT_APPOINTMENT_SKILL_PRICE,
            )}
            &euro;
          </Text>
        </div>
      )}
    </div>
  );
};

const DesktopExamsList = ({
  enrollment,
}: {
  enrollment: ClerkEnrollment | PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentAppointment.steps.preview.examEventDetails',
  });
  const translateCommon = useCommonTranslation();

  const partialExams = getSelectedPartialExams(enrollment);

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
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.steps.preview',
  });
  const skills = getSelectedSkills(enrollment);
  const selectedPartialExams = getSelectedPartialExams(enrollment);
  const isFullExam = isFullExamSelection(enrollment);

  if (isFullExam) {
    return (
      <div className="rows gapped">
        <Text>
          <b>{t('examEventDetails.selectedSkillsLabel')}:</b>
          <br />
          {t('examEventDetails.fullExam')}
        </Text>
        <Text>
          <b>{t('examEventDetails.price')}</b>
          <br />
          {2 * ENROLLMENT_APPOINTMENT_SKILL_PRICE}
          &nbsp;&euro;
        </Text>
      </div>
    );
  } else {
    return (
      <>
        {skills.map((skill) => (
          <div key={skill} className="rows gapped">
            <div className="rows gapped-xxs">
              <Text>
                <b>
                  {t('examEventDetails.selectedSkillsLabel')}:{' '}
                  {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
                </b>
              </Text>
              <Text>
                <b>{t('examEventDetails.price')}</b>
              </Text>
              <Text>
                {ENROLLMENT_APPOINTMENT_SKILL_PRICE}
                &nbsp;&euro;
              </Text>
            </div>
            <Divider />{' '}
          </div>
        ))}
        <div className="rows gapped-xxs">
          <Text>
            <b>{t('examEventDetails.selectedPartialExamsLabel')}:</b>
          </Text>
          <ul>
            {selectedPartialExams.map((exam) => (
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
  }
};

const PreviousEnrollment = ({
  enrollment,
}: {
  enrollment: PublicEnrollment | ClerkEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.steps.preview',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  if (isPhone) {
    return (
      <Text>
        <b>{t('examEventDetails.previousEnrollmentLabel')}:</b>
        <br />
        {enrollment.previousEnrollment
          ? `${translateCommon('yes')}: ${enrollment.previousEnrollment}`
          : translateCommon('no')}
      </Text>
    );
  } else {
    return (
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
    );
  }
};

export const ExamEventDetails = ({
  enrollment,
}: {
  enrollment: PublicEnrollment | ClerkEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.steps.preview',
  });
  const { isPhone } = useWindowProperties();
  const isFullExam = isFullExamSelection(enrollment);

  return (
    <div className="rows gapped">
      <H2>{t('examEventDetails.title')}</H2>
      {isPhone && <PhoneSkillsAndExamsList enrollment={enrollment} />}
      {!isPhone && isFullExam && <DesktopSkillsList enrollment={enrollment} />}
      {!isPhone && !isFullExam && (
        <>
          <DesktopSkillsList enrollment={enrollment} />
          <DesktopExamsList enrollment={enrollment} />
        </>
      )}
      <PreviousEnrollment enrollment={enrollment} />
    </div>
  );
};
