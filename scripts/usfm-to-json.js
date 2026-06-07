#!/usr/bin/env node
/**
 * USFM to JSON Converter for BibliaElo
 *
 * Converts USFM files from eBible.org into the JSON format expected by the app.
 *
 * Output format:
 * [
 *   { "name": "Genesis", "abbrev": "gn", "chapters": [["verse1", "verse2", ...], ...] },
 *   ...
 * ]
 *
 * Usage:
 *   node scripts/usfm-to-json.js <usfm-directory> <output-file> [--lang pt|en|es|...]
 *
 * Example:
 *   node scripts/usfm-to-json.js sources/porbr2018 json/pt_blivre.json --lang pt
 */

const fs = require('fs')
const path = require('path')

// ─── Book Order (canonical 66 books) ─────────────────────────────────────────

const BOOK_ORDER = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
  '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO',
  'ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
  'OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
  'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS',
  '1PE','2PE','1JN','2JN','3JN','JUD','REV'
]

// Alternative USFM book IDs that some translations use
const BOOK_ID_ALIASES = {
  'Gen': 'GEN', 'Exo': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deu': 'DEU',
  'Jos': 'JOS', 'Jdg': 'JDG', 'Rut': 'RUT', 'Jdg': 'JDG',
  '1Sa': '1SA', '2Sa': '2SA', '1Ki': '1KI', '2Ki': '2KI',
  '1Ch': '1CH', '2Ch': '2CH', 'Ezr': 'EZR', 'Neh': 'NEH',
  'Est': 'EST', 'Job': 'JOB', 'Psa': 'PSA', 'Pro': 'PRO',
  'Ecc': 'ECC', 'Sng': 'SNG', 'Sol': 'SNG', 'Son': 'SNG',
  'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM', 'Ezk': 'EZK', 'Eze': 'EZK',
  'Dan': 'DAN', 'Hos': 'HOS', 'Jol': 'JOL', 'Joe': 'JOL',
  'Amo': 'AMO', 'Oba': 'OBA', 'Obd': 'OBA', 'Jon': 'JON', 'Mic': 'MIC',
  'Nam': 'NAM', 'Nah': 'NAM', 'Hab': 'HAB', 'Zep': 'ZEP', 'Zph': 'ZEP',
  'Hag': 'HAG', 'Zec': 'ZEC', 'Zch': 'ZEC', 'Mal': 'MAL',
  'Mat': 'MAT', 'Mrk': 'MRK', 'Mar': 'MRK', 'Luk': 'LUK',
  'Jhn': 'JHN', 'Joh': 'JHN', 'Act': 'ACT',
  'Rom': 'ROM', '1Co': '1CO', '2Co': '2CO', 'Gal': 'GAL',
  'Eph': 'EPH', 'Php': 'PHP', 'Phi': 'PHP', 'Col': 'COL',
  '1Th': '1TH', '2Th': '2TH', '1Ti': '1TI', '2Ti': '2TI',
  'Tit': 'TIT', 'Phm': 'PHM', 'Plm': 'PHM', 'Heb': 'HEB',
  'Jas': 'JAS', 'Jam': 'JAS', '1Pe': '1PE', '2Pe': '2PE',
  '1Jn': '1JN', '2Jn': '2JN', '3Jn': '3JN',
  'Jud': 'JUD', 'Jde': 'JUD', 'Rev': 'REV',
  // eBible.org sometimes uses full 3-letter codes in different case
  'gen': 'GEN', 'exo': 'EXO', 'lev': 'LEV', 'num': 'NUM', 'deu': 'DEU',
}

// ─── Book Names by Language ──────────────────────────────────────────────────

