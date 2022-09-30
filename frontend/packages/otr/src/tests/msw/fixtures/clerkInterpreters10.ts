import { ExaminationType } from 'enums/interpreter';

export const clerkInterpreters10 = [
  {
    id: 1,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: true,
    identityNumber: '060105A910A',
    lastName: 'Aaltonen',
    firstName: 'Anneli Anna',
    nickName: 'Anneli',
    email: 'anneli.aaltonen@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000001',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: true,
    street: 'Malminkatu 1',
    postalCode: '00100',
    town: 'Helsinki',
    country: 'Suomi',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 1,
          version: 0,
          fromLang: 'FI',
          toLang: 'DE',
          beginDate: '2022-05-14',
          endDate: '2023-11-14',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12341',
        },
      ],
      expiring: [],
      expired: [],
      expiredDeduplicated: [],
    },
  },
  {
    id: 2,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: true,
    identityNumber: '260875-9507',
    lastName: 'Alanen',
    firstName: 'Antti Kalle',
    nickName: 'Antti',
    email: 'antti.alanen@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000002',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: true,
    street: 'Runebergintie 2',
    postalCode: '01200',
    town: 'Turku',
    country: 'suomi',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 2,
          version: 0,
          fromLang: 'FI',
          toLang: 'EL',
          beginDate: '2021-08-15',
          endDate: '2023-02-15',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12342',
        },
      ],
      expiring: [],
      expired: [],
      expiredDeduplicated: [],
    },
  },
  {
    id: 3,
    version: 0,
    deleted: false,
    isIndividualised: false,
    hasIndividualisedAddress: false,
    identityNumber: '040352-904K',
    lastName: 'Eskola',
    firstName: 'Ella Iida',
    nickName: 'Ella',
    email: 'ella.eskola@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000003',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: false,
    street: 'Sibeliuksenkuja 3',
    postalCode: '06100',
    town: 'Hämeenlinna',
    country: 'SUOMI',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 3,
          version: 0,
          fromLang: 'FI',
          toLang: 'ES',
          beginDate: '2022-01-01',
          endDate: '2023-07-01',
          examinationType: ExaminationType.KKT,
          permissionToPublish: true,
          diaryNumber: '12343',
        },
      ],
      expiring: [],
      expired: [],
      expiredDeduplicated: [],
    },
  },
  {
    id: 4,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: true,
    identityNumber: '130208A919P',
    lastName: 'Hakala',
    firstName: 'Eero Kari',
    nickName: 'Eero',
    email: 'eero.hakala@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000004',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: true,
    street: 'Veturitie 4',
    postalCode: '13500',
    town: 'Kuopio',
    country: 'Finland',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 54,
          version: 0,
          fromLang: 'FI',
          toLang: 'SV',
          beginDate: '2022-05-14',
          endDate: '2023-11-14',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
        {
          id: 4,
          version: 0,
          fromLang: 'FI',
          toLang: 'ET',
          beginDate: '2021-11-18',
          endDate: '2023-05-18',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12344',
        },
      ],
      expiring: [],
      expired: [],
      expiredDeduplicated: [],
    },
  },
  {
    id: 5,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: false,
    identityNumber: '240636-9187',
    lastName: 'Heikkinen',
    firstName: 'Hanna Kerttu',
    nickName: 'Hanna',
    email: 'hanna.heikkinen@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000005',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: true,
    street: 'Pirkkolantie 123',
    postalCode: '31600',
    town: 'Lahti',
    country: '',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 5,
          version: 0,
          fromLang: 'FI',
          toLang: 'FR',
          beginDate: '2021-08-15',
          endDate: '2023-02-15',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12345',
        },
      ],
      expiring: [],
      expired: [
        {
          id: 67,
          version: 0,
          fromLang: 'FI',
          toLang: 'EN',
          beginDate: '2020-12-30',
          endDate: '2022-06-30',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
      ],
      expiredDeduplicated: [
        {
          id: 67,
          version: 0,
          fromLang: 'FI',
          toLang: 'EN',
          beginDate: '2020-12-30',
          endDate: '2022-06-30',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
      ],
    },
  },
  {
    id: 6,
    version: 0,
    deleted: false,
    isIndividualised: false,
    hasIndividualisedAddress: false,
    identityNumber: '080716A957T',
    lastName: 'Heinonen',
    firstName: 'Ilkka Marko',
    nickName: 'Ilkka',
    email: 'ilkka.heinonen@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000006',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: false,
    street: 'Mikonkatu 77',
    postalCode: '48600',
    town: 'Porvoo',
    regions: ['01'],
    qualifications: {
      effective: [],
      expiring: [],
      expired: [
        {
          id: 6,
          version: 0,
          fromLang: 'FI',
          toLang: 'IT',
          beginDate: '2020-12-30',
          endDate: '2022-06-30',
          examinationType: ExaminationType.KKT,
          permissionToPublish: true,
          diaryNumber: '12346',
        },
      ],
      expiredDeduplicated: [
        {
          id: 6,
          version: 0,
          fromLang: 'FI',
          toLang: 'IT',
          beginDate: '2020-12-30',
          endDate: '2022-06-30',
          examinationType: ExaminationType.KKT,
          permissionToPublish: true,
          diaryNumber: '12346',
        },
      ],
    },
  },
  {
    id: 7,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: true,
    identityNumber: '120137-9646',
    lastName: 'Hiltunen',
    firstName: 'Iiris Kristiina',
    nickName: 'Iiris',
    email: 'iiris.hiltunen@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000007',
    permissionToPublishPhone: true,
    otherContactInfo: 'Tulkintie 7, Kokkola',
    permissionToPublishOtherContactInfo: true,
    street: 'Aleksanterinkatu 24',
    postalCode: '54460',
    town: 'Vantaa',
    country: 'Suomi',
    regions: [],
    qualifications: {
      effective: [],
      expiring: [],
      expired: [
        {
          id: 7,
          version: 0,
          fromLang: 'FI',
          toLang: 'KO',
          beginDate: '2021-03-09',
          endDate: '2022-09-09',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12347',
        },
      ],
      expiredDeduplicated: [
        {
          id: 7,
          version: 0,
          fromLang: 'FI',
          toLang: 'KO',
          beginDate: '2021-03-09',
          endDate: '2022-09-09',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12347',
        },
      ],
    },
  },
  {
    id: 8,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: true,
    identityNumber: '180720A968M',
    lastName: 'Hirvonen',
    firstName: 'Jari Mikko',
    nickName: 'Jari',
    email: 'jari.hirvonen@example.invalid',
    permissionToPublishEmail: true,
    phoneNumber: '+358401000008',
    permissionToPublishPhone: false,
    permissionToPublishOtherContactInfo: true,
    street: 'Korkeavuorenkatu 53',
    postalCode: '70200',
    town: 'Järvenpää',
    country: 'suomi',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 8,
          version: 0,
          fromLang: 'FI',
          toLang: 'KTU',
          beginDate: '2021-08-15',
          endDate: '2023-02-15',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '12348',
        },
      ],
      expiring: [],
      expired: [
        {
          id: 55,
          version: 0,
          fromLang: 'FI',
          toLang: 'SV',
          beginDate: '2020-12-30',
          endDate: '2022-06-30',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
      ],
      expiredDeduplicated: [
        {
          id: 55,
          version: 0,
          fromLang: 'FI',
          toLang: 'SV',
          beginDate: '2020-12-30',
          endDate: '2022-06-30',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
      ],
    },
  },
  {
    id: 9,
    version: 0,
    deleted: false,
    isIndividualised: false,
    hasIndividualisedAddress: false,
    identityNumber: '020713A978U',
    lastName: 'Hämäläinen',
    firstName: 'Liisa Marjatta',
    nickName: 'Liisa',
    email: 'liisa.hämäläinen@example.invalid',
    permissionToPublishEmail: false,
    phoneNumber: '+358401000009',
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: false,
    street: 'Sörnäisten rantatie 371',
    postalCode: '95400',
    town: 'Kouvola',
    country: 'SUOMI',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 9,
          version: 0,
          fromLang: 'FI',
          toLang: 'LA',
          beginDate: '2022-01-01',
          endDate: '2023-07-01',
          examinationType: ExaminationType.KKT,
          permissionToPublish: true,
          diaryNumber: '12349',
        },
      ],
      expiring: [],
      expired: [],
      expiredDeduplicated: [],
    },
  },
  {
    id: 10,
    version: 0,
    deleted: false,
    isIndividualised: true,
    hasIndividualisedAddress: false,
    identityNumber: '130730-960R',
    lastName: 'Kallio',
    firstName: 'Juha Tapani',
    nickName: 'Juha',
    email: 'juha.kallio@example.invalid',
    permissionToPublishEmail: true,
    permissionToPublishPhone: true,
    permissionToPublishOtherContactInfo: true,
    street: 'Hietalahdenranta 8',
    town: 'Tampere',
    country: 'Finland',
    regions: [],
    qualifications: {
      effective: [
        {
          id: 10,
          version: 0,
          fromLang: 'FI',
          toLang: 'PL',
          beginDate: '2022-01-01',
          endDate: '2023-07-01',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
          diaryNumber: '123410',
        },
      ],
      expiring: [],
      expired: [
        {
          id: 68,
          version: 0,
          fromLang: 'FI',
          toLang: 'EN',
          beginDate: '2021-03-09',
          endDate: '2022-09-09',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
      ],
      expiredDeduplicated: [
        {
          id: 68,
          version: 0,
          fromLang: 'FI',
          toLang: 'EN',
          beginDate: '2021-03-09',
          endDate: '2022-09-09',
          examinationType: ExaminationType.EAT,
          permissionToPublish: true,
        },
      ],
    },
  },
];
