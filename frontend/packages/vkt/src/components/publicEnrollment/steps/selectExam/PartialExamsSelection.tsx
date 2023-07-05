import {
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { H3 } from 'shared/components';
import { Color } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

enum YesNo {
  Yes = 'yes',
  No = 'no',
}

const CheckboxField = ({
  enrollment,
  fieldName,
  onClick,
  disabled,
  error,
  describedBy,
}: {
  enrollment: PublicEnrollment;
  fieldName: keyof PartialExamsAndSkills;
  onClick: (fieldName: keyof PartialExamsAndSkills) => void;
  disabled: boolean;
  error: boolean;
  describedBy: string;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <FormControlLabel
      control={
        <Checkbox
          data-testid={`enrollment-checkbox-${fieldName}`}
          onClick={() => onClick(fieldName)}
          color={Color.Secondary}
          checked={enrollment[fieldName]}
          disabled={disabled}
          aria-describedby={describedBy}
        />
      }
      label={translateCommon(`enrollment.partialExamsAndSkills.${fieldName}`)}
      className={error ? 'checkbox-error' : ''}
    />
  );
};

export const PartialExamsSelection = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid: (isValid: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.partialExamsSelection',
  });

  const dispatch = useAppDispatch();
  const [dirtyFullExam, setDirtyFullExam] = useState(!!enrollment.id);

  const isSkillsSelected = enrollment.textualSkill || enrollment.oralSkill;

  useEffect(() => {
    setValid(
      isSkillsSelected &&
        EnrollmentUtils.isValidTextualSkillAndPartialExams(enrollment) &&
        EnrollmentUtils.isValidOralSkillAndPartialExams(enrollment)
    );
  }, [setValid, enrollment, isSkillsSelected]);

  const toggleSkill = (fieldName: keyof PartialExamsAndSkills) => {
    const partialExamsToUncheck: Array<keyof PartialExamsAndSkills> = [];

    if (fieldName === 'oralSkill' && enrollment.oralSkill) {
      partialExamsToUncheck.push('speakingPartialExam');
      partialExamsToUncheck.push('speechComprehensionPartialExam');
    } else if (fieldName === 'textualSkill' && enrollment.textualSkill) {
      partialExamsToUncheck.push('writingPartialExam');
      partialExamsToUncheck.push('readingComprehensionPartialExam');
    }

    toggleField(fieldName);
    partialExamsToUncheck.forEach(uncheckPartialExam);
  };

  const toggleField = (fieldName: keyof PartialExamsAndSkills) => {
    dispatch(
      updatePublicEnrollment({
        [fieldName]: !enrollment[fieldName],
      })
    );
  };

  const uncheckPartialExam = (fieldName: keyof PartialExamsAndSkills) => {
    dispatch(
      updatePublicEnrollment({
        [fieldName]: false,
      })
    );
  };

  const handleFullExamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.value === YesNo.Yes;

    setDirtyFullExam(true);

    dispatch(
      updatePublicEnrollment({
        textualSkill: checked,
        oralSkill: checked,
        speakingPartialExam: checked,
        speechComprehensionPartialExam: checked,
        writingPartialExam: checked,
        readingComprehensionPartialExam: checked,
      })
    );
  };

  const allPartialExamsChecked =
    enrollment.writingPartialExam &&
    enrollment.readingComprehensionPartialExam &&
    enrollment.speakingPartialExam &&
    enrollment.speechComprehensionPartialExam;

  const somePartialExamsChecked =
    enrollment.writingPartialExam ||
    enrollment.readingComprehensionPartialExam ||
    enrollment.speakingPartialExam ||
    enrollment.speechComprehensionPartialExam;

  const hasFullExamError = showValidation && !dirtyFullExam;
  const hasSkillError =
    showValidation && !enrollment.oralSkill && !enrollment.textualSkill;
  const hasTextualSkillError =
    showValidation &&
    !EnrollmentUtils.isValidTextualSkillAndPartialExams(enrollment);
  const hasOralSkillError =
    showValidation &&
    !EnrollmentUtils.isValidOralSkillAndPartialExams(enrollment);

  return (
    <div className="rows">
      <FormControl component="fieldset">
        <FormLabel component="legend" className="heading-label">
          {t('doFullExam')}
        </FormLabel>
        <RadioGroup
          className="rows gapped-xxs"
          name="full-exam-group"
          value={enrollment.hasPreviousEnrollment ? YesNo.Yes : YesNo.No}
          onChange={handleFullExamChange}
        >
          <FormControlLabel
            disabled={editingDisabled}
            value={YesNo.Yes}
            data-testid="enrollment-checkbox-full-exam"
            control={<Radio aria-describedby="full-exam-error" />}
            label={t('yesFullExam')}
            checked={allPartialExamsChecked}
            className={`margin-top-sm margin-left-sm ${
              hasFullExamError && 'checkbox-error'
            }`}
          />
          <FormControlLabel
            disabled={editingDisabled}
            value={YesNo.No}
            control={<Radio aria-describedby="full-exam-error" />}
            label={t('noFullExam')}
            checked={
              !allPartialExamsChecked &&
              (dirtyFullExam || somePartialExamsChecked)
            }
            className={`margin-left-sm ${hasFullExamError && 'checkbox-error'}`}
          />
        </RadioGroup>
        {hasFullExamError && (
          <FormHelperText id="full-exam-error" error={true}>
            {translateCommon('errors.customTextField.required')}
          </FormHelperText>
        )}
      </FormControl>
      <Collapse
        orientation="vertical"
        in={!allPartialExamsChecked && (dirtyFullExam || isSkillsSelected)}
      >
        <div className="margin-top-lg rows gapped-xxs">
          <H3>{t('skillsTitle')}</H3>
          <div className="rows margin-left-lg">
            <CheckboxField
              enrollment={enrollment}
              fieldName={'textualSkill'}
              onClick={toggleSkill}
              disabled={editingDisabled}
              error={hasSkillError}
              describedBy="skill-selection-error"
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'oralSkill'}
              onClick={toggleSkill}
              disabled={editingDisabled}
              error={hasSkillError}
              describedBy="skill-selection-error"
            />
          </div>
          {hasSkillError && (
            <FormHelperText id="skill-selection-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </div>
      </Collapse>
      <Collapse
        orientation="vertical"
        in={!allPartialExamsChecked && isSkillsSelected}
      >
        <H3 className="margin-top-lg">{t('partialExamsTitle')}</H3>
      </Collapse>
      <div>
        <Collapse
          orientation="vertical"
          in={!allPartialExamsChecked && enrollment.textualSkill}
          className="public-enrollment__grid__partial-exam-selection"
        >
          <div className="margin-top-lg rows gapped-xxs">
            <H3>{t('textualSkill')}</H3>
            <CheckboxField
              enrollment={enrollment}
              fieldName={'writingPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasTextualSkillError}
              describedBy="textual-skill-selection-error"
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'readingComprehensionPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasTextualSkillError}
              describedBy="textual-skill-selection-error"
            />
          </div>
          {hasTextualSkillError && (
            <FormHelperText id="textual-skill-selection-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </Collapse>
        <Collapse
          orientation="vertical"
          in={!allPartialExamsChecked && enrollment.oralSkill}
          className="public-enrollment__grid__partial-exam-selection"
        >
          <div className="margin-top-lg rows gapped-xxs">
            <H3>{t('oralSkill')}</H3>
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speakingPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasOralSkillError}
              describedBy="oral-skill-selection-error"
            />
            <CheckboxField
              data-testid="enrollment-checkbox-speech-comprehension-partial-exam"
              enrollment={enrollment}
              fieldName={'speechComprehensionPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasOralSkillError}
              describedBy="oral-skill-selection-error"
            />
          </div>
          {hasOralSkillError && (
            <FormHelperText id="oral-skill-selection-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </Collapse>
      </div>
    </div>
  );
};
