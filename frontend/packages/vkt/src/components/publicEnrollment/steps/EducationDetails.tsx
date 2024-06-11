import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  FileUpload,
  H2,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { startFileUpload } from 'redux/reducers/publicFileUpload';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';

export const EducationDetails = ({
  handleChange,
}: {
  handleChange: (isFree: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.educationDetails',
  });

  const { id } = useAppSelector(publicEnrollmentSelector)
    .examEvent as PublicExamEvent;
  const dispatch = useAppDispatch();

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
    <div className="margin-top-lg rows gapped">
      <H2>Koulutustiedot</H2>
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
          accept="application/pdf,image/jpeg,image/png"
          onChange={handleFileUpload}
        />
      </LoadingProgressIndicator>
    </div>
  );
};
