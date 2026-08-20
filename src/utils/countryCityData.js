// ══════════════════════════════════════════════════════════════════════════════
// 🌍 OFFICIAL BILINGUAL COUNTRY & CITY/STATE DIRECTORY (ARABIC & ENGLISH)
// ══════════════════════════════════════════════════════════════════════════════

export const BILINGUAL_COUNTRIES = [
  { ar: 'الأردن', en: 'Jordan', iso: 'jo' },
  { ar: 'السعودية', en: 'Saudi Arabia', iso: 'sa' },
  { ar: 'الإمارات', en: 'United Arab Emirates', iso: 'ae' },
  { ar: 'الكويت', en: 'Kuwait', iso: 'kw' },
  { ar: 'قطر', en: 'Qatar', iso: 'qa' },
  { ar: 'البحرين', en: 'Bahrain', iso: 'bh' },
  { ar: 'عمان', en: 'Oman', iso: 'om' },
  { ar: 'مصر', en: 'Egypt', iso: 'eg' },
  { ar: 'فلسطين', en: 'Palestine', iso: 'ps' },
  { ar: 'العراق', en: 'Iraq', iso: 'iq' },
  { ar: 'لبنان', en: 'Lebanon', iso: 'lb' },
  { ar: 'المغرب', en: 'Morocco', iso: 'ma' },
  { ar: 'الجزائر', en: 'Algeria', iso: 'dz' },
  { ar: 'تونس', en: 'Tunisia', iso: 'tn' },
  { ar: 'ليبيا', en: 'Libya', iso: 'ly' },
  { ar: 'السودان', en: 'Sudan', iso: 'sd' },
  { ar: 'اليمن', en: 'Yemen', iso: 'ye' },
  { ar: 'تركيا', en: 'Turkey', iso: 'tr' },
  { ar: 'الولايات المتحدة', en: 'United States', iso: 'us' },
  { ar: 'المملكة المتحدة', en: 'United Kingdom', iso: 'gb' },
  { ar: 'كندا', en: 'Canada', iso: 'ca' },
  { ar: 'ألمانيا', en: 'Germany', iso: 'de' },
  { ar: 'فرنسا', en: 'France', iso: 'fr' },
  { ar: 'إيطاليا', en: 'Italy', iso: 'it' },
  { ar: 'إسبانيا', en: 'Spain', iso: 'es' },
  { ar: 'أستراليا', en: 'Australia', iso: 'au' },
  { ar: 'السويد', en: 'Sweden', iso: 'se' },
  { ar: 'النرويج', en: 'Norway', iso: 'no' },
  { ar: 'سويسرا', en: 'Switzerland', iso: 'ch' },
  { ar: 'هولندا', en: 'Netherlands', iso: 'nl' },
  { ar: 'بلجيكا', en: 'Belgium', iso: 'be' },
  { ar: 'ماليزيا', en: 'Malaysia', iso: 'my' },
  { ar: 'إندونيسيا', en: 'Indonesia', iso: 'id' },
  { ar: 'الصين', en: 'China', iso: 'cn' },
  { ar: 'اليابان', en: 'Japan', iso: 'jp' },
  { ar: 'كوريا الجنوبية', en: 'South Korea', iso: 'kr' },
  { ar: 'الهند', en: 'India', iso: 'in' },
  { ar: 'باكستان', en: 'Pakistan', iso: 'pk' },
  { ar: 'دولة أخرى / Other', en: 'Other Country', iso: null }
];

