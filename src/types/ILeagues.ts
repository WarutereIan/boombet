export interface ILeague {
  id: number;
  sport_id: number;
  section_id: number;
  slug: string;
  name_translations: {
    en: string;
    ru: string;
  };
  has_logo: boolean;
  logo: string;
  start_date: string;
  end_date: string;
  priority: number;
  host: {
    country: string;
    flag: string;
  };
  tennis_points: number;
  facts: [
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    },
    {
      name: string;
      value: string;
    }
  ];
  most_count: number;
}
