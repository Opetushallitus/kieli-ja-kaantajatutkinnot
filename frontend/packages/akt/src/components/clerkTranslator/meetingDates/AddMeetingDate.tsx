import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  CustomButton,
  DatePicker,
  H3,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils, StringUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { addMeetingDate } from 'redux/actions/meetingDate';
import { meetingDatesSelector } from 'redux/selectors/meetingDate';

export const AddMeetingDate = () => {
  const [value, setValue] = useState<string>('');
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.addMeetingDate',
  });

  const {
    meetingDates: { meetingDates, status },
  } = useAppSelector(meetingDatesSelector);
  const isLoading = status === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();

  const handleAddDate = () => {
    value && dispatch(addMeetingDate(dayjs(value)));
  };

  const isAddButtonDisabled = () => {
    if (value) {
      const date = dayjs(value);

      return meetingDates.some((meetingDate) =>
        DateUtils.isDatePartEqual(meetingDate.date, date)
      );
    }

    return true;
  };

  useNavigationProtection(!StringUtils.isBlankString(value));

  return (
    <div className="columns gapped">
      <div className="rows gapped flex-grow-3">
        <H3>{t('header')}</H3>
        <div className="columns gapped">
          <DatePicker
            value={value}
            setValue={setValue}
            label={t('datePicker.label')}
          />
          <LoadingProgressIndicator isLoading={isLoading}>
            <CustomButton
              data-testid="meeting-dates-page__add-btn"
              variant={Variant.Outlined}
              color={Color.Secondary}
              startIcon={<AddIcon />}
              disabled={isAddButtonDisabled() || isLoading}
              onClick={handleAddDate}
            >
              {t('buttons.add')}
            </CustomButton>
          </LoadingProgressIndicator>
        </div>
      </div>
    </div>
  );
};
