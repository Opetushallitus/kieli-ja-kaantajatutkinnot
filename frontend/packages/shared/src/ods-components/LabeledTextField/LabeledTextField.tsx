import { OphTypography } from '@opetushallitus/oph-design-system';

import { CustomTextField } from '../../components/CustomTextField/CustomTextField';
import { LabeledTextFieldProps } from '../../components/LabeledTextField/LabeledTextField';

export type { LabeledTextFieldProps } from '../../components/LabeledTextField/LabeledTextField';

export const LabeledTextField = ({
  id,
  label,
  placeholder,
  error,
  gap,
  ...rest
}: LabeledTextFieldProps) => {
  const errorStyles = error ? { color: 'error.main' } : {};

  return (
    <div className={gap ? `rows ${gap}` : 'rows'}>
      <label htmlFor={id}>
        <OphTypography variant="label" component="span" sx={errorStyles}>
          {label}
        </OphTypography>
      </label>
      {placeholder && (
        <OphTypography variant="body1" sx={errorStyles}>
          {placeholder}
        </OphTypography>
      )}
      <CustomTextField id={id} error={error} {...rest} />
    </div>
  );
};
