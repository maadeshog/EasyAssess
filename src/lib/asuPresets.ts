export interface ScannerPrefillData {
  title: string;
  author: string;
  isbn: string;
  year: number;
  publisher: string;
  type: 'textbook' | 'reference' | 'ebook';
  source: string;
  language: string;
  system: 'Ayurveda' | 'Unani' | 'Siddha' | 'General';
  subject: string;
  syllabusCompliance: boolean;
  coverUrl: string;
  description: string;
}

export const PRESET_BOOKS: ScannerPrefillData[] = [
  {
    title: "Agnivesha's Charaka Samhita (Sutrasthana)",
    author: "Acharya Vidyadhar Shukla",
    isbn: "978-8-12-083984-7",
    year: 2021,
    publisher: "Chowkhamba Sanskrit Series Office",
    type: "textbook",
    source: "NCISM Central Repository",
    language: "Sanskrit",
    system: "Ayurveda",
    subject: "Samhita Sutra Study",
    syllabusCompliance: true,
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    description: "Authorized commentary on fundamental principles of Ayurveda, diagnostic parameters, and therapeutic measures conforming fully to latest NCISM syllabus guidelines."
  },
  {
    title: "Kulliyat-e-Asri (Unani Fundamentals)",
    author: "Hakim Kabiruddin",
    isbn: "978-8-17-080352-2",
    year: 2019,
    publisher: "Deoband Books Publication",
    type: "textbook",
    source: "Council for Research in Unani Medicine",
    language: "Urdu",
    system: "Unani",
    subject: "Kulliyat basic theories",
    syllabusCompliance: true,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    description: "A paramount academic guide comprising ASU principles (Mizaj, Akhlat, and Arkan) utilized for modern training in Unani systems of medicine."
  },
  {
    title: "Gunapadam Mooligai (Siddha Pharmacology)",
    author: "Vaidiya Murugesa Mudaliar",
    isbn: "978-8-12-611413-9",
    year: 2020,
    publisher: "Siddha Government Publications Board",
    type: "textbook",
    source: "National Institute of Siddha",
    language: "Tamil",
    system: "Siddha",
    subject: "Gunapadam (Materia Medica)",
    syllabusCompliance: true,
    coverUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400",
    description: "The authoritative syllabus companion detailing plant classifications, taste profiles, potencies, and post-digestive biochemical processes for Siddha curriculum."
  },
  {
    title: "Astanga Hrdayam of Vagbhata",
    author: "Professor K. R. Srikantha Murthy",
    isbn: "978-8-12-180017-4",
    year: 2022,
    publisher: "Krishnadas Academy",
    type: "reference",
    source: "Ayush Central Corpus Library",
    language: "English",
    system: "Ayurveda",
    subject: "Sutrasthana & Nidana",
    syllabusCompliance: true,
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    description: "An elegant translation and historical compilation of core Vagbhata treatises featuring comprehensive commentary matrices."
  }
];
