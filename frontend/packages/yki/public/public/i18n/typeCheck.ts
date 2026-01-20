// Tällä varmistetaan, että kaikilla käännöstiedostoilla on sama rakenne
// Export tarvitaan typecheckin takia vaikka tiedostoja ei importata minnekkään joten älä poista pls

/* eslint-disable no-restricted-imports */
import commonEn from './en-GB/common.json';
import publicEn from './en-GB/public.json';
import commonFi from './fi-FI/common.json';
import publicFi from './fi-FI/public.json';
import commonSv from './sv-SE/common.json';
import publicSv from './sv-SE/public.json';
/* eslint-enable no-restricted-imports */

type CommonTranslations = typeof commonFi;
type PublicTranslations = typeof publicFi;

export const commonTranslationsEnFi: CommonTranslations = commonEn;
export const publicTranslationsEnFi: PublicTranslations = publicEn;
export const commonTranslationsSvFi: CommonTranslations = commonSv;
export const publicTranslationsSvfi: PublicTranslations = publicSv;

type CommonTranslationsEn = typeof commonEn;
type PublicTranslationsEn = typeof publicEn;

export const commonTranslationsFiEn: CommonTranslationsEn = commonFi;
export const publicTranslationsFiEn: PublicTranslationsEn = publicFi;
export const commonTranslationsSvEn: CommonTranslationsEn = commonSv;
export const publicTranslationsSvEn: PublicTranslationsEn = publicSv;

type CommonTranslationsSv = typeof commonSv;
type PublicTranslationsSv = typeof publicSv;

export const commonTranslationsEnSv: CommonTranslationsSv = commonEn;
export const publicTranslationsEnSv: PublicTranslationsSv = publicEn;
export const commonTranslationsFiSv: CommonTranslationsSv = commonFi;
export const publicTranslationsFiSv: PublicTranslationsSv = publicFi;
