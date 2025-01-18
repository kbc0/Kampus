interface UniversityEmail {
  domain: string;
  universityKey: string;
  name: string;
}

export const UNIVERSITY_EMAILS: UniversityEmail[] = [
  { domain: '@std.bogazici.edu.tr', universityKey: 'Boğaziçi', name: 'Boğaziçi University' },
  { domain: '@metu.edu.tr', universityKey: 'ODTÜ', name: 'Middle East Technical University' },
  { domain: '@itu.edu.tr', universityKey: 'İTÜ', name: 'Istanbul Technical University' },
  { domain: '@ug.bilkent.edu.tr', universityKey: 'Bilkent', name: 'Bilkent University' },
  { domain: '@ku.edu.tr', universityKey: 'Koç', name: 'Koç University' },
  { domain: '@ogr.gsu.edu.tr', universityKey: 'Galatasaray', name: 'Galatasaray University' },
  { domain: '@hacettepe.edu.tr', universityKey: 'Hacettepe', name: 'Hacettepe University' },
  { domain: '@su.sabanciuniv.edu', universityKey: 'Sabancı', name: 'Sabancı University' },
];

export function validateUniversityEmail(email: string, selectedUniversity: string): string | null {
  const emailDomain = '@' + email.split('@')[1];
  const universityEmail = UNIVERSITY_EMAILS.find(u => u.domain === emailDomain);

  if (!universityEmail) {
    return 'Please use your university email address';
  }

  if (universityEmail.universityKey !== selectedUniversity) {
    return `This email doesn't match with selected university. Please use your ${universityEmail.name} email`;
  }

  return null;
}