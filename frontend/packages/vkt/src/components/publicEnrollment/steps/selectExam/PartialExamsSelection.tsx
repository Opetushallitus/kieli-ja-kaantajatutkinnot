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
  setValid: (disabled: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.partialExamsSelection',
  });

  const [dirtyFullExam, setDirtyFullExam] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setValid(EnrollmentUtils.isValidPartialExamsAndSkills(enrollment));
  }, [setValid, enrollment]);

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
        understandingSkill: checked,
        speakingPartialExam: checked,
        speechComprehensionPartialExam: checked,
        writingPartialExam: checked,
        readingComprehensionPartialExam: checked,
      })
    );
  };

  const allChecked =
    enrollment.speakingPartialExam &&
    enrollment.speechComprehensionPartialExam &&
    enrollment.writingPartialExam &&
    enrollment.readingComprehensionPartialExam;

  const someChecked =
    enrollment.speakingPartialExam ||
    enrollment.speechComprehensionPartialExam ||
    enrollment.writingPartialExam ||
    enrollment.readingComprehensionPartialExam;

  const hasFullExamError = showValidation && !dirtyFullExam;
  const hasSkillError =
    showValidation && !enrollment.oralSkill && !enrollment.textualSkill;
  const hasSpeakingExamError =
    showValidation &&
    !enrollment.speakingPartialExam &&
    !enrollment.speechComprehensionPartialExam;
  const hasWritingExamError =
    showValidation &&
    !enrollment.writingPartialExam &&
    !enrollment.readingComprehensionPartialExam;

  return (
    <div className="rows gapped">
      <FormControl component="fieldset">
        <FormLabel component="legend" className="heading-label">
          {t('doFullExam')}
        </FormLabel>
        <RadioGroup
          name="full-exam-group"
          value={enrollment.hasPreviousEnrollment ? YesNo.Yes : YesNo.No}
          onChange={handleFullExamChange}
        >
          <FormControlLabel
            disabled={editingDisabled}
            value={YesNo.Yes}
            control={<Radio aria-describedby="full-exam-error" />}
            label={t('yesFullExam')}
            checked={allChecked}
            className={`margin-top-sm margin-left-sm ${
              hasFullExamError && 'checkbox-error'
            }`}
          />
          <FormControlLabel
            disabled={editingDisabled}
            value={YesNo.No}
            control={<Radio aria-describedby="full-exam-error" />}
            label={t('noFullExam')}
            checked={(dirtyFullExam || someChecked) && !allChecked}
            className={`margin-top-sm margin-left-sm ${
              hasFullExamError && 'checkbox-error'
            }`}
          />
        </RadioGroup>
        {hasFullExamError && (
          <FormHelperText id="full-exam-error" error={true}>
            {translateCommon('errors.customTextField.required')}
          </FormHelperText>
        )}
      </FormControl>
      <Collapse orientation="vertical" in={dirtyFullExam && !allChecked}>
        <div className="rows gapped-sm">
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
        in={(enrollment.textualSkill || enrollment.oralSkill) && !allChecked}
      >
        <H3>{t('partialExamsTitle')}</H3>
      </Collapse>
      <div>
        <Collapse
          orientation="vertical"
          in={enrollment.textualSkill && !allChecked}
          className="public-enrollment__grid__partial-exam-selection"
        >
          <div className="rows margin-top-sm gapped-sm">
            <H3>{t('textualSkill')}</H3>
            <CheckboxField
              enrollment={enrollment}
              fieldName={'writingPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasWritingExamError}
              describedBy="textual-exam-selection-error"
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'readingComprehensionPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasWritingExamError}
              describedBy="textual-exam-selection-error"
            />
          </div>
          {hasWritingExamError && (
            <FormHelperText id="textual-exam-selection-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </Collapse>
        <Collapse
          orientation="vertical"
          in={enrollment.oralSkill && !allChecked}
          className="public-enrollment__grid__partial-exam-selection"
        >
          <div className="rows margin-top-sm gapped-sm">
            <H3>{t('oralSkill')}</H3>
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speakingPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasSpeakingExamError}
              describedBy="oral-exam-selection-error"
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speechComprehensionPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasSpeakingExamError}
              describedBy="oral-exam-selection-error"
            />
          </div>
          {hasSpeakingExamError && (
            <FormHelperText id="oral-exam-selection-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </Collapse>
      </div>
    </div>
  );
};
