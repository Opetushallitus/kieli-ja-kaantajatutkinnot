import { OphTypography } from '@opetushallitus/oph-design-system';
import { ComponentProps } from 'react';

type OphTypographyProps = ComponentProps<typeof OphTypography>;

// YKI public renders typography with the oph-design-system component so its text
// styles come straight from the oph theme. Other apps keep the shared Text
// helpers, so this local module intentionally mirrors their API (H1..H3, Text).
const withVariant = (
  variant: OphTypographyProps['variant'],
  props: OphTypographyProps,
) => {
  const { children, ...rest } = props;

  return (
    <OphTypography variant={variant} {...rest}>
      {children}
    </OphTypography>
  );
};

export const H1 = (props: OphTypographyProps) => withVariant('h1', props);
export const H2 = (props: OphTypographyProps) => withVariant('h2', props);
export const H3 = (props: OphTypographyProps) => withVariant('h3', props);
export const H4 = (props: OphTypographyProps) => withVariant('h4', props);
export const H5 = (props: OphTypographyProps) => withVariant('h5', props);
export const Text = (props: OphTypographyProps) => withVariant('body1', props);
