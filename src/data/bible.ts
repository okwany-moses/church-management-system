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
  {
    name: "Exodus",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 20,
        verses: [
          {
            number: 1,
            english: "And God spake all these words, saying,",
            kiswahili: "Mungu akanena maneno haya yote, akasema,",
            luo: "Kendo Nyasaye nowacho wechegi duto ni,"
          },
          {
            number: 2,
            english: "I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.",
            kiswahili: "Mimi ni BWANA, Mungu wako, niliyekutoa katika nchi ya Misri, katika nyumba ya utumwa.",
            luo: "An e Yehova Nyasaye mari, mane ogoli e piny Misri, e od wasumbini."
          },
          {
            number: 3,
            english: "Thou shalt have no other gods before me.",
            kiswahili: "Usiwe na miungu mingine ila mimi.",
            luo: "Kik ibed gi nyasaye machielo makiri an."
          }
        ]
      },
      {
        chapterNumber: 14,
        verses: [
          {
            number: 14,
            english: "The LORD shall fight for you, and ye shall hold your peace.",
            kiswahili: "BWANA atawapigania ninyi, nanyi mtanyamaza kimya.",
            luo: "Yehova nolweny neuru, kendo unubed mochoch."
          }
        ]
      }
    ]
  },
  {
    name: "Leviticus",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 19,
        verses: [
          {
            number: 18,
            english: "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself: I am the LORD.",
            kiswahili: "Usijilipize kisasi, wala kuwa na kinyongo juu ya wana wa watu wako; bali umpende jirani yako kama nafsi yako; Mimi ndimi BWANA.",
            luo: "Kik ichul kuor, kata mako kwinyo gi nyithind jogi, to mondo iher jirani mari kaka iherori iwuon: An e Yehova."
          }
        ]
      }
    ]
  },
  {
    name: "Numbers",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 6,
        verses: [
          {
            number: 24,
            english: "The LORD bless thee, and keep thee:",
            kiswahili: "BWANA akubarikie, na kukulinda;",
            luo: "Yehova mondo ogwedhi, kendo ogriti:"
          },
          {
            number: 25,
            english: "The LORD make his face shine upon thee, and be gracious unto thee:",
            kiswahili: "BWANA aangaze uso wake juu yako, na kukufadhili;",
            luo: "Yehova mondo omi wang'e orienyni, kendo obed gi ng'wono ni:"
          },
          {
            number: 26,
            english: "The LORD lift up his countenance upon thee, and give thee peace.",
            kiswahili: "BWANA akuinulie uso wake, na kukupa amani.",
            luo: "Yehova mondo oting' wang'e e wi k'omi, kendo omiyi kuwe."
          }
        ]
      }
    ]
  },
  {
    name: "Deuteronomy",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 6,
        verses: [
          {
            number: 5,
            english: "And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might.",
            kiswahili: "Nawe mpende BWANA, Mungu wako, kwa moyo wako wote, na kwa roho yako yote, na kwa nguvu zako zote.",
            luo: "Kendo mondo iher Yehova Nyasachi gi chunyi duto, kendo gi roho mari duto, kendo gi tekoni duto."
          }
        ]
      }
    ]
  },
  {
    name: "Joshua",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 9,
            english: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
            kiswahili: "Je! Si mimi niliyekuamuru? Uwe hodari na moyo wa ushujaa; usiogope wala usifadhaike; kwa kuwa BWANA, Mungu wako, yu pamoja nawe kila uendako.",
            luo: "Ok achiki koro? Bed ratiro kendo gi chir; kik iluor, kendo kik chunyi nyap: nimar Yehova Nyasachi ni kodi kamoro amora midhiyoe."
          }
        ]
      }
    ]
  },
  {
    name: "Judges",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 5,
        verses: [
          {
            number: 3,
            english: "Hear, O ye kings; give ear, O ye princes; I, even I, will sing unto the LORD; I will sing praise to the LORD God of Israel.",
            kiswahili: "Sikieni, enyi wafalme; tegeni masikio, enyi wakuu; Mimi, naam, mimi nitamwimbia BWANA; Nitamshangilia BWANA, Mungu wa Israeli.",
            luo: "Winjuru, un ruodhi; miuru ituru, un joloch; an, ee an, anawer ne Yehova; anawer pak ne Yehova Nyasach Israel."
          }
        ]
      }
    ]
  },
  {
    name: "Ruth",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 16,
            english: "And Ruth said, Entreat me not to leave thee, or to return from following after thee: for whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God:",
            kiswahili: "Naye Ruthu akasema, Usinisihi nikuache, nirejee nisifuatane nawe; maana kule uendako nitakwenda, na pale utakapolala nitalala; watu wako watakuwa watu wangu, na Mungu wako atakuwa Mungu wangu.",
            luo: "To Ruth nowacho ni, Kik isaya ni aweyi, kata ni adog chien ma ok aluwi: nimar kamoro amora midhiyoe, anadhiye; kendo kamoro amora minindo-e, ananindoe: jogi nobed joga, kendo Nyasachi nobed Nyasacha:"
          }
        ]
      }
    ]
  },
  {
    name: "1 Samuel",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 16,
        verses: [
          {
            number: 7,
            english: "But the LORD said unto Samuel, Look not on his countenance, or on the height of his stature; because I have refused him: for the LORD seeth not as man seeth; for man looketh on the outward appearance, but the LORD looketh on the heart.",
            kiswahili: "Lakini BWANA akamwambia Samweli, usitazame uso wake, wala urefu wa kimo chake; kwa maana mimi nimemkataa; BWANA hatazami kama mwanadamu atazamavyo; maana mwanadamu hutazama mambo ya nje, bali BWANA hutazama moyo.",
            luo: "To Yehova nowacho ne Samuel ni, Kik ing'i ranyisi mar wang'e, kata ranyisi mar bor-ne; nimar asekwede: nimar Yehova ok neng'ore kaka dhano neng'ore; nimar dhano ng'iyo gigo manie nyim wang'e, to Yehova ng'iyo chuny."
          }
        ]
      }
    ]
  },
  {
    name: "2 Samuel",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 22,
        verses: [
          {
            number: 2,
            english: "And he said, The LORD is my rock, and my fortress, and my deliverer;",
            kiswahili: "Akasema, BWANA ndiye mwamba wangu, na ngome yangu, na mwokozi wangu.",
            luo: "Kendo nowacho ni, Yehova e lwandana, kendo ohingana mar teko, kendo jawarna;"
          }
        ]
      }
    ]
  },
  {
    name: "1 Kings",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 9,
            english: "Give therefore thy servant an understanding heart to judge thy people, that I may discern between good and bad: for who is able to judge this thy so great a people?",
            kiswahili: "Kwa hiyo mpe mtumwa wako moyo wa ufahamu ili kuwahukumu watu wako, nipate kupambanua kati ya mema na mabaya; maana ni nani awezaye kuwahukumu hawa watu wako walio wengi?",
            luo: "Omiyo mi jatichni chuny mar rieko mondo ong'ad bura ne jogi, mondo ang'e pogo e dier maber gi marach: nimar ng'ano ma nyalo ng'ado bura ne jogi mang'eny kamagi?"
          }
        ]
      }
    ]
  },
  {
    name: "2 Kings",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 11,
            english: "And it came to pass, as they still went on, and talked, that, behold, there appeared a chariot of fire, and horses of fire, and parted them both asunder; and Elijah went up by a whirlwind into heaven.",
            kiswahili: "Ikawa, walipokuwa wakiendelea mbele na kuzungumza, tazama, kukatokea gari la moto na farasi wa moto, vikawatenga wale wawili; naye Eliya akapanda mbinguni kwa upepo wa dhoruba.",
            luo: "Kendo ne obedo kamano, ka ne pod gidhi kendo giwuoyo, neuru, gari mar mach ne opidore, gi faras mag mach, kendo nopogogi giduto ariyo; eka Elija nodhi e polo gi yamo mar dhoruba."
          }
        ]
      }
    ]
  },
  {
    name: "1 Chronicles",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 16,
        verses: [
          {
            number: 34,
            english: "O give thanks unto the LORD; for he is good; for his mercy endureth for ever.",
            kiswahili: "Mshukuruni BWANA, kwa kuwa ni mwema; Kwa maana fadhili zake ni za milele.",
            luo: "O miuru erokamano ne Yehova; nimar en ohero; nimar ng'wono mare osiko nyaka chieng'."
          }
        ]
      }
    ]
  },
  {
    name: "2 Chronicles",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 7,
        verses: [
          {
            number: 14,
            english: "If my people, which are called by my name, shall humble themselves, and pray, and seek my face, and turn from their wicked ways; then will I hear from heaven, and will forgive their sin, and will heal their land.",
            kiswahili: "Ikiwa watu wangu, walioitwa kwa jina langu, watajinyenyekesha, na kuomba, na kunitafuta uso wangu, na kuziacha njia zao mbaya; basi, nitasikia kutoka mbinguni, na kuwasamehe dhambi yao, na kuiponya nchi yao.",
            luo: "Ka joga, m'oluong' gi nying'a, nokulore piny, kendo ginalamo, kendo ginamanyo wang'a, kendo ginadog chien koa e yorgi maricho; eka anawinjie koa e polo, kendo anaweynegi richogi, kendo anachoyo pinygi."
          }
        ]
      }
    ]
  },
  {
    name: "Ezra",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 7,
        verses: [
          {
            number: 10,
            english: "For Ezra had prepared his heart to seek the law of the LORD, and to do it, and to teach in Israel statutes and judgments.",
            kiswahili: "Kwa maana Ezra alikuwa ameuandaa moyo wake kuitafuta sheria ya BWANA, na kuitenda, na kufundisha katika Israeli amri na hukumu.",
            luo: "Nimar Ezra ne oseiko chunye mondo omany chik mar Yehova, kendo mondo otim gigo, kendo mondo opuonj Israel chike gi buche."
          }
        ]
      }
    ]
  },
  {
    name: "Nehemiah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 8,
        verses: [
          {
            number: 10,
            english: "Then he said unto them, Go your way, eat the fat, and drink the sweet, and send portions unto them for whom nothing is prepared: for this day is holy unto our Lord: neither be ye sorry; for the joy of the LORD is your strength.",
            kiswahili: "Kisha akawaambia, Enendeni zenu, mle vilivyonona, na kunywa vilivyo vitamu, na kuwapelekea sehemu wale ambao hawajaandaliwa kitu; kwa maana siku hii ni takatifu kwa Bwana wetu; wala msihuzunike; kwa kuwa furaha ya BWANA ni nguvu zenu.",
            luo: "Eka nowachonegi ni, Dhiuru, chamuru gigo mang'we, kendo u-madh gigo mamit, kendo u-mi joma onge gimoro m’oseikonegi: nimar odiechieng'ni en maler ne Ruothwa: kendo kik ubed mo-kuyo; nimar mor mar Yehova en tekou."
          }
        ]
      }
    ]
  },
  {
    name: "Esther",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 4,
        verses: [
          {
            number: 14,
            english: "For if thou altogether holdest thy peace at this time, then shall there enlargement and deliverance arise to the Jews from another place; but thou and thy father's house shall be destroyed: and who knoweth whether thou art come to the kingdom for such a time as this?",
            kiswahili: "Maana kama ukinyamaza kabisa wakati huu, msaada na wokovu utatokea kwa Wayahudi kutoka mahali pengine; bali wewe na nyumba ya baba yako mtaangamia; naye ni nani ajuaye kama wewe hukuujia ufalme kwa ajili ya wakati kama huu?",
            luo: "Nimar ka iling' thi saa ni, eka konyruok gi warruok nobi ne Jo-Yahudi koa kamoro machielo; to in gi od wuonu unulal; kendo ng'ano ma-ng'eyo ka in e ma isebiro e loch nikech saa machalo kama?"
          }
        ]
      }
    ]
  },
  {
    name: "Job",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 19,
        verses: [
          {
            number: 25,
            english: "For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth:",
            kiswahili: "Maana najua ya kuwa mkombozi wangu yu hai, na ya kuwa siku ya mwisho atasimama juu ya nchi:",
            luo: "Nimar ang'eyo ni Jawar mara ngima, kendo ni odiechieng' mar giko enochung' e wi piny:"
          }
        ]
      }
    ]
  },
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
  {
    name: "Proverbs",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 5,
            english: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
            kiswahili: "Mtumaini BWANA kwa moyo wako wote, Wala usizitegemee akili zako mwenyewe.",
            luo: "Gen kuom Yehova gi chunyi duto; kendo kik iket yie kuom riekoni iwuon."
          },
          {
            number: 6,
            english: "In all thy ways acknowledge him, and he shall direct thy paths.",
            kiswahili: "Katika njia zako zote mkiri yeye, Naye atayanyosha mapito yako.",
            luo: "E yorni duto kanyne, to oloyi yorni bed ratiro."
          }
        ]
      }
    ]
  },
  {
    name: "Jeremiah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 29,
        verses: [
          {
            number: 11,
            english: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
            kiswahili: "Maana nayajua mawazo ninayowawazia ninyi, asema BWANA, mawazo ya amani wala si ya mabaya, kuwapa tumaini siku zenu za mwisho.",
            luo: "Nimar ang'eyo paro ma aparo neuru, wacho Yehova, paro mar kuwe, kendo ok mar richo, mondo amiuru giko ma unyiso."
          }
        ]
      }
    ]
  },
  {
    name: "Lamentations",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 22,
            english: "It is of the LORD's mercies that we are not consumed, because his compassions fail not.",
            kiswahili: "Ni huruma za BWANA kwamba hatuangamii, kwa maana rehema zake hazikomi.",
            luo: "En ng'wono mar Yehova ma ok wanyalo kethore, nimar ng'wono mare ok rum."
          },
          {
            number: 23,
            english: "They are new every morning: great is thy faithfulness.",
            kiswahili: "Ni mpya kila asubuhi: uaminifu wako ni mkuu.",
            luo: "Ginyien e okinyi duto: yie mari en maduong'."
          }
        ]
      }
    ]
  },
  {
    name: "Ezekiel",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 36,
        verses: [
          {
            number: 26,
            english: "A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you an heart of flesh.",
            kiswahili: "Nami nitawapa moyo mpya, na roho mpya nitatia ndani yenu; nami nitauondoa moyo wa jiwe katika mwili wenu, nami nitawapa moyo wa nyama.",
            luo: "Anamiuru chuny manyien, kendo roho manyien anamiuru e iuru: kendo anating' chuny mar kidi koa e ringruokuru, kendo anamiuru chuny mar ringruok."
          }
        ]
      }
    ]
  },
  {
    name: "Daniel",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 6,
        verses: [
          {
            number: 10,
            english: "Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his God, as he did aforetime.",
            kiswahili: "Basi Danieli alipojua ya kuwa waraka huo umetiwa sahihi, akaingia nyumbani kwake; na madirisha yake yalikuwa wazi chumbani mwake kuelekea Yerusalemu; akapiga magoti mara tatu kwa siku, akaomba, akamshukuru Mungu wake, kama alivyokuwa akifanya zamani.",
            luo: "Koro ka Daniel ne ong'eyo ni barua ne oseketi saini, ne odhi e ode; kendo dirisane ne oyawore e otne kowuok Jerusalem, ne okulore e chokne nyaka nyasi adek e odiechieng', kendo ne olamo, kendo ne omiyo erokamano e nyim Nyasaye mare, kaka ne otimo chon."
          }
        ]
      }
    ]
  },
  {
    name: "Hosea",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 6,
        verses: [
          {
            number: 6,
            english: "For I desired mercy, and not sacrifice; and the knowledge of God more than burnt offerings.",
            kiswahili: "Maana nataka rehema, wala si sadaka; na kumjua Mungu kuliko sadaka za kuteketezwa.",
            luo: "Nimar nadwaro ng'wono, kendo ok misango; kendo ng'eyo Nyasaye moloyo misango mag mach."
          }
        ]
      }
    ]
  },
  {
    name: "Joel",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 28,
            english: "And it shall come to pass afterward, that I will pour out my spirit upon all flesh; and your sons and your daughters shall prophesy, your old men shall dream dreams, your young men shall see visions:",
            kiswahili: "Itatokea baadaye, ya kwamba nitamimina Roho yangu juu ya wote wenye mwili; na wana wenu na binti zenu watatabiri, wazee wenu wataota ndoto, vijana wenu wataona maono:",
            luo: "Kendo nobed kamano bang'e, ni anami Roho mara e wi ringruok duto; kendo yawuotu gi nyiutu ununabi, joma oti ununeno lek, joma rawere ununeno ranyisi:"
          }
        ]
      }
    ]
  },
  {
    name: "Amos",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 5,
        verses: [
          {
            number: 24,
            english: "But let judgment run down as waters, and righteousness as a mighty stream.",
            kiswahili: "Lakini haki itiririke kama maji, na haki kama mto wenye nguvu.",
            luo: "To mondo bura ool piny kaka pi, kendo ratiro kaka aora mar teko."
          }
        ]
      }
    ]
  },
  {
    name: "Obadiah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 15,
            english: "For the day of the LORD is near upon all the heathen: as thou hast done, it shall be done unto thee: thy reward shall return upon thine own head.",
            kiswahili: "Maana siku ya BWANA i karibu juu ya mataifa yote: kama ulivyotenda, ndivyo utakavyotendewa; malipo yako yatakurudia juu ya kichwa chako mwenyewe.",
            luo: "Nimar odiechieng' mar Yehova ni machiegni e wi oganda duto: kaka in isetimo, kamano notimni: poki nodog e wiyi iwuon."
          }
        ]
      }
    ]
  },
  {
    name: "Jonah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 10,
            english: "And God saw their works, that they turned from their evil way; and God repented of the evil, that he had said that he would do unto them; and he did it not.",
            kiswahili: "Mungu akaona matendo yao, ya kwamba waligeuka na kuacha njia yao mbaya; Mungu akaghairi mabaya aliyosema atawatenda; wala hakuyatenda.",
            luo: "Kendo Nyasaye ne oneno tichgi, ni ne gidok chien koa e yorgi maricho; kendo Nyasaye ne oloko paro mar richo, mane owacho ni notimnegi; kendo ne ok otimo."
          }
        ]
      }
    ]
  },
  {
    name: "Micah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 6,
        verses: [
          {
            number: 8,
            english: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
            kiswahili: "Amekuonyesha, Ee mwanadamu, yaliyo mema; na BWANA anataka nini kwako, ila kutenda haki, na kupenda rehema, na kwenda kwa unyenyekevu na Mungu wako?",
            luo: "Osenyisi, Ee dhano, gima ber; kendo ang'o ma Yehova dwaro kuomi, to ok timo bura, kendo hero ng'wono, kendo wuotho e piny gi Nyasachi?"
          }
        ]
      }
    ]
  },
  {
    name: "Nahum",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 7,
            english: "The LORD is good, a strong hold in the day of trouble; and he knoweth them that trust in him.",
            kiswahili: "BWANA ni mwema, ngome wakati wa taabu; naye huwajua wamtegemeao.",
            luo: "Yehova en ber, ohinga mar teko e odiechieng' mar chandruok; kendo en ong'eyo jogo mang'eyo en."
          }
        ]
      }
    ]
  },
  {
    name: "Habakkuk",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 4,
            english: "Behold, his soul which is lifted up is not upright in him: but the just shall live by his faith.",
            kiswahili: "Tazama, nafsi yake iliyoinuliwa si ya haki ndani yake: bali mwenye haki ataishi kwa imani yake.",
            luo: "Neuru, roho mare ma oting'ore ok ratiro e iye: to joma ratiro nobed gi ngima kuom yie margi."
          }
        ]
      }
    ]
  },
  {
    name: "Zephaniah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 17,
            english: "The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.",
            kiswahili: "BWANA Mungu wako katikati yako ni hodari; atakuokoa, atakufurahia kwa furaha; atatulia katika upendo wake, atakushangilia kwa kuimba.",
            luo: "Yehova Nyasachi e dieruru en ng'at mar teko; en owari, en omiuru mor gi mor; en odagi e hera mare, en omiuru mor gi wer."
          }
        ]
      }
    ]
  },
  {
    name: "Haggai",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 9,
            english: "The glory of this latter house shall be greater than of the former, saith the LORD of hosts: and in this place will I give peace, saith the LORD of hosts.",
            kiswahili: "Utukufu wa nyumba hii ya mwisho utakuwa mkuu kuliko wa kwanza, asema BWANA wa majeshi: na mahali hapa nitatoa amani, asema BWANA wa majeshi.",
            luo: "Duong' mar odgi mar giko nobed maduong' moloyo mar mokwongo, wacho Yehova mar oganda: kendo e kar gi anami kuwe, wacho Yehova mar oganda."
          }
        ]
      }
    ]
  },
  {
    name: "Zechariah",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 4,
        verses: [
          {
            number: 6,
            english: "Then he answered and spake unto me, saying, This is the word of the LORD unto Zerubbabel, saying, Not by might, nor by power, but by my spirit, saith the LORD of hosts.",
            kiswahili: "Ndipo akanijibu, akanena nami, akisema, Hili ndilo neno la BWANA kwa Zerubabeli, akisema, Si kwa uwezo, wala si kwa nguvu, bali kwa Roho yangu, asema BWANA wa majeshi.",
            luo: "Eka ne odwoka kendo nowachona, kowacho ni, Mano e wach mar Yehova ne Zerubbabel, kowacho ni, Ok gi teko, kata gi duong', to gi roho mara, wacho Yehova mar oganda."
          }
        ]
      }
    ]
  },
  {
    name: "Malachi",
    category: "Old Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 10,
            english: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.",
            kiswahili: "Leteni zaka kamili ghalani, ili kuwepo chakula katika nyumba yangu, mkanijaribu sasa kwa jambo hili, asema BWANA wa majeshi, kama sitawafungulia madirisha ya mbinguni, na kuwamwagia baraka, hata isiwepo nafasi ya kutosha kuipokea.",
            luo: "Keluru zaka duto e od keno, mondo obed gi chiemo e oda, kendo temuru an koro gi wachgi, wacho Yehova mar oganda, ka ok anayawuru dirisa mar polo, kendo anamiuru gwedho, ma ok nobed gi kar yudo."
          }
        ]
      }
    ]
  },
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
  {
    name: "Mark",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 16,
        verses: [
          {
            number: 15,
            english: "And he said unto them, Go ye into all the world, and preach the gospel to every creature.",
            kiswahili: "Akawaambia, Enendeni ulimwenguni mwote, mkaihubiri Injili kwa kila kiumbe.",
            luo: "Kendo nowachonegi ni, Dhiuru e piny duto, kendo uhul injili ne chwe duto."
          }
        ]
      }
    ]
  },
  { name: "Luke", category: "New Testament", chapters: [] },
  {
    name: "Luke",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 19,
        verses: [
          {
            number: 10,
            english: "For the Son of man is come to seek and to save that which was lost.",
            kiswahili: "Kwa maana Mwana wa Adamu alikuja kutafuta na kuokoa kile kilichopotea.",
            luo: "Nimar Wuod dhano ne obiro manyo kendo waro gima ne olal."
          }
        ]
      }
    ]
  },
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
  {
    name: "Acts",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 38,
            english: "Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.",
            kiswahili: "Ndipo Petro akawaambia, Tubuni, mkabatizwe kila mmoja wenu kwa jina la Yesu Kristo kwa ondoleo la dhambi zenu, nanyi mtapokea kipawa cha Roho Mtakatifu.",
            luo: "Eka Petro nowachonegi ni, Lokuru chunyuru, kendo obeduru obatiso ng'ato ka ng'ato e nying Yesu Kristo ne weyo richo, kendo ununwang'o mich mar Roho Maler."
          }
        ]
      }
    ]
  },
  {
    name: "Romans",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 8,
        verses: [
          {
            number: 28,
            english: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
            kiswahili: "Nasi twajua ya kuwa katika mambo yote Mungu hufanya kazi pamoja na wale wampendao katika kuwapatia mema, yaani, wale walioitwa kwa kusudi lake.",
            luo: "Kendo wang'eyo ni gigo duto tiyo kanyachiel ne ber jogo mohere, tii jogo m’oluong' kuom chenro mare."
          },
          {
            number: 31,
            english: "What shall we then say to these things? If God be for us, who can be against us?",
            kiswahili: "Tuseme nini basi juu ya hayo? Mungu akiwa upande wetu, ni nani aliye juu yetu?",
            luo: "To wabiro wacho ang'o kuom wechegi? Ka Nyasaye ni e korwa, to ng'ano mabiro rwenyowa?"
          }
        ]
      },
      {
        chapterNumber: 12,
        verses: [
          {
            number: 28,
            english: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
            kiswahili: "Nasi twajua ya kuwa katika mambo yote Mungu hufanya kazi pamoja na wale wampendao katika kuwapatia mema, yaani, wale walioitwa kwa kusudi lake.",
            luo: "Kendo wang'eyo ni gigo duto tiyo kanyachiel ne ber jogo mohere, tii jogo m’oluong' kuom chenro mare."
          },
          {
            number: 31,
            english: "What shall we then say to these things? If God be for us, who can be against us?",
            kiswahili: "Tuseme nini basi juu ya hayo? Mungu akiwa upande wetu, ni nani aliye juu yetu?",
            luo: "To wabiro wacho ang'o kuom wechegi? Ka Nyasaye ni e korwa, to ng'ano mabiro rwenyowa?"
          }
        ]
      }
    ]
  },
  {
    name: "1 Corinthians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 13,
        verses: [
          {
            number: 4,
            english: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,",
            kiswahili: "Upendo huvumilia, hufadhili; upendo hauhusudu; upendo hautakabari, haujivuni,",
            luo: "Hera osiko nyaka chieng', kendo en ber; hera ok nyiego; hera ok oting'ore, ok oting'ore, ok oting'ore,"
          },
          {
            number: 5,
            english: "Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;",
            kiswahili: "Hautendi yasiyopasa, hautafuti mambo yake mwenyewe, haukasiriki upesi, haudhani mabaya;",
            luo: "Ok otimo gima ok ber, ok omanyo mare owuon, ok o-chwanyore piyo, ok oparo richo;"
          },
          {
            number: 6,
            english: "Rejoiceth not in iniquity, but rejoiceth in the truth;",
            kiswahili: "Haufurahii udhalimu, bali hufurahi pamoja na kweli;",
            luo: "Ok omor e richo, to omor e adiera;"
          },
          {
            number: 7,
            english: "Beareth all things, believeth all things, hopeth all things, endureth all things.",
            kiswahili: "Huvumilia yote, huamini yote, hutumaini yote, hustahimili yote.",
            luo: "Oting'o gigo duto, oyie gigo duto, ogeno gigo duto, osiko gigo duto."
          }
        ]
      }
    ]
  },
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
  {
    name: "Mark",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 16,
        verses: [
          {
            number: 15,
            english: "And he said unto them, Go ye into all the world, and preach the gospel to every creature.",
            kiswahili: "Akawaambia, Enendeni ulimwenguni mwote, mkaihubiri Injili kwa kila kiumbe.",
            luo: "Kendo nowachonegi ni, Dhiuru e piny duto, kendo uhul injili ne chwe duto."
          }
        ]
      }
    ]
  },
  {
    name: "2 Corinthians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 5,
        verses: [
          {
            number: 17,
            english: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
            kiswahili: "Hivyo basi, mtu akiwa ndani ya Kristo, amekuwa kiumbe kipya; ya kale yamepita; tazama, yamekuwa mapya yote.",
            luo: "Omiyo ka ng'ato ni e Kristo, en chwe manyien: gigo machon osekalo; neuru, gigo duto osekedo manyien."
          }
        ]
      }
    ]
  },
  {
    name: "Galatians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 5,
        verses: [
          {
            number: 22,
            english: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,",
            kiswahili: "Lakini tunda la Roho ni upendo, furaha, amani, uvumilivu, utu wema, fadhili, uaminifu,",
            luo: "To nyak mar Roho en hera, mor, kuwe, siko, ng'wono, ber, yie,"
          },
          {
            number: 23,
            english: "Meekness, temperance: against such there is no law.",
            kiswahili: "Upole, kiasi: juu ya mambo kama hayo hakuna sheria.",
            luo: "Nyap, kido: ne gigo kama onge chik."
          }
        ]
      }
    ]
  },
  {
    name: "Ephesians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 8,
            english: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:",
            kiswahili: "Kwa maana mmeokolewa kwa neema, kwa njia ya imani; na hiyo si kwa matendo yenu wenyewe: ni kipawa cha Mungu:",
            luo: "Nimar gi ng'wono e ma unuwari gi yie; kendo ok giuru iwuon: en mich mar Nyasaye:"
          },
          {
            number: 9,
            english: "Not of works, lest any man should boast.",
            kiswahili: "Si kwa matendo, mtu awaye yote asije akajisifu.",
            luo: "Ok gi tich, mondo ng'ato kik oting'ore."
          }
        ]
      }
    ]
  },
  {
    name: "Philippians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 4,
        verses: [
          {
            number: 13,
            english: "I can do all things through Christ which strengtheneth me.",
            kiswahili: "Naweza kufanya mambo yote katika yeye anitiaye nguvu.",
            luo: "Anyalo timo gigo duto gi Kristo ma omiyo teko."
          }
        ]
      }
    ]
  },
  {
    name: "Colossians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 23,
            english: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;",
            kiswahili: "Na lo lote lolote mfanyalo, lifanyeni kwa moyo, kama kwa Bwana, wala si kwa wanadamu;",
            luo: "Kendo gimoro amora mutimo, timuru gi chunyuru duto, kaka ne Ruoth, kendo ok ne dhano;"
          }
        ]
      }
    ]
  },
  {
    name: "1 Thessalonians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 5,
        verses: [
          {
            number: 16,
            english: "Rejoice evermore.",
            kiswahili: "Furahini daima.",
            luo: "Moruru nyaka chieng'."
          },
          {
            number: 17,
            english: "Pray without ceasing.",
            kiswahili: "Ombeni bila kukoma.",
            luo: "Lamuru ma ok uwe."
          },
          {
            number: 18,
            english: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
            kiswahili: "Katika kila jambo shukuruni; maana hii ndiyo mapenzi ya Mungu katika Kristo Yesu kwenu.",
            luo: "E gimoro duto miuru erokamano: nimar mano e dwaro mar Nyasaye e Kristo Yesu kuomuru."
          }
        ]
      }
    ]
  },
  {
    name: "2 Thessalonians",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 10,
            english: "For even when we were with you, this we commanded you, that if any would not work, neither should he eat.",
            kiswahili: "Maana hata tulipokuwa pamoja nanyi, tuliwaagiza hivi, kwamba mtu awaye yote asipopenda kufanya kazi, asile chakula.",
            luo: "Nimar kata ka ne wan kodiuru, mano ne wachikuru, ni ka ng'ato ok dwaro tiyo, to kik ocham chiemo."
          }
        ]
      }
    ]
  },
  {
    name: "1 Timothy",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 4,
        verses: [
          {
            number: 12,
            english: "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.",
            kiswahili: "Mtu awaye yote asikudharau ujana wako; bali uwe mfano kwa waaminio, katika neno, katika mwenendo, katika upendo, katika roho, katika imani, katika usafi.",
            luo: "Kik ng'ato ochayo rawera mari; to mondo ibed ranyisi ne joma oyie, e wach, e wuotho, e hera, e roho, e yie, e ler."
          }
        ]
      }
    ]
  },
  {
    name: "2 Timothy",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 16,
            english: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:",
            kiswahili: "Kila andiko, lenye pumzi ya Mungu, lafaa kwa mafundisho, na kwa kuwaonya, na kwa kuwaongoza, na kwa kuwaelimisha katika haki:",
            luo: "Ndiko duto omi gi roho mar Nyasaye, kendo ber ne puonj, ne kwayo, ne ratiro, ne puonj e ratiro:"
          },
          {
            number: 17,
            english: "That the man of God may be perfect, throughly furnished unto all good works.",
            kiswahili: "Ili mtu wa Mungu awe mkamilifu, akitayarishwa kikamilifu kwa kila kazi njema.",
            luo: "Mondo ng'at mar Nyasaye obed maler, o-chieng'ore duto ne tich maber duto."
          }
        ]
      }
    ]
  },
  {
    name: "Titus",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 2,
        verses: [
          {
            number: 11,
            english: "For the grace of God that bringeth salvation hath appeared to all men,",
            kiswahili: "Maana neema ya Mungu iletayo wokovu imefunuliwa kwa wanadamu wote,",
            luo: "Nimar ng'wono mar Nyasaye ma okelo warruok osekedo ne dhano duto,"
          },
          {
            number: 12,
            english: "Teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly, in this present world;",
            kiswahili: "Ikitufundisha kwamba, tukikana uasi wa Mungu na tamaa za kidunia, tuishi kwa kiasi, kwa haki, na kwa utauwa, katika ulimwengu huu wa sasa;",
            luo: "Opuonjowa ni, ka wawewo gigo ma ok mar Nyasaye gi gombo mar piny, mondo wabed gi ngima maler, mar ratiro, kendo mar Nyasaye, e piny kama;"
          }
        ]
      }
    ]
  },
  {
    name: "Philemon",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 17,
            english: "If thou count me therefore a partner, receive him as myself.",
            kiswahili: "Basi ukiniona kuwa mshirika, mpokee kama mimi mwenyewe.",
            luo: "Ka in iparo an kaka ja-kony, to mondo iyie en kaka an iwuon."
          }
        ]
      }
    ]
  },
  {
    name: "Hebrews",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 11,
        verses: [
          {
            number: 6,
            english: "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.",
            kiswahili: "Lakini pasipo imani haiwezekani kumpendeza; maana yeye amwendeaye Mungu lazima aamini kwamba yeye yuko, na kwamba huwapa thawabu wale wamtafutao kwa bidii.",
            luo: "To ka onge yie ok nyal moro en: nimar ng'ato ma biro ne Nyasaye nyaka yie ni en nitie, kendo ni en omiyo pok ne jogo manyo en gi bidii."
          }
        ]
      }
    ]
  },
  {
    name: "James",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 22,
            english: "But be ye doers of the word, and not hearers only, deceiving your own selves.",
            kiswahili: "Lakini iweni watendaji wa neno, wala si wasikiaji tu, mkijidanganya nafsi zenu.",
            luo: "To mondo ubed joma timo wach, kendo ok joma winjo kende, u-wuondoru iwuon."
          }
        ]
      }
    ]
  },
  {
    name: "1 Peter",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 5,
        verses: [
          {
            number: 7,
            english: "Casting all your care upon him; for he careth for you.",
            kiswahili: "Mkitupa fadhaa zenu zote juu yake; kwa maana yeye huwajali ninyi.",
            luo: "Keto paroru duto e wiye; nimar en oparouru."
          }
        ]
      }
    ]
  },
  {
    name: "2 Peter",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 3,
        verses: [
          {
            number: 9,
            english: "The Lord is not slack concerning his promise, as some men count slackness; but is longsuffering to us-ward, not willing that any should perish, but that all should come to repentance.",
            kiswahili: "Bwana hakawii kuitimiza ahadi yake, kama wengine wanavyohesabu kukawia; bali huvumilia kwetu, hataki mtu awaye yote apotee, bali wote wafikie toba.",
            luo: "Ruoth ok o-nyap e wach mar singo mare, kaka jomoko paro ni en o-nyap; to en osiko nyaka chieng' ne wan, ok dwaro ni ng'ato okethore, to ni duto mondo obi e lokruok."
          }
        ]
      }
    ]
  },
  {
    name: "1 John",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 4,
        verses: [
          {
            number: 7,
            english: "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.",
            kiswahili: "Wapenzi, tupendane; kwa maana upendo hutoka kwa Mungu; na kila apendaye amezaliwa na Mungu, naye amjua Mungu.",
            luo: "Jahera, mondo waher kanyachiel: nimar hera en mar Nyasaye; kendo ng'ato ka ng'ato ma ohero o-nyuol gi Nyasaye, kendo ong'eyo Nyasaye."
          },
          {
            number: 8,
            english: "He that loveth not knoweth not God; for God is love.",
            kiswahili: "Yeye asiyependa hakumjua Mungu; kwa maana Mungu ni upendo.",
            luo: "Ng'ato ma ok ohero ok ong'eyo Nyasaye; nimar Nyasaye en hera."
          }
        ]
      }
    ]
  },
  {
    name: "2 John",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 6,
            english: "And this is love, that we walk after his commandments. This is the commandment, That, as ye have heard from the beginning, ye should walk in it.",
            kiswahili: "Na huu ndio upendo, kwamba tuenende kwa amri zake. Hii ndiyo amri, Kwamba, kama mlivyosikia tangu mwanzo, mtaenenda katika hiyo.",
            luo: "Kendo mano e hera, ni wawuoth bang' chikne. Mano e chik, Ni, kaka unuwach koa e chakruok, unuwuoth e iye."
          }
        ]
      }
    ]
  },
  {
    name: "3 John",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 4,
            english: "I have no greater joy than to hear that my children walk in truth.",
            kiswahili: "Mimi sina furaha kubwa kuliko hii, kusikia kwamba watoto wangu wanatembea katika kweli.",
            luo: "An onge mor maduong' moloyo mano, winjo ni nyithinda owuotho e adiera."
          }
        ]
      }
    ]
  },
  {
    name: "Jude",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 1,
        verses: [
          {
            number: 24,
            english: "Now unto him that is able to keep you from falling, and to present you faultless before the presence of his glory with exceeding joy,",
            kiswahili: "Sasa kwake yeye awezaye kuwalinda ninyi msijikwae, na kuwasimamisha bila lawama mbele ya utukufu wake kwa furaha kuu,",
            luo: "Koro ne en ma nyalo konyuru mondo ok u-podhi, kendo mondo oketuru ma ok u-ketho e nyim duong' mare gi mor maduong',"
          },
          {
            number: 25,
            english: "To the only wise God our Saviour, be glory and majesty, dominion and power, both now and ever. Amen.",
            kiswahili: "Kwa Mungu pekee aliye na hekima, Mwokozi wetu, iwe utukufu na ukuu, mamlaka na nguvu, sasa na milele. Amina.",
            luo: "Ne Nyasaye kende ma rieko, Jawarwa, obed duong' gi duong', loch gi teko, koro kendo nyaka chieng'. Amen."
          }
        ]
      }
    ]
  },
  {
    name: "Revelation",
    category: "New Testament",
    chapters: [
      {
        chapterNumber: 21,
        verses: [
          {
            number: 1,
            english: "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.",
            kiswahili: "Kisha nikaona mbingu mpya na nchi mpya; kwa maana mbingu za kwanza na nchi ya kwanza zimekwisha kupita, wala bahari haiko tena.",
            luo: "Eka naneno polo manyien gi piny manyien; nikech polo mokwongo gi piny mokwongo nos’ekalo, kendo nam bende ne onge kendo."
          },
          {
            number: 2,
            english: "And I John saw the holy city, new Jerusalem, coming down from God out of heaven, prepared as a bride adorned for her husband.",
            kiswahili: "Nami nikauona mji ule mtakatifu, Yerusalemu mpya, ukishuka kutoka mbinguni kwa Mungu, umewekwa tayari kama bibi-arusi aliyekwisha kupambwa kwa mumewe.",
            luo: "An Johana naneno dala maler, Yerusalem Manyien, koglorre koa e polo kuom Nyasaye, molosre kaka nyako manyien m’olose ne chuore."
          },
          {
            number: 3,
            english: "And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God.",
            kiswahili: "Nikasikia sauti kuu kutoka katika kile kiti cha enzi ikisema, Tazama, maskani ya Mungu ni pamoja na wanadamu, naye atafanya maskani yake pamoja nao, nao watakuwa watu wake. Na Mungu mwenyewe atakuwa pamoja nao.",
            luo: "Kendo nawinjo dwol maduong' koa e polo kowacho ni, 'Neuru, kar dak mar Nyasaye ni e dier dhano, kendo obiro dak kodgi, kendo gibiro bedo joge, kendo Nyasaye owuon nobed kodgi kendo nobed Nyasaye margi.'"
          },
          {
            number: 4,
            english: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
            kiswahili: "Naye atafuta kila chozi katika macho yao, wala mauti haitakuwapo tena; wala maombolezo, wala kilio, wala maumivu hayatakuwapo tena; kwa kuwa mambo ya kwanza yamekwisha kupita.",
            luo: "Kendo Nyasaye nolodhi pi wang' duto e wengigi; kendo tho ok nobedie kendo, kata kuyo, kata nduru, kata rem ok nobedie kendo: nimar gigo mokuongo os’ekalo."
          }
        ]
      }
    ]
  }
];
