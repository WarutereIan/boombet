export interface ITeam {
  id: number;
  sport_id: number;
  category_id: number;
  venue_id: number;
  manager_id: number;
  slug: string;
  name: string;
  has_logo: boolean;
  logo: string;
  name_translations: {
    en: string;
    ru: string;
    de: string;
    es: string;
    fr: string;
    zh: string;
    tr: string;
    el: string;
    it: string;
    nl: string;
    pt: string;
  };
  name_short: string;
  name_full: string;
  name_code: string;
  has_sub: boolean;
  gender: string;
  is_nationality: boolean;
  country_code: string;
  country: string;
  flag: string;
  foundation: any;
  details: any;
}
