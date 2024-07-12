import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useEffect } from 'react';
import {
  FileUpload,
  H2,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  Education,
  EducationType,
  FreeBasisSource,
  HandleChange,
} from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { loadPublicEducation } from 'redux/reducers/publicEducation';
import { startFileUpload } from 'redux/reducers/publicFileUpload';
import { publicEducationSelector } from 'redux/selectors/publicEducation';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';
import { EnrollmentUtils } from 'utils/enrollment';
import { FileUtils } from 'utils/file';

const UploadAttachments = ({
  isAttachmentsValid,
  showValidation,
}: {
  isAttachmentsValid: boolean;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.educationDetails.uploadAttachment',
  });

  const dispatch = useAppDispatch();
  const { id } = useAppSelector(publicEnrollmentSelector)
    .examEvent as PublicExamEvent;
  const { freeEnrollmentBasis } = useAppSelector(
    publicEnrollmentSelector,
  ).enrollment;
  const showError = showValidation && !isAttachmentsValid;

  const { status: fileUploadStatus } = useAppSelector(publicFileUploadSelector);

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      dispatch(startFileUpload({ file: files[0], examEventId: id }));
    }
  };

  return (
    <>
      <H3>{t('title')}</H3>
      <Text>{t('helpText1')}</Text>
      <Text>{t('helpText2')}</Text>
      <LoadingProgressIndicator
        isLoading={fileUploadStatus === APIResponseStatus.InProgress}
      >
        <FileUpload
          accept="application/pdf,image/jpeg,image/png,image/heic,image/tiff,image/webp"
          onChange={handleFileUpload}
          error={showError}
        />
      </LoadingProgressIndicator>
      {freeEnrollmentBasis?.attachments &&
        freeEnrollmentBasis?.attachments.map((a) => (
          <div key={a.id}>
            <Text>
              {a.name}&nbsp;({FileUtils.getReadableFileSize(a.size)})
            </Text>
          </div>
        ))}
      {showError && (
        <FormHelperText id="has-select-education-error" error={true}>
          {translateCommon('errors.customTextField.required')}
        </FormHelperText>
      )}
    </>
  );
};

const SelectEducation = ({
  enrollment,
  handleChange,
  showValidation,
  isEducationValid,
}: {
  enrollment: PublicEnrollment;
  handleChange: HandleChange;
  showValidation: boolean;
  isEducationValid: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.educationDetails',
  });

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value !== EducationType.None, {
      type: event.target.value as EducationType,
      source: FreeBasisSource.User,
    });
  };

  const selectedType =
    enrollment.freeEnrollmentBasis && enrollment.freeEnrollmentBasis.type;

  const showError = showValidation && !isEducationValid;

  return (
    <>
      <Text>{t('educationSelectHelpText')}</Text>
      <Text>{t('educationSelectChooseOne')}</Text>
      <fieldset className="public-enrollment__grid__education-details margin-top-sm">
        <legend>
          <H3>{t('education')}</H3>
        </legend>
        <FormControl error={showError}>
          <RadioGroup onChange={handleRadioChange}>
            <FormControlLabel
              value={EducationType.None}
              control={<Radio />}
              label={t('no')}
              checked={selectedType === EducationType.None}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
            <FormControlLabel
              value={EducationType.MatriculationExam}
              control={<Radio />}
              label={t('highschool')}
              checked={selectedType === EducationType.MatriculationExam}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
            <FormControlLabel
              value={EducationType.HigherEducationConcluded}
              control={<Radio />}
              label={t('college')}
              checked={selectedType === EducationType.HigherEducationConcluded}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
            <FormControlLabel
              value={EducationType.HigherEducationEnrolled}
              control={<Radio />}
              label={t('collegeEnrolled')}
              checked={selectedType === EducationType.HigherEducationEnrolled}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
          </RadioGroup>
          {showError && (
            <FormHelperText id="has-select-education-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </FormControl>
      </fieldset>
    </>
  );
};

const EducationList = ({
  educations,
  handleChange,
}: {
  educations: Array<Education>;
  handleChange: HandleChange;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.fillContactDetails.educationDetails',
  });

  useEffect(() => {
    if (educations && educations.length > 0) {
      handleChange(true, {
        type: (educations && educations[0].name) || EducationType.Unknown,
        source: FreeBasisSource.KOSKI,
      });
    } else {
      handleChange(false, undefined);
    }
  }, [educations, handleChange]);

  return (
    <div className="rows gapped">
      <Text>{t('freeEnrollmentDescription')}</Text>
      <ul className="public-enrollment__grid__preview__bullet-list">
        {educations.map((education) => (
          <li key={`education-type-${education.name}`}>
            <Text className="bold">{t(`type.${education.name}`)}</Text>
          </li>
        ))}
      </ul>
      <Text>{t('freeEnrollmentDescription2')}</Text>
    </div>
  );
};

export const EducationDetails = ({
  handleChange,
  showValidation,
  isEducationValid,
  isAttachmentsValid,
}: {
  handleChange: HandleChange;
  showValidation: boolean;
  isEducationValid: boolean;
  isAttachmentsValid: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.fillContactDetails.educationDetails',
  });
  const dispatch = useAppDispatch();

  const { enrollment, freeEnrollmentDetails } = useAppSelector(
    publicEnrollmentSelector,
  );
  const { status: educationStatus, education: educations } = useAppSelector(
    publicEducationSelector,
  );
  const { isFree, freeEnrollmentBasis } = enrollment;

  useEffect(() => {
    if (educationStatus === APIResponseStatus.NotStarted) {
      dispatch(loadPublicEducation());
    }
  }, [educationStatus, educations, dispatch]);

  const isEducationLoading =
    educationStatus === APIResponseStatus.InProgress ||
    educationStatus === APIResponseStatus.NotStarted;

  const foundSuitableEducationDetails =
    !isEducationLoading && educations && educations.length > 0;

  const attachmentsRequired =
    freeEnrollmentBasis &&
    freeEnrollmentBasis.type !== EducationType.None &&
    isFree;

  return (
    EnrollmentUtils.hasFreeEnrollmentsLeft(freeEnrollmentDetails) && (
      <div className="margin-top-lg rows gapped">
        <H2>{t('educationInfoTitle')}</H2>
        {isEducationLoading && showValidation && (
          <FormHelperText
            className="margin-bottom-lg"
            id="education-loading-error"
            error={true}
          >
            {t('errorWaitEducations')}
          </FormHelperText>
        )}
        <LoadingProgressIndicator isLoading={isEducationLoading}>
          {foundSuitableEducationDetails && (
            <EducationList
              handleChange={handleChange}
              educations={educations}
            />
          )}
        </LoadingProgressIndicator>
        {!isEducationLoading && !foundSuitableEducationDetails && (
          <>
            <SelectEducation
              enrollment={enrollment}
              handleChange={handleChange}
              showValidation={showValidation}
              isEducationValid={isEducationValid}
            />
            {attachmentsRequired && (
              <UploadAttachments
                showValidation={showValidation}
                isAttachmentsValid={isAttachmentsValid}
              />
            )}
          </>
        )}
      </div>
    )
  );
};