const BOOK_NAMES = {
  pt: [
    'Gênesis','Êxodo','Levítico','Números','Deuteronômio','Josué','Juízes','Rute',
    '1 Samuel','2 Samuel','1 Reis','2 Reis','1 Crônicas','2 Crônicas',
    'Esdras','Neemias','Ester','Jó','Salmos','Provérbios','Eclesiastes','Cânticos',
    'Isaías','Jeremias','Lamentações','Ezequiel','Daniel','Oséias','Joel',
    'Amós','Obadias','Jonas','Miquéias','Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias',
    'Mateus','Marcos','Lucas','João','Atos','Romanos','1 Coríntios','2 Coríntios',
    'Gálatas','Efésios','Filipenses','Colossenses','1 Tessalonicenses','2 Tessalonicenses',
    '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus','Tiago',
    '1 Pedro','2 Pedro','1 João','2 João','3 João','Judas','Apocalipse'
  ],
  en: [
    'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
    '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
    'Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
    'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel',
    'Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
    'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians',
    'Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians',
    '1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James',
    '1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
  ],
  es: [
    'Génesis','Éxodo','Levítico','Números','Deuteronomio','Josué','Jueces','Rut',
    '1 Samuel','2 Samuel','1 Reyes','2 Reyes','1 Crónicas','2 Crónicas',
    'Esdras','Nehemías','Ester','Job','Salmos','Proverbios','Eclesiastés','Cantares',
    'Isaías','Jeremías','Lamentaciones','Ezequiel','Daniel','Oseas','Joel',
    'Amós','Abdías','Jonás','Miqueas','Nahúm','Habacuc','Sofonías','Hageo','Zacarías','Malaquías',
    'Mateo','Marcos','Lucas','Juan','Hechos','Romanos','1 Corintios','2 Corintios',
    'Gálatas','Efesios','Filipenses','Colosenses','1 Tesalonicenses','2 Tesalonicenses',
    '1 Timoteo','2 Timoteo','Tito','Filemón','Hebreos','Santiago',
    '1 Pedro','2 Pedro','1 Juan','2 Juan','3 Juan','Judas','Apocalipsis'
  ]
}

const STANDARD_ABBREVS = [
  'gn','ex','lv','nm','dt','js','jz','rt','1sm','2sm','1rs','2rs','1cr','2cr',
  'ed','ne','et','jo_at','sl','pv','ec','ct','is','jr','lm','ez','dn','os','jl',
  'am','ob','jn','mq','na','hc','sf','ag','zc','ml',
  'mt','mc','lc','jo','atos','rm','1co','2co','gl','ef','fp','cl','1ts','2ts',
  '1tm','2tm','tt','fm','hb','tg','1pe','2pe','1jo','2jo','3jo','jd','ap'
]

// ─── USFM Parser ─────────────────────────────────────────────────────────────

/**
 * Parse a single USFM file into a structured book object.
 */
function parseUSFMFile(content) {
  const lines = content.split(/\r?\n/)

  let bookId = null
  let bookTitle = null
  let chapters = []
  let currentChapter = null
  let currentVerses = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Book identifier: \id GEN ...
    if (line.startsWith('\\id ')) {
      bookId = line.replace('\\id ', '').split(/\s/)[0].trim().toUpperCase()
      continue
    }

    // Main title: \mt or \mt1
    if (line.match(/^\\mt\d?\s/)) {
      bookTitle = line.replace(/^\\mt\d?\s+/, '').trim()
      continue
    }

    // Heading (used for book title in some translations): \h
    if (line.startsWith('\\h ') && !bookTitle) {
      bookTitle = line.replace('\\h ', '').trim()
      continue
    }

    // Chapter: \c N
    if (line.startsWith('\\c ')) {
      // Save previous chapter
      if (currentChapter !== null && currentVerses.length > 0) {
        chapters.push([...currentVerses])
      }
      currentChapter = parseInt(line.replace('\\c ', '').trim(), 10)
      currentVerses = []
      continue
    }

    // Verse: \v N text...
    if (line.startsWith('\\v ')) {
      const match = line.match(/^\\v\s+(\d+)\s+(.*)/)
      if (match) {
        const verseText = cleanUSFMText(match[2])
        if (verseText) {
          currentVerses.push(verseText)
        }
      }
      continue
    }

    // Paragraph markers with verse text continuation
    if (line.match(/^\\(p|pi\d?|q\d?|m|nb)\s/) && currentVerses.length > 0) {
      const text = line.replace(/^\\(p|pi\d?|q\d?|m|nb)\s+/, '').trim()
      if (text && !text.startsWith('\\')) {
        // Append to last verse
        const cleaned = cleanUSFMText(text)
        if (cleaned) {
          currentVerses[currentVerses.length - 1] += ' ' + cleaned
        }
      }
    }
  }

  // Save last chapter
  if (currentChapter !== null && currentVerses.length > 0) {
    chapters.push([...currentVerses])
  }

  return { bookId, bookTitle, chapters }
}

/**
 * Remove USFM formatting markers from verse text.
 */