export const COUNTRY_CITIES_MAP = {
  jo: [
    { ar: 'عمان', en: 'Amman' },
    { ar: 'الزرقاء', en: 'Zarqa' },
    { ar: 'إربد', en: 'Irbid' },
    { ar: 'العقبة', en: 'Aqaba' },
    { ar: 'السلط / البلقاء', en: 'Al-Salt / Balqa' },
    { ar: 'مادبا', en: 'Madaba' },
    { ar: 'جرش', en: 'Jerash' },
    { ar: 'عجلون', en: 'Ajloun' },
    { ar: 'المفرق', en: 'Mafraq' },
    { ar: 'الكرك', en: 'Karak' },
    { ar: 'الطفيلة', en: 'Tafilah' },
    { ar: 'معان', en: 'Ma\'an' }
  ],
  sa: [
    { ar: 'الرياض', en: 'Riyadh' },
    { ar: 'جدة', en: 'Jeddah' },
    { ar: 'مكة المكرمة', en: 'Makkah' },
    { ar: 'المدينة المنورة', en: 'Madinah' },
    { ar: 'الدمام', en: 'Dammam' },
    { ar: 'الخبر', en: 'Al Khobar' },
    { ar: 'الظهران', en: 'Dhahran' },
    { ar: 'الطائف', en: 'Taif' },
    { ar: 'تبوك', en: 'Tabuk' },
    { ar: 'بريدة / القصيم', en: 'Buraidah / Qassim' },
    { ar: 'عنيزة', en: 'Unaizah' },
    { ar: 'أبها', en: 'Abha' },
    { ar: 'خميس مشيط', en: 'Khamis Mushait' },
    { ar: 'حائل', en: 'Hail' },
    { ar: 'الجبيل', en: 'Jubail' },
    { ar: 'الهفوف / الأحساء', en: 'Al Hofuf / Al Ahsa' },
    { ar: 'نجران', en: 'Najran' },
    { ar: 'جازان', en: 'Jazan' },
    { ar: 'ينبع', en: 'Yanbu' },
    { ar: 'القريات', en: 'Al Qurayyat' },
    { ar: 'عرعر', en: 'Arar' },
    { ar: 'سكاكا / الجوف', en: 'Sakaka / Al Jouf' },
    { ar: 'الباحة', en: 'Al Bahah' },
    { ar: 'بيشة', en: 'Bisha' },
    { ar: 'الخرج', en: 'Al Kharj' },
    { ar: 'القطيف', en: 'Qatif' },
    { ar: 'حفر الباطن', en: 'Hafar Al Batin' },
    { ar: 'رابغ', en: 'Rabigh' },
    { ar: 'شرورة', en: 'Sharurah' },
    { ar: 'وادي الدواسر', en: 'Wadi Ad Dawasir' },
    { ar: 'الدوادمي', en: 'Ad Dawadimi' },
    { ar: 'المجمعة', en: 'Al Majma\'ah' },
    { ar: 'صبيا', en: 'Sabya' },
    { ar: 'الرس', en: 'Ar Rass' }
  ],
  ae: [
    { ar: 'أبو ظبي', en: 'Abu Dhabi' },
    { ar: 'دبي', en: 'Dubai' },
    { ar: 'الشارقة', en: 'Sharjah' },
    { ar: 'عجمان', en: 'Ajman' },
    { ar: 'رأس الخيمة', en: 'Ras Al Khaimah' },
    { ar: 'الفجيرة', en: 'Fujairah' },
    { ar: 'أم القيوين', en: 'Umm Al Quwain' },
    { ar: 'العين', en: 'Al Ain' }
  ],
  kw: [
    { ar: 'مدينة الكويت / العاصمة', en: 'Kuwait City' },
    { ar: 'حولي', en: 'Hawalli' },
    { ar: 'السالمية', en: 'Salmiya' },
    { ar: 'الأحمدي', en: 'Al Ahmadi' },
    { ar: 'الفروانية', en: 'Al Farwaniyah' },
    { ar: 'الجهراء', en: 'Al Jahra' },
    { ar: 'مبارك الكبير', en: 'Mubarak Al-Kabeer' },
    { ar: 'صباح السالم', en: 'Sabah Al Salem' }
  ],
  qa: [
    { ar: 'الدوحة', en: 'Doha' },
    { ar: 'الريان', en: 'Al Rayyan' },
    { ar: 'الوكرة', en: 'Al Wakrah' },
    { ar: 'الخور', en: 'Al Khor' },
    { ar: 'لوسيل', en: 'Lusail' },
    { ar: 'أم صلال', en: 'Umm Salal' },
    { ar: 'الشحانية', en: 'Al Shahaniya' },
    { ar: 'الشمال', en: 'Al Shamal' }
  ],
  bh: [
    { ar: 'المنامة', en: 'Manama' },
    { ar: 'المحرق', en: 'Muharraq' },
    { ar: 'الرفاع', en: 'Riffa' },
    { ar: 'مدينة حمد', en: 'Hamad Town' },
    { ar: 'مدينة عيسى', en: 'Isa Town' },
    { ar: 'سترة', en: 'Sitra' },
    { ar: 'البديع', en: 'Budaiya' }
  ],
  om: [
    { ar: 'مسقط', en: 'Muscat' },
    { ar: 'صلالة', en: 'Salalah' },
    { ar: 'صحار', en: 'Sohar' },
    { ar: 'نزوى', en: 'Nizwa' },
    { ar: 'صور', en: 'Sur' },
    { ar: 'السيب', en: 'Seeb' },
    { ar: 'بوشر', en: 'Bawshar' },
    { ar: 'البريمي', en: 'Al Buraimi' },
    { ar: 'الرستاق', en: 'Rustaq' }
  ],
  eg: [
    { ar: 'القاهرة', en: 'Cairo' },
    { ar: 'الإسكندرية', en: 'Alexandria' },
    { ar: 'الجيزة', en: 'Giza' },
    { ar: 'المنصورة', en: 'Mansoura' },
    { ar: 'طنطا', en: 'Tanta' },
    { ar: 'بورسعيد', en: 'Port Said' },
    { ar: 'السويس', en: 'Suez' },
    { ar: 'الإسماعيلية', en: 'Ismailia' },
    { ar: 'أسيوط', en: 'Asyut' },
    { ar: 'سوهاج', en: 'Sohag' },
    { ar: 'الأقصر', en: 'Luxor' },
    { ar: 'أسوان', en: 'Aswan' },
    { ar: 'الغردقة', en: 'Hurghada' },
    { ar: 'شرم الشيخ', en: 'Sharm El Sheikh' }
  ],
  ps: [
    { ar: 'القدس', en: 'Jerusalem' },
    { ar: 'رام الله', en: 'Ramallah' },
    { ar: 'نابلس', en: 'Nablus' },
    { ar: 'الخليل', en: 'Hebron' },
    { ar: 'بيت لحم', en: 'Bethlehem' },
    { ar: 'جنين', en: 'Jenin' },
    { ar: 'طولكرم', en: 'Tulkarm' },
    { ar: 'قلقيلية', en: 'Qalqilya' },
    { ar: 'أريحا', en: 'Jericho' },
    { ar: 'غزة', en: 'Gaza' }
  ],
  iq: [
    { ar: 'بغداد', en: 'Baghdad' },
    { ar: 'أربيل', en: 'Erbil' },
    { ar: 'البصرة', en: 'Basra' },
    { ar: 'الموصل', en: 'Mosul' },
    { ar: 'النجف', en: 'Najaf' },
    { ar: 'كربلاء', en: 'Karbala' },
    { ar: 'السليمانية', en: 'Sulaymaniyah' },
    { ar: 'كركوك', en: 'Kirkuk' }
  ],
  lb: [
    { ar: 'بيروت', en: 'Beirut' },
    { ar: 'طرابلس', en: 'Tripoli' },
    { ar: 'صيدا', en: 'Sidon' },
    { ar: 'صور', en: 'Tyre' },
    { ar: 'جونيه', en: 'Jounieh' },
    { ar: 'زحلة', en: 'Zahle' },
    { ar: 'جبيل', en: 'Byblos' }
  ],
  ma: [
    { ar: 'الدار البيضاء', en: 'Casablanca' },
    { ar: 'الرباط', en: 'Rabat' },
    { ar: 'مراكش', en: 'Marrakech' },
    { ar: 'طنجة', en: 'Tangier' },
    { ar: 'فاس', en: 'Fes' },
    { ar: 'أكادير', en: 'Agadir' }
  ],
  dz: [
    { ar: 'الجزائر العاصمة', en: 'Algiers' },
    { ar: 'وهران', en: 'Oran' },
    { ar: 'قسنطينة', en: 'Constantine' },
    { ar: 'عنابة', en: 'Annaba' }
  ],
  tn: [
    { ar: 'تونس العاصمة', en: 'Tunis' },
    { ar: 'صفاقس', en: 'Sfax' },
    { ar: 'سوسة', en: 'Sousse' },
    { ar: 'بنزرت', en: 'Bizerte' }
  ],
  ly: [
    { ar: 'طرابلس', en: 'Tripoli' },
    { ar: 'بنغازي', en: 'Benghazi' },
    { ar: 'مصراتة', en: 'Misrata' },
    { ar: 'البيضاء', en: 'Bayda' }
  ],
  sd: [
    { ar: 'الخرطوم', en: 'Khartoum' },
    { ar: 'أم درمان', en: 'Omdurman' },
    { ar: 'بورتسودان', en: 'Port Sudan' }
  ],
  ye: [
    { ar: 'صنعاء', en: 'Sanaa' },
    { ar: 'عدن', en: 'Aden' },
    { ar: 'تعز', en: 'Taiz' },
    { ar: 'المكلا', en: 'Mukalla' }
  ],
  tr: [
    { ar: 'إسطنبول', en: 'Istanbul' },
    { ar: 'أنقرة', en: 'Ankara' },
    { ar: 'إزمير', en: 'Izmir' },
    { ar: 'بورصة', en: 'Bursa' },
    { ar: 'أنطاليا', en: 'Antalya' },
    { ar: 'طرابزون', en: 'Trabzon' }
  ],
  us: [
    { ar: 'كاليفورنيا', en: 'California' },
    { ar: 'نيويورك', en: 'New York' },
    { ar: 'تكساس', en: 'Texas' },
    { ar: 'فلوريدا', en: 'Florida' },
    { ar: 'إلينوي (شيكاغو)', en: 'Illinois (Chicago)' },
    { ar: 'واشنطن', en: 'Washington' },
    { ar: 'ماساتشوستس (بوسطن)', en: 'Massachusetts (Boston)' },
    { ar: 'فرجينيا', en: 'Virginia' },
    { ar: 'ميشيغان', en: 'Michigan' },
    { ar: 'بنسلفانيا', en: 'Pennsylvania' },
    { ar: 'جورجيا (أتلانتا)', en: 'Georgia (Atlanta)' },
    { ar: 'أوهايو', en: 'Ohio' }
  ],
  gb: [
    { ar: 'لندن', en: 'London' },
    { ar: 'مانشستر', en: 'Manchester' },
    { ar: 'برمنغهام', en: 'Birmingham' },
    { ar: 'إدنبرة', en: 'Edinburgh' },
    { ar: 'غلاسكو', en: 'Glasgow' },
    { ar: 'ليفربول', en: 'Liverpool' },
    { ar: 'ليدز', en: 'Leeds' },
    { ar: 'بريستول', en: 'Bristol' }
  ],
  ca: [
    { ar: 'تورونتو', en: 'Toronto' },
    { ar: 'مونتريال', en: 'Montreal' },
    { ar: 'فانكوفر', en: 'Vancouver' },
    { ar: 'كالغاري', en: 'Calgary' },
    { ar: 'أوتاوا', en: 'Ottawa' },
    { ar: 'إدمونتون', en: 'Edmonton' }
  ],
  de: [
    { ar: 'برلين', en: 'Berlin' },
    { ar: 'ميونخ', en: 'Munich' },
    { ar: 'فرانكفورت', en: 'Frankfurt' },
    { ar: 'هامبورغ', en: 'Hamburg' },
    { ar: 'كولونيا', en: 'Cologne' },
    { ar: 'شتوتغارت', en: 'Stuttgart' }
  ],
  fr: [
    { ar: 'باريس', en: 'Paris' },
    { ar: 'ليون', en: 'Lyon' },
    { ar: 'مارسيليا', en: 'Marseille' },
    { ar: 'نيس', en: 'Nice' },
    { ar: 'تولوز', en: 'Toulouse' },
    { ar: 'بوردو', en: 'Bordeaux' }
  ],
  au: [
    { ar: 'سيدني', en: 'Sydney' },
    { ar: 'ملبورن', en: 'Melbourne' },
    { ar: 'بريزبن', en: 'Brisbane' },
    { ar: 'بيرث', en: 'Perth' },
    { ar: 'أديلايد', en: 'Adelaide' }
  ]
};

export function getCitiesForCountry(countryIdentifier, lang = 'ar') {
  if (!countryIdentifier) return [];
  
  // Find country ISO
  let iso = null;
  const lower = String(countryIdentifier).toLowerCase();
  
  for (const c of BILINGUAL_COUNTRIES) {
    if (c.iso && (c.ar.toLowerCase() === lower || c.en.toLowerCase() === lower || c.iso === lower)) {
      iso = c.iso;
      break;
    }
  }

  if (iso && COUNTRY_CITIES_MAP[iso]) {
    return COUNTRY_CITIES_MAP[iso].map(city => ({
      name: lang === 'en' ? city.en : city.ar,
      ar: city.ar,
      en: city.en
    }));
  }

  return [];
}
