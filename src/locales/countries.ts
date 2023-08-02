export const Countries: CountryData[] = [
  {
    id: 'EE',
    name: {
      en: 'Estonia',
      th: 'เอสโตเนีย'
    }
  },
  {
    id: 'IN',
    name: {
      en: 'India',
      th: 'อินเดีย'
    }
  },
  {
    id: 'JP',
    name: {
      en: 'Japan',
      th: 'ญี่ปุ่น'
    }
  },
  {
    id: 'KR',
    name: {
      en: 'South Korea',
      th: 'เกาหลีใต้'
    }
  },
  {
    id: 'NG',
    name: {
      en: 'Nigeria',
      th: 'ไนจีเรีย'
    }
  },
  {
    id: 'PH',
    name: {
      en: 'Philippines',
      th: 'ฟิลิปปินส์'
    }
  },
  {
    id: 'PK',
    name: {
      en: 'Pakistan',
      th: 'ปากีสถาน'
    }
  },
  {
    id: 'SG',
    name: {
      en: 'Singapore',
      th: 'สิงคโปร์'
    }
  },
  {
    id: 'TH',
    name: {
      en: 'Thailand',
      th: 'ไทย',
    }
  },
  {
    id: 'US',
    name: {
      en: 'United States',
      th: 'สหรัฐอเมริกา'
    }
  },
  {
    id: 'VN',
    name: {
      en: 'Vietnam',
      th: 'เวียดนาม'
    }
  }
];

export interface CountryData {
  id: string;
  name: {
    [language: string]: string
  }
}
