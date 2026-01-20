import { Theme, TypographyProps } from '@mui/material';
import { SystemProps } from '@mui/system';
import { OphTypography } from '@opetushallitus/oph-design-system';

type OmittedSystemPropNames = keyof Omit<SystemProps<Theme>, 'color'>;
type OphTypographyProps = Omit<
  TypographyProps & {
    variant?:
      | 'button'
      | 'body1'
      | 'body2'
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'label';
  },
  OmittedSystemPropNames | 'paragraph' | 'variantMapping'
>;

const variant = (
  variant: NonNullable<OphTypographyProps['variant']>,
  props: OphTypographyProps,
) => {
  const { children, ...rest } = props;

  return (
    <OphTypography variant={variant} {...rest}>
      {children}
    </OphTypography>
  );
};

// ts-unused-exports:disable-next-line
export const H1 = (props: OphTypographyProps) => variant('h1', props);
// ts-unused-exports:disable-next-line
export const H2 = (props: OphTypographyProps) => variant('h2', props);
// ts-unused-exports:disable-next-line
export const H3 = (props: OphTypographyProps) => variant('h3', props);
// ts-unused-exports:disable-next-line
export const H4 = (props: OphTypographyProps) => variant('h4', props);
// ts-unused-exports:disable-next-line
export const H5 = (props: OphTypographyProps) => variant('h5', props);
export const Text = (props: OphTypographyProps) => variant('body1', props);
export const Label = (props: OphTypographyProps) => variant('label', props);
