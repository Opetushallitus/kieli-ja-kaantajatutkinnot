import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect } from 'react';
import {
  FileUpload,
  H2,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { Education, HandleChange } from 'interfaces/publicEducation';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { loadPublicEducation } from 'redux/reducers/publicEducation';
import { startFileUpload } from 'redux/reducers/publicFileUpload';
import { publicEducationSelector } from 'redux/selectors/publicEducation';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';

const SelectEducation = ({ handleChange }: { handleChange: HandleChange }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.educationDetails',
  });

  const dispatch = useAppDispatch();
  const { id } = useAppSelector(publicEnrollmentSelector)
    .examEvent as PublicExamEvent;

  const { status: fileUploadStatus } = useAppSelector(publicFileUploadSelector);

  const handleRadioChange = () => {
    handleChange(true);
  };

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      dispatch(startFileUpload({ file: files[0], examEventId: id }));
    }
  };

  return (
    <>
      <fieldset className="public-enrollment__grid__education-details">
        <legend>
          <Text>
            <b>{t('education')}</b>
          </Text>
        </legend>
        <FormControl error={false}>
          <RadioGroup onChange={handleRadioChange}>
            <FormControlLabel
              className="radio-group-label"
              value={'1'}
              control={<Radio />}
              label={t('no')}
            />
            <FormControlLabel
              className="radio-group-label"
              value={'2'}
              control={<Radio />}
              label={t('highschool')}
            />
            <FormControlLabel
              className="radio-group-label"
              value={'3'}
              control={<Radio />}
              label={t('college')}
            />
            <FormControlLabel
              className="radio-group-label"
              value={'4'}
              control={<Radio />}
              label={t('collegeEnrolled')}
            />
          </RadioGroup>
        </FormControl>
      </fieldset>
      <LoadingProgressIndicator
        isLoading={fileUploadStatus === APIResponseStatus.InProgress}
      >
        <FileUpload
          accept="application/pdf,image/jpeg,image/png,image/heic,image/tiff,image/webp"
          onChange={handleFileUpload}
        />
      </LoadingProgressIndicator>
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
  useEffect(() => {
    if (educations && educations.length > 0) {
      handleChange(true, {
        type: (educations && educations[0].name) || '',
        source: 'koski',
      });
    } else {
      handleChange(false, undefined);
    }
  }, [educations, handleChange]);

  return educations.map((education) => (
    <span key={`education-type-${education.name}`}>{education.name}</span>
  ));
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

  useEffect(() => {
    if (educationStatus === APIResponseStatus.NotStarted) {
      dispatch(loadPublicEducation());
    }
  }, [educationStatus, educations, dispatch]);

  const isEducationLoading =
    educationStatus === APIResponseStatus.InProgress ||
    educationStatus === APIResponseStatus.NotStarted;

  return (
    <div className="margin-top-lg rows gapped">
      <H2>{t('educationInfoTitle')}</H2>
      <LoadingProgressIndicator isLoading={isEducationLoading}>
        {!isEducationLoading &&
          (educations && educations.length > 0 ? (
            <EducationList
              handleChange={handleChange}
              educations={educations}
            />
          ) : (
            <SelectEducation handleChange={handleChange} />
          ))}
      </LoadingProgressIndicator>
    </div>
  );
};
