export const formFieldsSettings = [
  // Institution Names
  {
    title: 'Institution Names',
    fields: [
      { key: 'InstitutionName', label: 'Institution Name (Bangla)' },
      { key: 'AraInstitutionName', label: 'Institution Name (Arabic)' },
      { key: 'EngInstitutionName', label: 'Institution Name (English)' },
    ],
  },

  // Addresses
  {
    title: 'Addresses',
    fields: [
      { key: 'Address', label: 'Address (Bengali)' },
      { key: 'AraAddress', label: 'Address (Arabic)' },
      { key: 'EngAddress', label: 'Address (English)' },
    ],
  },

  // Location Information
  {
    title: 'Location Information',
    fields: [
      { key: 'Village', label: 'Village' },
      { key: 'PostOffice', label: 'Post Office' },
      { key: 'PoliceStation', label: 'Police Station' },
      { key: 'District', label: 'District' },
      { key: 'AraVillage', label: 'Arabic Village' },
      { key: 'AraPostOffice', label: 'Arabic Post Office' },
      { key: 'AraPoliceStation', label: 'Arabic Police Station' },
      { key: 'AraDistrict', label: 'Arabic District' },
    ],
  },

  // Contact Information
  {
    title: 'Contact Information',
    fields: [
      { key: 'ContactNumber', label: 'Contact Number' },
      { key: 'AraContactNumber', label: 'Arabic Contact Number' },
      { key: 'SMSMobile', label: 'SMS Mobile' },
      { key: 'Email', label: 'Email Address', type: 'email' },
      { key: 'Website', label: 'Website URL', type: 'url' },
      { key: 'Youtube', label: 'Youtube URL', type: 'url' },
      { key: 'Facebook', label: 'Facebook URL', type: 'url' },
      { key: 'WhatsApp', label: 'WhatsApp Number', type: 'text' },
      { key: 'Telegram', label: 'Telegram Number', type: 'text' },
    ],
  },

  // Institution Details
  {
    title: 'Institution Details',
    fields: [
      { key: 'InstitutionCode', label: 'Institution Code', type: 'number' },
      { key: 'Elhaq', label: 'Elhaq' },
    ],
  },
];
