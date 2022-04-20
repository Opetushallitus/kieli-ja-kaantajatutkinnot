import { Typography, TypographyProps, TypographyVariant } from '@mui/material';

const variantInDiv = (variant: TypographyVariant, props: TypographyProps) => {
  const { children, ...rest } = props;

  return (
    <Typography variant={variant} {...rest}>
      {children}
    </Typography>
  );
};

export const H1 = (props: TypographyProps) => variantInDiv('h1', props);
export const H2 = (props: TypographyProps) => variantInDiv('h2', props);
export const H3 = (props: TypographyProps) => variantInDiv('h3', props);
export const H4 = (props: TypographyProps) => variantInDiv('h4', props);
export const H5 = (props: TypographyProps) => variantInDiv('h5', props);
export const H6 = (props: TypographyProps) => variantInDiv('h6', props);

export const Text = (props: TypographyProps) => variantInDiv('body1', props);
export const Caption = (props: TypographyProps) =>
  variantInDiv('caption', props);
