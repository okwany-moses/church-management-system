export interface HymnLanguageVersion {
  title: string;
  verses: string[]; // Verses of the song in correct order
}

export interface Hymn {
  id: number;
  number: number;
  category: string;
  key: string;
  author: string;
  scripture: string;
  description: string;
  pdf_url?: string;
  pdf_page?: number;
  melodyNotes?: Array<{ note: string; duration: number }>; // For the tune playback synthesizer!
  languages: {
    english: HymnLanguageVersion;
    kiswahili: HymnLanguageVersion;
    luo: HymnLanguageVersion;
  };
}

export const HYMNS: Hymn[] = [
  {
    id: 1,
    number: 1,
    category: "Grace & Salvation",
    key: "F Major",
    author: "John Newton, 1779",
    scripture: "Ephesians 2:8",
    description: "The timeless testimony of a soul saved from despair and blindness by the boundless grace of God. Newton, a former slave ship master, found true freedom in Christ.",
    melodyNotes: [
      { note: "C4", duration: 400 },
      { note: "F4", duration: 800 },
      { note: "A4", duration: 200 },
      { note: "F4", duration: 200 },
      { note: "A4", duration: 800 },
      { note: "G4", duration: 400 },
      { note: "F4", duration: 800 },
      { note: "D4", duration: 400 },
      { note: "C4", duration: 800 },
      { note: "C4", duration: 400 },
      { note: "F4", duration: 800 },
      { note: "A4", duration: 200 },
      { note: "F4", duration: 200 },
      { note: "A4", duration: 800 },
      { note: "G4", duration: 400 },
      { note: "C5", duration: 1200 },
    ],
    languages: {
      english: {
        title: "Amazing Grace",
        verses: [
          "Amazing grace! How sweet the sound,\nThat saved a wretch like me!\nI once was lost, but now am found,\nWas blind, but now I see.",
          "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed!",
          "Through many dangers, toils and snares,\nI have already come;\n'Tis grace has brought me safe thus far,\nAnd grace will lead me home.",
          "When we've been there ten thousand years,\nBright shining as the sun,\nWe've no less days to sing God's praise\nThan when we'd first begun."
        ]
      },
      kiswahili: {
        title: "Neema ya Ajabu",
        verses: [
          "Neema ya ajabu, sauti ya heri,\nIliyookoa mtu duni kama mimi!\nNilipotea lakini nimepatikana,\nNilikuwa kipofu, lakini sasa naona.",
          "Neema iliyonifundisha kumcha Mungu,\nIkaniondolea hofu zangu zote;\nJinsi gani neema hiyo ilivyo ya thamani\nTangu saa ile niliyofunguliwa!",
          "Kupitia hatari, taabu na majaribu mengi,\nTayari nimepita na kushinda;\nNi neema iliyonileta salama hadi sasa,\nNa neema hiyo itaniongoza hadi nyumbani.",
          "Tutakapokaa huko miaka elfu kumi,\nTukung'aa kama jua kuangaza,\nHatutakuwa na upungufu wa sifa za Mungu\nKuliko tulipoanza kuimba juzi."
        ]
      },
      luo: {
        title: "Neema Maler ya Ajabu",
        verses: [
          "Neema ya ajabu! Dwol maber mar hera,\nMa waro ng'at mochido kaka an!\nNe apona chuth, kuom mlandra mar richo,\nNe an kipofu, to sasa aneno ler!",
          "Neema mane opuonjo chunya luoro Mungu,\nKendo omaya hofu duto ma chunywa;\nNeema maber-o jipona e chuny,\nTangu saa mane anyise yie ratiro!",
          "Kuom masiche duto, lweny gi temruok mang'eny,\nChunya osebiye maber chuth;\nEn neema maler mane okowa ratiro,\nEn kendo mabi tero chunywa e polo.",
          "Ka tindo higni duto mil gi hera polo,\nKaka kor polo gi wang' chieng' duto te;\nOk wabi tindo chuny wa mar pako Ruoth,\nKaka higni manyopo be duto te!"
        ]
      }
    }
  },
  {
    id: 2,
    number: 2,
    category: "Praise & Worship",
    key: "B-flat Major",
    author: "Carl Boberg, 1885 / Stuart K. Hine",
    scripture: "Psalms 104:1-4",
    description: "Written in Sweden after a sudden lightning storm, this anthem celebrates the grandeur of God's majesty in nature and the redeeming work of Calvary.",
    melodyNotes: [
      { note: "F4", duration: 600 },
      { note: "Bb4", duration: 600 },
      { note: "Bb4", duration: 300 },
      { note: "A4", duration: 300 },
      { note: "Bb4", duration: 600 },
      { note: "C5", duration: 600 },
      { note: "D5", duration: 600 },
      { note: "D5", duration: 300 },
      { note: "C5", duration: 300 },
      { note: "D5", duration: 600 },
      { note: "Eb5", duration: 600 },
      { note: "F5", duration: 900 },
      { note: "D5", duration: 300 },
      { note: "C5", duration: 900 },
    ],
    languages: {
      english: {
        title: "How Great Thou Art",
        verses: [
          "O Lord my God, when I in awesome wonder,\nConsider all the worlds Thy Hands have made;\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.",
          "When through the woods, and forest glades I wander,\nAnd hear the birds sing sweetly in the trees;\nWhen I look down, from lofty mountain grandeur,\nAnd see the brook, and feel the gentle breeze.",
          "And when I think, that God, His Son not sparing;\nSent Him to die, I scarce can take it in;\nThat on the Cross, my burden gladly bearing,\nHe bled and died to take away my sin.",
          "Then sings my soul, my Savior God, to Thee,\nHow great Thou art! How great Thou art!\nThen sings my soul, my Savior God, to Thee,\nHow great Thou art! How great Thou art!"
        ]
      },
      kiswahili: {
        title: "Ee Mungu Mwema",
        verses: [
          "Ee Mungu wangu, ninaposhangaa sana,\nKuangalia ulimwengu uliouumba;\nNaona nyota, nasikia radi zikivuma,\nNguvu zako zikionyeshwa ulimwenguni kote.",
          "Ninapotembea katika misitu minene,\nNa kusikia ndege wakiimba kwa uzuri mtini;\nNinapotazama kutoka milima mirefu,\nNaona kijito, nahisi upepo mwanana.",
          "Nikifikiri, jinsi ulivyomtoa\nMwanao Yesu ili afike duniani;\nAkafa msalabani kubeba dhambi zangu,\nKujitolea damu yake kwa ajili yangu.",
          "Hapo roho yangu inakuimbia Wewe Mwokozi,\nJinsi ulivyo mkuu! Jinsi ulivyo mkuu!\nHapo roho yangu inakuimbia Wewe Mwokozi,\nJinsi ulivyo mkuu! Jinsi ulivyo mkuu!"
        ]
      },
      luo: {
        title: "Mano Duong' Mari",
        verses: [
          "O Ruoth Mungu, ka chunja obandore,\nKuom weche duto machweynegi ratiro;\nAneno sulwe, awinjo mor polo duto,\nTalo teko mari duto e ulimwengu.",
          "Ka anindoe, e bungu kenda maler,\nKendo awinjo winy ko-wer maber;\nKa a-neno pi dhi, e pinje duto dhot,\nAwinjo koyo, hera maonge keth.",
          "Kendo kaparo ni Yesu Wuodi maler,\nEma ne otho msalaba mondo okwa;\nObayo richona duto kendo owara,\nOa e richo duto, mondo alere.",
          "Wer chunja to, wer Mwokozi Mungu wira,\nMano duong' mari! Mano duong' mari!\nWer chunja to, wer Mwokozi Mungu wira,\nMano duong' mari! Mano duong' mari!"
        ]
      }
    }
  },
  {
    id: 3,
    number: 3,
    category: "Fellowship & Prayer",
    key: "F Major",
    author: "Joseph M. Scriven, 1855",
    scripture: "Proverbs 18:24",
    description: "Written to comfort his mother in Ireland while Scriven lived in Canada, this hymn portrays Jesus as a constant friend who invites us to lay all our trials at His feet.",
    melodyNotes: [
      { note: "F4", duration: 400 },
      { note: "F4", duration: 400 },
      { note: "G4", duration: 400 },
      { note: "F4", duration: 400 },
      { note: "A4", duration: 400 },
      { note: "F4", duration: 400 },
      { note: "C5", duration: 800 },
      { note: "D5", duration: 400 },
      { note: "C5", duration: 400 },
      { note: "A4", duration: 400 },
      { note: "F4", duration: 450 },
      { note: "G4", duration: 200 },
      { note: "A4", duration: 400 },
      { note: "G4", duration: 800 },
    ],
    languages: {
      english: {
        title: "What a Friend We Have in Jesus",
        verses: [
          "What a friend we have in Jesus,\nAll our sins and griefs to bear!\nWhat a privilege to carry\nEverything to God in prayer!",
          "Oh, what peace we often forfeit,\nOh, what needless pain we bear,\nAll because we do not carry\nEverything to God in prayer!",
          "Have we trials and temptations?\nIs there trouble anywhere?\nWe should never be discouraged,\nTake it to the Lord in prayer.",
          "Are we weak and heavy laden,\nCumbered with a load of care?\nPrecious Savior, still our refuge,\nTake it to the Lord in prayer."
        ]
      },
      kiswahili: {
        title: "Rafiki Mtamu Yesu",
        verses: [
          "Yesu ni rafiki mwema, mbeba dhambi zetu te!\nMungu atupa neema kuomba kwa maombi poti!\nOle wetu tunakosa amani kwa haraka we,\nKwa sababu hatumpi Yeye mambo katika maombi!",
          "Tuna taabu na huzuni? Majaribu kila mahali?\nHatustahili kukata tamaa, tupe dhabihu!\nMpelekee Bwana Yesu kila jambo kwa sala,\nYeye ndiye mfariji mkuu, mpaji wa neema.",
          "Tukiwa wadhaifu sana na kubeba mizigo mizito,\nYeye atakuwa kimbilio letu dhabiti daima;\nMarafiki wakikudharau na kukuacha pekee,\nMpelekee Bwana maombi, atakukumbatia daima."
        ]
      },
      luo: {
        title: "Yesu En Osiep Maber",
        verses: [
          "Yesu en Osiep maber chuth, mako richowa duto piny te,\nEn maber nwa tero duto, e nyim chunye e maombi!\nOi, kure nigi kwelo mang'eny, hofu maonge tich te,\nKak'o tero duto mondo, Yesu e ma-ng'ado duto piny!",
          "Bendi ritu gi magidho? Temruok ni e pinje duto?\nKik wa kiki piny jichunywa duto, tero ne Ruoth maber!\nTer duto ne Ruoth e lamo, Yesu boro teko chunywa,\nYie kuom Yesu en ratiro, en osiepwa maonge dho!",
          "Bendi chunywa nyap marach chuth? Mizigo mpek en bura te?\nSaviour maber en kimbilio walo, ter ne Ruoth e lamo duto;\nJo pinje k’ojari duto, ter ne Yesu chunywa te,\nDwong' obed ni Yesu wolo, bino loyo masiche!"
        ]
      }
    }
  },
  {
    id: 4,
    number: 4,
    category: "Faith & Assurance",
    key: "D Major",
    author: "Fanny Crosby, 1873",
    scripture: "Hebrews 10:22",
    description: "Composed by the beloved blind hymnwriter Fanny Crosby after hearing a melody played by Mrs. Phoebe Knapp. It expresses the absolute security and joy of trusting Jesus.",
    melodyNotes: [
      { note: "A4", duration: 300 },
      { note: "F#4", duration: 300 },
      { note: "D4", duration: 600 },
      { note: "B4", duration: 300 },
      { note: "A4", duration: 600 },
      { note: "D4", duration: 300 },
      { note: "E4", duration: 300 },
      { note: "F#4", duration: 300 },
      { note: "G4", duration: 300 },
      { note: "F#4", duration: 600 },
      { note: "E4", duration: 600 },
    ],
    languages: {
      english: {
        title: "Blessed Assurance",
        verses: [
          "Blessed assurance, Jesus is mine!\nOh, what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.",
          "Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels descending, bring from above\nEchoes of mercy, whispers of love.",
          "This is my story, this is my song,\nPraising my Savior all the day long;\nThis is my story, this is my song,\nPraising my Savior all the day long."
        ]
      },
      kiswahili: {
        title: "Uhakika wa Baraka",
        verses: [
          "Uhakika mkuu, Yesu ni wangu!\nHakika huu ni mwonjo wa utukufu wa mbinguni!\nMridhi wa wokovu, niliyekombolewa na Mungu,\nNimezaliwa kwa Roho Wake, nikanawa kwa damu Yake.",
          "Unyenyekevu kamili, furaha kamilifu kabisa,\nMaono ya shangwe sasa yanaonekana machoni mwangu;\nMalaika wakishuka kutoka juu mbinguni,\nWanaleta mwangwi wa rehema na sauti ya heri.",
          "Huu ndio ushuhuda wangu, huu ndio wimbo wangu,\nKumsifu Mwokozi wangu mchana na usiku;\nHuu ndio ushuhuda wangu, huu ndio wimbo wangu,\nKumsifu Mwokozi wangu mchana na usiku."
        ]
      },
      luo: {
        title: "Yesu E Herana",
        verses: [
          "Uhakika maber, Yesu en mara!\nAneno duong' polo k'osiko chunya!\nWarruok mosudo kuom hera mar Mungu,\nNyati-nyang' nyalo a-Nyasaye e-lem!",
          "Yie chuny maler kuom kuwe mar Ruoth,\nAneno malaika k’ogorore piny;\nMalaika mo-a e dala mar polo,\nO-kelwa hera duto to gi kuwe.",
          "Mano wer mara, kendo en ratiro,\nPako Mwokozi duto e higni!\nMano wer mara, kendo en ratiro,\nPako Mwokozi duto e higni!"
        ]
      }
    }
  },
  {
    id: 5,
    number: 5,
    category: "Comfort & Refuge",
    key: "B-flat Major",
    author: "Augustus Toplady, 1776",
    scripture: "1 Corinthians 10:4",
    description: "Sheltered in a cleft of a rock during a fierce central England storm, Toplady penned this beautiful plea for Christ to hide us in His eternal cleft.",
    melodyNotes: [
      { note: "Bb4", duration: 400 },
      { note: "D5", duration: 200 },
      { note: "F5", duration: 600 },
      { note: "Eb5", duration: 200 },
      { note: "D5", duration: 400 },
      { note: "C5", duration: 400 },
      { note: "Bb4", duration: 800 },
      { note: "C5", duration: 400 },
      { note: "D5", duration: 600 },
      { note: "C5", duration: 200 },
      { note: "Bb4", duration: 800 },
    ],
    languages: {
      english: {
        title: "Rock of Ages",
        verses: [
          "Rock of Ages, cleft for me,\nLet me hide myself in Thee;\nLet the water and the blood,\nFrom Thy wounded side which flowed,\nBe of sin the double cure;\nSave from wrath and make me pure.",
          "Not the labors of my hands\nCan fulfill Thy law's demands;\nCould my zeal no respite know,\nCould my tears forever flow,\nAll for sin could not atone;\nThou must save, and Thou alone.",
          "While I draw this fleeting breath,\nWhen mine eyes shall close in death,\nWhen I rise to worlds unknown,\nAnd behold Thee on Thy throne,\nRock of Ages, cleft for me,\nLet me hide myself in Thee."
        ]
      },
      kiswahili: {
        title: "Mwamba Wenye Imara",
        verses: [
          "Mwamba wenye imara kwangu mimi,\nNiruhusu nijifiche ndani Yako;\nMaji hayo na damu takatifu,\nKutoka kwa ubavu wako ulioumia,\nZiwe dawa kamilifu ya dhambi,\nZiniokoe na ghadhabu na kunitakasa.",
          "Sio kazi ya mikono yangu tu\nInayoweza kutosheleza sheria Yako;\nHata kama ningekuwa na bidii kubwa,\nHata kama machozi yangu yingetiririka,\nHaiwezi kufuta dhambi zangu duni;\nNi Wewe pekee unayeweza kuniokoa.",
          "Ninapovuta pumzi hii fupi,\nMacho yangu yanapofumba katika mauti,\nNinapofufuka na kwenda nchi isiyojulikana,\nNa kukuona Wewe katika kiti cha enzi,\nMwamba wa kale, kimbilio langu,\nNiruhusu nijifiche ndani Yako."
        ]
      },
      luo: {
        title: "Lwanda Ma Nene",
        verses: [
          "Lwanda ma nene mochwere duto,\nKeto chunja mondo a-pandre kuom Yesu;\nPi to gi damu maler duto te,\nMa-o e ubavune mano ler chuth,\nWigo richona duto kendo piny te,\nWara e bura, wara e keth!",
          "Ok kuom tich mara mar mita te,\nMondo alose ratiro nyimi, Ruoth;\nHata ka chunja nitie hera mang'eny,\nHata m’apiyo to piny pi duto wang',\nOk nyal wigo richo duto kaka en;\nYesu kende e-Saviour mara!",
          "Saa mafuyo to chunja sasa piny,\nKa wang'wa te ochorore e tho,\nKa andingoe e pinje duto polo,\nKa aneno Ruoth e nyim kiti manyap,\nLwanda mochwere, Ruoth mara te,\nKeto chunja mondo a-pandre kuom Yesu!"
        ]
      }
    }
  },
  {
    id: 6,
    number: 6,
    category: "Comfort & Peace",
    key: "G Major",
    author: "Horatio Spafford, 1876",
    scripture: "2 Kings 4:26",
    description: "Written on the Atlantic Ocean near where Spafford's four daughters tragically drowned in a shipwreck. The hymn stands as a monumental masterpiece of quiet confidence in God.",
    melodyNotes: [
      { note: "G4", duration: 400 },
      { note: "G4", duration: 400 },
      { note: "F#4", duration: 400 },
      { note: "G4", duration: 400 },
      { note: "A4", duration: 800 },
      { note: "B4", duration: 400 },
      { note: "A4", duration: 800 },
      { note: "G4", duration: 400 },
      { note: "E4", duration: 400 },
      { note: "C5", duration: 800 },
      { note: "B4", duration: 400 },
      { note: "A4", duration: 1200 },
    ],
    languages: {
      english: {
        title: "It Is Well With My Soul",
        verses: [
          "When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.",
          "Though Satan should buffet, though trials should come,\nLet this blest assurance control,\nThat Christ hath regarded my helpless estate,\nAnd hath shed His own blood for my soul.",
          "My sin—oh, the bliss of this glorious thought!—\nMy sin, not in part, but the whole,\nIs nailed to the cross, and I bear it no more;\nPraise the Lord, praise the Lord, O my soul!",
          "And Lord, haste the day when the faith shall be sight,\nThe clouds be rolled back as a scroll;\nThe trump shall resound, and the Lord shall descend,\nEven so, it is well with my soul."
        ]
      },
      kiswahili: {
        title: "Salama Rohoni Mwangu",
        verses: [
          "Ninapopata amani kama mto wa heri,\nAu huzuni kama dhoruba ya bahari;\nKwa lolote utakalo nishushie, Bwana,\nNi salama, ni salama rohoni mwangu.",
          "Hata kama Shetani ananitesa na kutama,\nNaacha hakika hii dhabiti iongoze,\nKwamba Kristo amejali hali yangu duni,\nAkamwaga damu Yake kwa ajili ya roho yangu.",
          "Dhambi zangu—lo, wazo hili la utukufu sana!\nDhambi zangu zote, sio nusu tu bali zote,\nZimepachikwa msalabani, sizibebi tena;\nMhimidi Bwana, mhimidi Bwana, Ee roho yangu!",
          "Ee Bwana, fanya haraka siku hiyo ya furaha,\nWakati mawingu yatakapokunjwa kama kitabu;\nZumaridi itakapovuma na Bwana atakaposhuka,\nHata hivyo, ni salama rohoni mwangu."
        ]
      },
      luo: {
        title: "Kidh' Maber Kuom Roho Mara",
        verses: [
          "Kapoyo kuwe mosudo e chunja kaka aora,\nKa masiche morem kaka dhoruba lweny;\nHata kapoyo marach duto obino,\nIn opuonja wacho: Kidhi maber kuom roho mara.",
          "Hata ka satan otemo chunywa te,\nKendo temruok mang'eny owacho herana;\nMondo Kristo asiki e kor chunywa,\nKendo owiri damu maler nwa.",
          "Richona duto—mano lalo maber polo te!\nRichona duto te, ok nusu kende,\nOs’ego e msalaba, ok abendoga anyalo dho;\nPak Bwana duto, pak Bwana duto roho mara!",
          "Ee Ruoth, kel piny ratiro mar yie duto,\nWiny polo mondo olandre piny te;\nMalaika obi, kendo Ruoth obi gweny,\nHata sasa to, Kidhi maber kuom roho mara."
        ]
      }
    }
  },
  {
    id: 7,
    number: 7,
    category: "Praise & Worship",
    key: "G Major",
    author: "Fanny Crosby, 1875",
    scripture: "Galatians 6:14",
    description: "Another masterfully scripted hymn by Fanny Crosby. It highlights the epic magnitude of Calvary and prompts all nations to rejoice in God's glorious redemption.",
    melodyNotes: [
      { note: "D4", duration: 400 },
      { note: "B4", duration: 600 },
      { note: "A4", duration: 200 },
      { note: "G4", duration: 400 },
      { note: "D4", duration: 400 },
      { note: "E4", duration: 600 },
      { note: "D4", duration: 200 },
      { note: "C4", duration: 800 },
      { note: "E4", duration: 400 },
      { note: "C5", duration: 600 },
      { note: "B4", duration: 200 },
      { note: "A4", duration: 400 },
      { note: "D4", duration: 400 },
    ],
    languages: {
      english: {
        title: "To God Be the Glory",
        verses: [
          "To God be the glory, great things He has done!\nSo loved He the world that He gave us His Son,\nWho yielded His life an atonement for sin,\nAnd opened the life gate that all may go in.",
          "O perfect redemption, the purchase of blood,\nTo every believer the promise of God;\nThe vilest offender who truly believes,\nThat moment from Jesus a pardon receives.",
          "Praise the Lord, praise the Lord,\nLet the earth hear His voice!\nPraise the Lord, praise the Lord,\nLet the people rejoice!\nOh, come to the Father, through Jesus the Son,\nAnd give Him the glory, great things He has done!"
        ]
      },
      kiswahili: {
        title: "Mungu Apewe Sifa",
        verses: [
          "Mungu apewe sifa, mambo makuu kafanya!\nAliupenda ulimwengu akatupa Mwanae,\nAliyejitolea nafsi Yake kwa ajili ya dhambi,\nAkafungua mlango wa uzima wote waingie.",
          "Wokovu kamili, uliokombolewa kwa damu,\nKwa kila mwamini ahadi kuu ya Mungu;\nHata mkosaji mbaya zaidi anayeamini truly,\nsaa hiyo anapokea msamaha kutoka kwa Yesu.",
          "Mhimidi Bwana, mhimidi Bwana,\nNchi isikie sauti Yake!\nMhimidi Bwana, mhimidi Bwana,\nWatu wote washangilie!\nNjoo kwa Baba, kwa njia ya Yesu Mwanae,\nNa umpe sifa, mambo makuu kafanya!"
        ]
      },
      luo: {
        title: "Dwong' Obed Ni Mungu",
        verses: [
          "Duong' obed ni Mungu, ma gigo maduong' otimo!\nOhero pinje duto to gi Wuode maber,\nMane omiyo herana te e tho keth,\nKendo oyawore rangach polo nwa duto te.",
          "Warruok maber chuth, kuom o- damu te,\nNe jikanyo duto ma-yie kuom Nyasaye;\nHata jaricho malich m’oyie kuom Yesu,\nSaa okang'no to Yesu boro richone piny chuth.",
          "Pak Bwana maber, pak Bwana maber,\nPiny duto dho-winj dwolne!\nPak Bwana maber, pak Bwana maber,\nJi duto mondo ochunyi wer ratiro!\nBi kuom Baba, kuom Yesu Wuode maber,\nDuong' obed ni Mungu gidho maduong' otimo!"
        ]
      }
    }
  },
  {
    id: 8,
    number: 8,
    category: "Grace & Salvation",
    key: "A-flat Major",
    author: "Fanny Crosby, 1868",
    scripture: "Luke 18:38",
    description: "Inspired by speaking to prison inmates who cried out 'Do not pass us by, O Savior!', Crosby penned this deep intercessory prayer of complete dependence on Christ.",
    melodyNotes: [
      { note: "C5", duration: 400 },
      { note: "Bb4", duration: 400 },
      { note: "Ab4", duration: 400 },
      { note: "F4", duration: 400 },
      { note: "Ab4", duration: 800 },
      { note: "Eb4", duration: 400 },
      { note: "Ab4", duration: 400 },
      { note: "Ab4", duration: 200 },
      { note: "Bb4", duration: 200 },
      { note: "C5", duration: 400 },
      { note: "Bb4", duration: 1200 },
    ],
    languages: {
      english: {
        title: "Pass Me Not, O Gentle Savior",
        verses: [
          "Pass me not, O gentle Savior,\nHear my humble cry;\nWhile on others Thou art calling,\nDo not pass me by.",
          "Trusting only in Thy merit,\nWould I seek Thy face;\nHeal my wounded, broken spirit,\nSave me by Thy grace.",
          "Savior, Savior,\nHear my humble cry;\nWhile on others Thou art calling,\nDo not pass me by."
        ]
      },
      kiswahili: {
        title: "Usipite Mwokozi Mwema",
        verses: [
          "Usipite Mwokozi mwema, usipite Bwana,\nSikia kilio changu cha unyenyekevu;\nWakati unapoita wengine njoo kwangu,\nUsipite karibu nami bila kunijali.",
          "Nikitumaini tu fadhila Zako kuu,\nNinatazama uso Wako mpendwa Bwana;\nPonya roho yangu iliyoumia na kuvunjika,\nUniokoe kwa neema Yako kamilifu.",
          "Mwokozi, Mwokozi,\nSikia kilio changu cha unyenyekevu;\nWakati unapoita wengine njoo kwangu,\nUsipite karibu nami bila kunijali."
        ]
      },
      luo: {
        title: "Kik Ikala Ruoth Makwar",
        verses: [
          "Kik ikala Ruoth makwar maber,\nWinj lamo mara manyap chuth;\nWakati ma’iluogo jo mamoko te,\nKik ikala kenda piny!",
          "An kuom tich mari kende Ruoth,\nAmanyo wang'i te gi hera;\nPonya roho mara morem chuth piny te,\nWara kuom neema mari.",
          "Yesu, Yesu,\nWinj lamo mara manyap chuth;\nWakati ma’iluogo jo mamoko te,\nKik ikala kenda piny!"
        ]
      }
    }
  }
];
