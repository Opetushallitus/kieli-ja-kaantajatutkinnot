import {
  FormControl,
  FormControlLabel,
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

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  Education,
  EducationType,
  FreeBasisSource,
  HandleChange,
} from 'interfaces/publicEducation';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { loadPublicEducation } from 'redux/reducers/publicEducation';
import { startFileUpload } from 'redux/reducers/publicFileUpload';
import { publicEducationSelector } from 'redux/selectors/publicEducation';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';
import { FileUtils } from 'utils/file';

const UploadAttachments = () => {
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

  const { status: fileUploadStatus } = useAppSelector(publicFileUploadSelector);

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      dispatch(startFileUpload({ file: files[0], examEventId: id }));
    }
  };

  return (
    <>
      <H3>{t('title')}</H3>
      <LoadingProgressIndicator
        isLoading={fileUploadStatus === APIResponseStatus.InProgress}
      >
        <FileUpload
          accept="application/pdf,image/jpeg,image/png,image/heic,image/tiff,image/webp"
          onChange={handleFileUpload}
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
    </>
  );
};

const SelectEducation = ({ handleChange }: { handleChange: HandleChange }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.educationDetails',
  });

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value !== EducationType.None, {
      type: event.target.value as EducationType,
      source: FreeBasisSource.User,
    });
  };

  return (
    <fieldset className="public-enrollment__grid__education-details">
      <legend>
        <H3>{t('education')}</H3>
      </legend>
      <FormControl error={false}>
        <RadioGroup onChange={handleRadioChange}>
          <FormControlLabel
            className="radio-group-label"
            value={EducationType.None}
            control={<Radio />}
            label={t('no')}
          />
          <FormControlLabel
            className="radio-group-label"
            value={EducationType.MatriculationExam}
            control={<Radio />}
            label={t('highschool')}
          />
          <FormControlLabel
            className="radio-group-label"
            value={EducationType.HigherEducationConcluded}
            control={<Radio />}
            label={t('college')}
          />
          <FormControlLabel
            className="radio-group-label"
            value={EducationType.HigherEducationEnrolled}
            control={<Radio />}
            label={t('collegeEnrolled')}
          />
        </RadioGroup>
      </FormControl>
    </fieldset>
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
}: {
  handleChange: HandleChange;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.fillContactDetails.educationDetails',
  });
  const dispatch = useAppDispatch();

  const { status: educationStatus, education: educations } = useAppSelector(
    publicEducationSelector,
  );
  const { isFree, freeEnrollmentBasis } = useAppSelector(
    publicEnrollmentSelector,
  ).enrollment;

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

  return (
    <div className="margin-top-lg rows gapped">
      <H2>{t('educationInfoTitle')}</H2>
      <LoadingProgressIndicator isLoading={isEducationLoading}>
        {foundSuitableEducationDetails && (
          <EducationList handleChange={handleChange} educations={educations} />
        )}
      </LoadingProgressIndicator>
      {!isEducationLoading && !foundSuitableEducationDetails && (
        <>
          <SelectEducation handleChange={handleChange} />
          {freeEnrollmentBasis && isFree && <UploadAttachments />}
        </>
      )}
    </div>
  );
};
