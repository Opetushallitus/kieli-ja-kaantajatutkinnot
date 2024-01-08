import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import { CustomTextField, CustomTextFieldProps } from '../../components';

interface DatePickerProps {
  value: Dayjs | null;
  setValue: (value: Dayjs | null) => void;
  label?: string;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

type CustomDatePickerProps = DatePickerProps & CustomTextFieldProps;

export const CustomDatePicker = ({
  value,
  setValue,
  label = '',
  disabled = false,
  minDate,
  maxDate,
  error,
  helperText,
  showHelperText,
}: CustomDatePickerProps): JSX.Element => {
  const MIN_DATE = '1980-01-01';
  const MAX_DATE = '2050-01-01';

  const handleChange = (newValue: Dayjs | null) => {
    setValue(newValue);
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={dayjs.locale()}
    >
      <DesktopDatePicker
        className="custom-date-picker"
        label={label}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate ?? dayjs(MIN_DATE)}
        maxDate={maxDate ?? dayjs(MAX_DATE)}
        renderInput={(params) => {
          const textFieldParams = {
            ...params,
            error,
            helperText,
            showHelperText,
          };

          return <CustomTextField {...textFieldParams} />;
        }}
      />
    </LocalizationProvider>
  );
};
