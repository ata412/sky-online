const EVENT_PHOTO_IDS = [
  927641, 927647, 927859, 927860,
  930006, 930007, 930008, 930009, 930010, 930011, 930012,
  930013, 930014, 930015, 930016, 930017, 930018,
  930020, 930021, 930022, 930023, 930024, 930025, 930026,
];

const GATHERING_TITLES = {
  th: 'รวมพลคนสกายออนไลน์',
  en: 'SKY Online Gathering',
  zh: 'SKY Online 相聚活动',
  lo: 'ລວມພົນຄົນສະກາຍອອນລາຍ',
  my: 'SKY Online တွေ့ဆုံပွဲ',
  vi: 'Buổi gặp mặt SKY Online',
};

export function withLocalActivities(activities, locale) {
  const id = 'sky-gathering-20261010';
  return [
    {
      id,
      title: GATHERING_TITLES[locale] || GATHERING_TITLES.en,
      description: '',
      activity_date: '2026-10-10T12:00:00+07:00',
      image_url: '/activities/sky-gathering-20261010/927641.jpg',
      photos: EVENT_PHOTO_IDS.map((photoId) => ({
        id: `${id}-${photoId}`,
        image_url: `/activities/sky-gathering-20261010/${photoId}.jpg`,
      })),
    },
    ...activities.filter((activity) => activity.id !== id),
  ];
}
