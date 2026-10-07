import { ophColors } from '@opetushallitus/oph-design-system';

// Semantic aliases used by the theme and the existing YKI Sass styles.
export const ykiColors = {
  'color-primary': ophColors.white,
  'color-background': ophColors.white,
  'color-secondary': ophColors.green2,
  'color-secondary-dark': ophColors.green3,
  'ods-green-6': ophColors.green6,
  'color-text-primary': ophColors.grey900,
  'color-divider': ophColors.grey200,
  'color-link-hover': ophColors.green3,
  'ods-lightblue-2': ophColors.lightBlue2,
  'ods-cyan-1': ophColors.cyan1,
  'color-grey-50': ophColors.grey50,
  'color-grey-200': ophColors.grey200,
  'color-grey-400': ophColors.grey400,
  'color-grey-700': ophColors.grey700,
  'color-green-600': ophColors.green3,
  'color-yellow-500': ophColors.yellow2,
  'color-red-500': ophColors.orange3,
};

export const ykiColorVariables = Object.fromEntries(
  Object.entries(ykiColors).map(([name, value]) => [`--yki-${name}`, value]),
);
