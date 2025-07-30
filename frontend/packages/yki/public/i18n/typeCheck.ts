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

export const commonTranslationsEn: CommonTranslations = commonEn;
export const publicTranslationsEn: PublicTranslations = publicEn;
export const commonTranslationsSv: CommonTranslations = commonSv;
export const publicTranslationsSv: PublicTranslations = publicSv;