function cleanUSFMText(text) {
  return text
    // Remove footnotes: \f ... \f*
    .replace(/\\f\s.*?\\f\*/g, '')
    // Remove cross references: \x ... \x*
    .replace(/\\x\s.*?\\x\*/g, '')
    // Remove word-level markers: \w word|...\w*
    .replace(/\\w\s+(.*?)\|.*?\\w\*/g, '$1')
    .replace(/\\w\s+(.*?)\\w\*/g, '$1')
    // Remove character styles: \add ...\add*, \it ...\it*, \bk ...\bk*, \wj ...\wj*, etc.
    .replace(/\\(add|it|bk|em|bd|sc|wj|nd|tl|qt|sig|sls|ord|pn|qs)\s+/g, '')
    .replace(/\\(add|it|bk|em|bd|sc|wj|nd|tl|qt|sig|sls|ord|pn|qs)\*/g, '')
    // Remove remaining backslash markers
    .replace(/\\[a-z]+\d?\s*/g, '')
    .replace(/\\[a-z]+\d?\*/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('Usage: node usfm-to-json.js <usfm-directory> <output-file> [--lang pt|en|es]')
    console.log('')
    console.log('Example:')
    console.log('  node scripts/usfm-to-json.js sources/porbr2018 json/pt_blivre.json --lang pt')
    process.exit(1)
  }

  const usfmDir = path.resolve(args[0])
  const outputFile = path.resolve(args[1])
  const langIdx = args.indexOf('--lang')
  const lang = langIdx !== -1 ? args[langIdx + 1] : null
  const bookNames = lang && BOOK_NAMES[lang] ? BOOK_NAMES[lang] : null

  if (!fs.existsSync(usfmDir)) {
    console.error(`❌ Directory not found: ${usfmDir}`)
    process.exit(1)
  }

  console.log(`📖 Parsing USFM files from: ${usfmDir}`)

  // Read all .usfm files
  const files = fs.readdirSync(usfmDir)
    .filter(f => f.endsWith('.usfm') || f.endsWith('.SFM') || f.endsWith('.sfm'))
    .sort()

  console.log(`📂 Found ${files.length} USFM files`)

  // Parse each file
  const parsedBooks = new Map()

  for (const file of files) {
    const content = fs.readFileSync(path.join(usfmDir, file), 'utf-8')
    const parsed = parseUSFMFile(content)

    if (!parsed.bookId) {
      console.warn(`  ⚠️  Skipping ${file}: no book ID found`)
      continue
    }

    // Normalize book ID
    let normalizedId = parsed.bookId.toUpperCase()
    if (BOOK_ID_ALIASES[parsed.bookId]) {
      normalizedId = BOOK_ID_ALIASES[parsed.bookId]
    }

    if (BOOK_ORDER.includes(normalizedId)) {
      parsedBooks.set(normalizedId, parsed)
      const chapCount = parsed.chapters.length
      const verseCount = parsed.chapters.reduce((sum, ch) => sum + ch.length, 0)
      process.stdout.write(`  ✅ ${file} → ${normalizedId} (${chapCount} caps, ${verseCount} versículos)\n`)
    } else {
      console.warn(`  ⚠️  Skipping ${file}: book ID "${parsed.bookId}" not in canonical 66`)
    }
  }

  // Build output in canonical order
  const output = []
  let totalVerses = 0

  for (let i = 0; i < BOOK_ORDER.length; i++) {
    const bookCode = BOOK_ORDER[i]
    const parsed = parsedBooks.get(bookCode)

    if (!parsed) {
      console.warn(`  ❓ Missing book: ${bookCode}`)
      continue
    }

    const name = bookNames ? bookNames[i] : (parsed.bookTitle || bookCode)
    const abbrev = STANDARD_ABBREVS[i]
    const verseCount = parsed.chapters.reduce((sum, ch) => sum + ch.length, 0)
    totalVerses += verseCount

    output.push({
      name,
      abbrev,
      chapters: parsed.chapters,
    })
  }

  // Write output
  const outputDir = path.dirname(outputFile)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 0), 'utf-8')

  const sizeMB = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(1)

  console.log('')
  console.log(`✅ Output: ${outputFile}`)
  console.log(`📊 ${output.length} books, ${totalVerses} verses, ${sizeMB} MB`)

  // Validation
  if (output.length !== 66) {
    console.warn(`⚠️  WARNING: Expected 66 books, got ${output.length}`)
  }
}

main()
