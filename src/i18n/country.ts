import { parse as parseLanguage } from 'bcp-47';
import {
  Countries,
  CountryData,
  EstoniaSubdivisions,
  IndiaSubdivisions,
  JapanSubdivisions,
  NigeriaSubdivisions,
  PakistanSubdivisions,
  PhilippinesSubdivisions,
  SingaporeSubdivisions,
  SouthKoreaSubdivisions,
  SubdivisionData,
  ThailandSubdivisions,
  UnitedStatesSubdivisions,
  VietnamSubdivisions
} from '@/locales';

export function getSubdivisions(country: string): SubdivisionData[] {
  switch (country) {
    case 'EE':
      return EstoniaSubdivisions;
    case 'IN':
      return IndiaSubdivisions;
    case 'JP':
      return JapanSubdivisions;
    case 'KR':
      return SouthKoreaSubdivisions;
    case 'NG':
      return NigeriaSubdivisions;
    case 'PH':
      return PhilippinesSubdivisions;
    case 'PK':
      return PakistanSubdivisions;
    case 'SG':
      return SingaporeSubdivisions;
    case 'TH':
      return ThailandSubdivisions;
    case 'US':
      return UnitedStatesSubdivisions;
    case 'VN':
      return VietnamSubdivisions;
    default:
      throw new Error(`Unknow country ${country}.`);
  }
}

export function getCountryName(code: string, locale: string): string {
  // get result's language
  const { language } = parseLanguage(locale);

  if (language === undefined) {
    throw new Error(`Unsupported locale ${locale}.`);
  }

  // load data
  const country = countries.get(code);

  if (country === undefined) {
    throw new Error(`Unknow country ${code}.`);
  }

  const name = country.name[language];

  if (name === undefined) {
    throw new Error(`Unsupported locale ${locale}.`);
  }

  return name;
}

export function getSubdivisionName(code: string, locale: string): string {
  // get result's language
  const { language } = parseLanguage(locale);

  if (language === undefined) {
    throw new Error(`Unsupported locale ${locale}.`);
  }

  // load data
  const subdivision = subdivisions.get(code);

  if (subdivision === undefined) {
    throw new Error(`Unknow subdivision ${code}.`);
  }

  const name = subdivision.name[language];

  if (name === undefined) {
    throw new Error(`Unsupported locale ${locale}.`);
  }

  return name;
}

/**
 * Gets the preferred currency for the specified country.
 * @param country The country code, in ISO 3166-1 alpha-2 format.
 * @returns The currency code, in ISO 4217 Alphabetic format.
 */
export function getPreferredCurrency(country: string): string {
  switch (country) {
    case 'EE':
      return 'EUR';
    case 'IN':
      return 'INR';
    case 'JP':
      return 'JPY';
    case 'KR':
      return 'KRW';
    case 'NG':
      return 'NGN';
    case 'PH':
      return 'PHP';
    case 'PK':
      return 'PKR';
    case 'SG':
      return 'SGD';
    case 'TH':
      return 'THB';
    case 'US':
      return 'USD';
    case 'VN':
      return 'VND';
    default:
      throw new Error(`Unknown country ${country}.`);
  }
}

const countries = new Map<string, CountryData>();
const subdivisions = new Map<string, SubdivisionData>();

for (const c of Countries) {
  countries.set(c.id, c);

  for (const s of getSubdivisions(c.id)) {
    subdivisions.set(s.id, s);
  }
}
