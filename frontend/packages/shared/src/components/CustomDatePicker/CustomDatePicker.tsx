import { CustomTextFieldProps, CustomTextField } from '../../components';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface DatePickerProps extends CustomTextFieldProps {
  value: Dayjs | null;
  setValue: (value: Dayjs | null) => void;
  label?: string;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  showToolbar?: boolean;
}

export const CustomDatePicker = ({
  value,
  setValue,
  label = '',
  disabled = false,
  minDate,
  maxDate,
  showToolbar = true,
  error,
  helperText,
  showHelperText,
}: DatePickerProps): JSX.Element => {
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
        showToolbar={showToolbar}
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
