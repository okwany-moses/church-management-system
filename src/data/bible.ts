export interface Verse {
  number: number;
  english: string;
  kiswahili: string;
  luo: string;
}

export interface Chapter {
  chapterNumber: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  category: "Old Testament" | "New Testament";
  chapters: Chapter[];
}

export const BIBLE_BOOKS: Book[] = [
  {
    name: "Genesis",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 1,
            english: "In the beginning God created the heaven and the earth.",
            kiswahili: "Hapo mwanzo Mungu aliziumba mbingu na nchi.",
            luo: "E chakruok Nyasaye ne ochweyolo polo gi piny."
          },
          {
            number: 2,
            english: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
            kiswahili: "Nayo nchi ilikuwa ukiu, tena tupu, na giza lilikuwa juu ya uso wa vilindi vya maji; Roho ya Mungu ikatulia juu ya uso wa maji.",
            luo: "To piny ne onge ranyisi, kendo ne oonge gimoro; mudho ne nitie e wi dhiang'; kendo Roho mar Nyasaye ne ringore e wi pi."
          },
          {
            number: 3,
            english: "And God said, Let there be light: and there was light.",
            kiswahili: "Mungu akasema, Iwe nuru; ikawa nuru.",
            luo: "Moko Nyasaye nowacho ni, 'Ler mondo obedie': eka ler ne obedie."
          },
          {
            number: 4,
            english: "And God saw the light, that it was good: and God divided the light from the darkness.",
            kiswahili: "Mungu akaiona nuru, ya kuwa ni njema; Mungu akatenga nuru na giza.",
            luo: "Kendo Nyasaye ne oneno lerno ni ber: kendo Nyasaye nopogo ler gi mudho."
          },
          {
            number: 5,
            english: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
            kiswahili: "Mungu akaiita nuru Mchana, na giza akaliita Usiku. Ikawa jioni ikawa asubuhi, siku ya kwanza.",
            luo: "Kendo Nyasaye noluongo ler ni Odiechieng', kendo mudho noluongo ni Otieno. Eka odhiambo gi okinyi ne obedo siku mokuongo."
          }
        ]
      }
    ]
  },
  { name: "Exodus", category: "Old Testament", chapters: [] },
  { name: "Leviticus", category: "Old Testament", chapters: [] },
  { name: "Numbers", category: "Old Testament", chapters: [] },
  { name: "Deuteronomy", category: "Old Testament", chapters: [] },
  { name: "Joshua", category: "Old Testament", chapters: [] },
  { name: "Judges", category: "Old Testament", chapters: [] },
  { name: "Ruth", category: "Old Testament", chapters: [] },
  { name: "1 Samuel", category: "Old Testament", chapters: [] },
  { name: "2 Samuel", category: "Old Testament", chapters: [] },
  { name: "1 Kings", category: "Old Testament", chapters: [] },
  { name: "2 Kings", category: "Old Testament", chapters: [] },
  { name: "1 Chronicles", category: "Old Testament", chapters: [] },
  { name: "2 Chronicles", category: "Old Testament", chapters: [] },
  { name: "Ezra", category: "Old Testament", chapters: [] },
  { name: "Nehemiah", category: "Old Testament", chapters: [] },
  { name: "Esther", category: "Old Testament", chapters: [] },
  { name: "Job", category: "Old Testament", chapters: [] },
  {
    name: "Psalms",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 23,
        verses: [
          {
            number: 1,
            english: "The Lord is my shepherd; I shall not want.",
            kiswahili: "Bwana ndiye mchungaji wangu, Sitapungukiwa na kitu.",
            luo: "Yehova e jakwathna; ok nahawo gimoro duto."
          },
          {
            number: 2,
            english: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
            kiswahili: "Katika malisho ya majani mabichi hunilaza, Kando ya maji ya utulivu huniongoza.",
            luo: "Hulaza piny e piem lum mang'ich: otera e dho pi mothuolo ma kuyo."
          },
          {
            number: 3,
            english: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
            kiswahili: "Hunihuisha nafsi yangu; na kuniongoza katika njia za haki kwa ajili ya jina lake.",
            luo: "Huchoyo chunya: otera e yore mag ratiro nikech nyinge duong'."
          },
          {
            number: 4,
            english: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
            kiswahili: "Naam, nijapopita kati ya bonde la uvuli wa mauti, Sitahofia uovu, kwa maana Wewe upo pamoja nami; Gongo lako na fimbo yako vyanifariji.",
            luo: "Ee, kata ka awuotho dhano e holo mar kuyo mar tho, ok analuor richo duto: nimar in koda; ludhi gi luthni miyo gwenyo chunya."
          },
          {
            number: 5,
            english: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.",
            kiswahili: "Waandaa meza mbele yangu, machoni pa adui zangu; Umepaka kichwa changu mafuta, na kikombe changu kinafurika.",
            luo: "Ichano mesa e nyima e nyim wasika: iwiri e wiya gi mo; kikombena fuyo gi pi."
          },
          {
            number: 6,
            english: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.",
            kiswahili: "Hakika wema na fadhili zitanifuata siku zote za maisha yangu; Nami nitakaa nyumbani mwa Bwana milele.",
            luo: "Adier ber gi ng'wono noluwa e ndalo duto mag ngimana: kendo na dagi e od Yehova nyaka chieng'."
          }
        ]
      }
    ]
  },
  { name: "Proverbs", category: "Old Testament", chapters: [] },
  { name: "Ecclesiastes", category: "Old Testament", chapters: [] },
  { name: "Song of Solomon", category: "Old Testament", chapters: [] },
  { name: "Isaiah", category: "Old Testament", chapters: [] },
  { name: "Jeremiah", category: "Old Testament", chapters: [] },
  { name: "Lamentations", category: "Old Testament", chapters: [] },
  { name: "Ezekiel", category: "Old Testament", chapters: [] },
  { name: "Daniel", category: "Old Testament", chapters: [] },
  { name: "Hosea", category: "Old Testament", chapters: [] },
  { name: "Joel", category: "Old Testament", chapters: [] },
  { name: "Amos", category: "Old Testament", chapters: [] },
  { name: "Obadiah", category: "Old Testament", chapters: [] },
  { name: "Jonah", category: "Old Testament", chapters: [] },
  { name: "Micah", category: "Old Testament", chapters: [] },
  { name: "Nahum", category: "Old Testament", chapters: [] },
  { name: "Habakkuk", category: "Old Testament", chapters: [] },
  { name: "Zephaniah", category: "Old Testament", chapters: [] },
  { name: "Haggai", category: "Old Testament", chapters: [] },
  { name: "Zechariah", category: "Old Testament", chapters: [] },
  { name: "Malachi", category: "Old Testament", chapters: [] },
  {
    name: "Matthew",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 6,
        verses: [
          {
            number: 9,
            english: "After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.",
            kiswahili: "Basi nanyi salini hivi: Baba yetu uliye mbinguni, Jina lako litukuzwe.",
            luo: "Omiyo lamuuru kama: Wuonwa manie polo, nying'i mondo okwew."
          },
          {
            number: 10,
            english: "Thy kingdom come. Thy will be done in earth, as it is in heaven.",
            kiswahili: "Ufalme wako uje. Mapenzi yako yatimizwe hapa duniani kama huko mbinguni.",
            luo: "Lochu mondo obi. Gima idwaro mondo otimre e piny, kaka otimre e polo."
          },
          {
            number: 11,
            english: "Give us this day our daily bread.",
            kiswahili: "Utupe leo riziki yetu ya kila siku.",
            luo: "Emi miwa chiembwa mar odiechieng' ma kawuono."
          },
          {
            number: 12,
            english: "And forgive us our debts, as we forgive our debtors.",
            kiswahili: "Utusamehe deni zetu, kama sisi nasi tulivyowasamehe wadai wetu.",
            luo: "Kendo iwenywa kethowa, kaka wadendi wan waweyo ni joma oketho nwa."
          },
          {
            number: 13,
            english: "And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.",
            kiswahili: "Wala usitutie majaribuni, lakini utuokoe na yule mwovu. Kwa kuwa ufalme ni wako, na nguvu, na utukufu, milele. Amina.",
            luo: "Kendo kik itera e temruok, to kora mabor gi richo: Nimar loch, gi teko, gi duong' duto e mari, nyaka chieng'. Amen."
          }
        ]
      }
    ]
  },
  { name: "Mark", category: "New Testament", chapters: [] },
  { name: "Luke", category: "New Testament", chapters: [] },
  {
    name: "John",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 1,
            english: "In the beginning was the Word, and the Word was with God, and the Word was God.",
            kiswahili: "Hapo mwanzo kulikuwako Neno, naye Neno alikuwako kwa Mungu, naye Neno alikuwa Mungu.",
            luo: "E chakruok ne nitie Wach, kendo Wach ne ni gi Nyasaye, kendo Wach ne e Nyasaye oguru."
          },
          {
            number: 2,
            english: "The same was in the beginning with God.",
            kiswahili: "Huyo mwanzo alikuwako kwa Mungu.",
            luo: "En ne nitie e chakruok ka en gi Nyasaye."
          },
          {
            number: 3,
            english: "All things were made by him; and without him was not any thing made that was made.",
            kiswahili: "Vyote vilifanyika kwa huyo; wala pasipo yeye hakikufanyika cho chote kilichofanyika.",
            luo: "Gigo duto ne ochwe gigo; kendo ka onge en, to onge gimoro ma ne ochwe ma bende ne ochwe."
          },
          {
            number: 4,
            english: "In him was life; and the life was the light of men.",
            kiswahili: "Ndani yake ndimo ulimokuwa uzima, nao uziima ulikuwa nuru ya watu.",
            luo: "Ei Wach ne nitie ngima, kendo ngimano ne e ler mar dhano."
          },
          {
            number: 5,
            english: "And the light shineth in darkness; and the darkness comprehended it not.",
            kiswahili: "Nayo nuru yang'aa gizani, wala giza halikuiweza.",
            luo: "Ler rieny e mudho; kendo mudho ne ok onyalo dore."
          }
        ]
      }
    ]
  },
  { name: "Acts", category: "New Testament", chapters: [] },
  { name: "Romans", category: "New Testament", chapters: [] },
  { name: "1 Corinthians", category: "New Testament", chapters: [] },
  { name: "2 Corinthians", category: "New Testament", chapters: [] },
  { name: "Galatians", category: "New Testament", chapters: [] },
  { name: "Ephesians", category: "New Testament", chapters: [] },
  { name: "Philippians", category: "New Testament", chapters: [] },
  { name: "Colossians", category: "New Testament", chapters: [] },
  { name: "1 Thessalonians", category: "New Testament", chapters: [] },
  { name: "2 Thessalonians", category: "New Testament", chapters: [] },
  { name: "1 Timothy", category: "New Testament", chapters: [] },
  { name: "2 Timothy", category: "New Testament", chapters: [] },
  { name: "Titus", category: "New Testament", chapters: [] },
  { name: "Philemon", category: "New Testament", chapters: [] },
  { name: "Hebrews", category: "New Testament", chapters: [] },
  { name: "James", category: "New Testament", chapters: [] },
  { name: "1 Peter", category: "New Testament", chapters: [] },
  { name: "2 Peter", category: "New Testament", chapters: [] },
  { name: "1 John", category: "New Testament", chapters: [] },
  { name: "2 John", category: "New Testament", chapters: [] },
  { name: "3 John", category: "New Testament", chapters: [] },
  { name: "Jude", category: "New Testament", chapters: [] },
  { name: "Revelation", category: "New Testament", chapters: [] }
];
