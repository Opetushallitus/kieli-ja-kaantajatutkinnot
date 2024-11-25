import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import {
  ComboBox,
  CustomButton,
  CustomModal,
  CustomTextField,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  TextFieldVariant,
  Variant,
} from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamGrades } from 'enums/app';
import {
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentGrades,
  GradedExams,
} from 'interfaces/clerkEnrollment';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  resetClerkEnrollmentAppointmentGrades,
  upsertClerkEnrollmentAppointmentGrades,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';

const gradeToComboBoxOption = (grade: string) => ({
  value: grade,
  label: grade,
});

export const GradeModal = ({
  open,
  skills,
  closeModal,
  enrollment,
  oid,
}: {
  open: boolean;
  skills: PartialExamsAndSkills;
  closeModal: () => void;
  enrollment: ClerkEnrollmentAppointment;
  oid: string;
}) => {
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const exams: Array<keyof GradedExams> = [
    'writingPartialExam',
    'readingComprehensionPartialExam',
    'speakingPartialExam',
    'speechComprehensionPartialExam',
  ];
  const selectedSkills = exams.filter(
    (skill: keyof GradedExams) => skills[skill],
  );
  const { grades, gradesSaveStatus } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );
  const [newGrades, setGrades] =
    useState<ClerkEnrollmentAppointmentGrades>(grades);
  const isLoading = gradesSaveStatus === APIResponseStatus.InProgress;
  const handleSaveGradesButtonClick = () => {
    dispatch(
      upsertClerkEnrollmentAppointmentGrades({
        enrollment,
        grades: newGrades,
        oid,
      }),
    );
  };

  useEffect(() => {
    if (gradesSaveStatus === APIResponseStatus.Success) {
      closeModal();
      dispatch(resetClerkEnrollmentAppointmentGrades());
    }
  }, [gradesSaveStatus, dispatch, closeModal]);

  const onSetComment =
    (exam: keyof GradedExams) => (event: ChangeEvent<HTMLTextAreaElement>) =>
      setGrades((prev) => ({
        ...prev,
        [exam]: {
          grade: prev[exam]?.grade ?? '',
          comment: event.target.value,
        },
      }));

  const onSetGrade = (exam: keyof GradedExams) => (grade?: string) =>
    setGrades((prev) => ({
      ...prev,
      [exam]: {
        comment: prev[exam]?.comment ?? '',
        grade,
      },
    }));

  const gradeValues = [
    {
      label: translateCommon(`enrollment.grades.${ExamGrades.GOOD}`),
      value: ExamGrades.GOOD,
    },
    {
      label: translateCommon(`enrollment.grades.${ExamGrades.SATISFACTORY}`),
      value: ExamGrades.SATISFACTORY,
    },
    {
      label: translateCommon(`enrollment.grades.${ExamGrades.FAILED}`),
      value: ExamGrades.FAILED,
    },
  ];

  return (
    <CustomModal
      onCloseModal={closeModal}
      open={open}
      modalTitle={'Anna arvosanat'}
    >
      <>
        <div style={{ width: '60vw' }} className="rows gapped-sm">
          <div style={{ margin: '2em' }} className="grid-3-columns gapped">
            <Text className="bold">Osakoe</Text>
            <Text className="bold">Arvosana</Text>
            <Text className="bold">Huomautuksia</Text>
            {selectedSkills.map((skill: keyof GradedExams, index) => (
              <Fragment key={index}>
                <Text>
                  {translateCommon(`enrollment.partialExamsAndSkills.${skill}`)}
                </Text>
                <ComboBox
                  autoHighlight
                  values={gradeValues}
                  variant={TextFieldVariant.Outlined}
                  onChange={onSetGrade(skill)}
                  value={
                    newGrades[skill]?.grade
                      ? gradeToComboBoxOption(newGrades[skill]?.grade)
                      : null
                  }
                  disabled={isLoading}
                />
                <CustomTextField
                  value={newGrades[skill]?.comment ?? ''}
                  onChange={onSetComment(skill)}
                  disabled={isLoading}
                />
              </Fragment>
            ))}
          </div>
          <div className="columns gapped flex-end">
            <CustomButton
              onClick={closeModal}
              variant={Variant.Outlined}
              color={Color.Secondary}
              disabled={isLoading}
            >
              {translateCommon('cancel')}
            </CustomButton>
            <CustomButton
              onClick={handleSaveGradesButtonClick}
              variant={Variant.Contained}
              color={Color.Secondary}
              disabled={isLoading}
            >
              {translateCommon('save')}
            </CustomButton>
          </div>
        </div>
      </>
    </CustomModal>
  );
};
