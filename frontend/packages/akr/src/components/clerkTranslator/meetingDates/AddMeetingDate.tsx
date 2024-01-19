import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import {
  CustomButton,
  CustomDatePicker,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { addMeetingDate } from 'redux/reducers/meetingDate';
import { meetingDatesSelector } from 'redux/selectors/meetingDate';

export const AddMeetingDate = () => {
  const [value, setValue] = useState<Dayjs | null>(null);
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.addMeetingDate',
  });

  const {
    meetingDates: { meetingDates, status },
    addMeetingDate: { status: addMeetingDateStatus },
  } = useAppSelector(meetingDatesSelector);
  const isMeetingDateLoading = status === APIResponseStatus.InProgress;
  const isAddMeetingDateLoading =
    addMeetingDateStatus === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();

  const handleAddDate = () => {
    if (value) {
      dispatch(addMeetingDate(dayjs(value)));
    }
  };

  const isSelectedDateAlreadyTaken = () => {
    if (value) {
      const date = dayjs(value);

      return meetingDates.some((meetingDate) =>
        DateUtils.isDatePartEqual(meetingDate.date, date),
      );
    }

    return false;
  };

  const isAddButtonDisabled = () => {
    return (
      !value ||
      isSelectedDateAlreadyTaken() ||
      isMeetingDateLoading ||
      isAddMeetingDateLoading
    );
  };

  const renderDateAlreadyTakenInfo = () =>
    isSelectedDateAlreadyTaken() ? (
      <>
        <ErrorOutlineIcon />
        <Text>{t('meetingDateAlreadyExists')}</Text>
      </>
    ) : null;

  useNavigationProtection(!!value);

  return (
    <div className="columns gapped">
      <div className="rows gapped flex-grow-3">
        <Typography component="h2" variant="h3">
          {t('header')}
        </Typography>
        <div className="columns gapped">
          <CustomDatePicker
            value={value}
            setValue={setValue}
            label={t('datePicker.label')}
          />
          <LoadingProgressIndicator isLoading={isAddMeetingDateLoading}>
            <div className="columns gapped-xs">
              <CustomButton
                data-testid="meeting-dates-page__add-btn"
                variant={Variant.Outlined}
                color={Color.Secondary}
                startIcon={<AddIcon />}
                disabled={isAddButtonDisabled()}
                onClick={handleAddDate}
              >
                {t('buttons.add')}
              </CustomButton>
              {renderDateAlreadyTakenInfo()}
            </div>
          </LoadingProgressIndicator>
        </div>
      </div>
    </div>
  );
};
