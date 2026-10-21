/* Original doodles for Dodo. Sources stay editable; PNGs work in native image views. */
const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'assets/doodles')
const source = path.join(root, 'design/handdrawn/sources')
const ink = '#5b4b40', paper = '#fff9eb', rose = '#dda5a1', sage = '#afbd95', yellow = '#efd18a', blue = '#aac3cc'
const p = (d, fill='none') => `<path d="${d}" fill="${fill}"/>`
const c = (x,y,r,fill=paper) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
const icons = {
  'category-food':p('M10 31 Q31 27 54 32 Q51 53 32 54 Q15 53 10 31Z',yellow)+p('M14 31 Q30 37 51 32 M20 18 L43 24 M23 12 L46 19 M26 30 Q22 24 29 22 M35 31 Q39 23 34 21'),
  'category-shopping':p('M15 24 L49 23 L53 54 Q32 58 11 53Z',rose)+p('M23 26 L23 17 Q31 6 41 17 L42 25 M26 39 Q32 45 39 38'),
  'category-snack':p('M12 29 L49 29 L52 51 Q30 57 11 52Z',yellow)+p('M12 30 L40 14 L49 29Z',rose)+p('M12 40 Q20 35 26 40 T49 40')+c(37,13,4,rose)+p('M38 9 Q44 5 47 9'),
  'category-transport':p('M15 12 Q32 8 49 13 L52 48 Q33 52 12 48Z',blue)+p('M18 20 L45 20 L47 34 L17 34Z',paper)+p('M31 21 L31 33 M19 42 L23 42 M40 42 L44 42')+c(20,50,4)+c(44,50,4),
  'category-pet':p('M18 48 Q15 38 25 33 Q31 22 40 34 Q54 43 46 50 Q39 54 32 49 Q23 55 18 48Z',rose)+p('M12 26 Q6 17 12 14 Q20 13 20 23 Q18 30 12 26Z',rose)+p('M24 20 Q17 8 25 7 Q32 8 31 18 Q30 24 24 20Z',rose)+p('M39 20 Q34 10 41 8 Q49 10 46 19 Q44 24 39 20Z',rose)+p('M49 29 Q47 21 54 19 Q62 23 55 30 Q52 32 49 29Z',rose),
  'category-fruit':p('M27 22 Q13 24 16 40 Q20 55 34 53 Q50 51 48 36 Q47 26 37 23Z',sage)+p('M31 26 Q28 17 33 10 M33 17 Q41 9 48 15 Q41 24 33 17Z',sage)+p('M23 33 Q20 39 25 44'),
  'category-clothes':p('M22 13 L29 17 L36 13 L52 23 L44 34 L39 30 L40 53 L18 53 L19 30 L13 33 L7 24Z',blue)+p('M23 14 Q27 26 36 14 M23 47 L35 47'),
  'category-sport':p('M12 21 L24 22 Q28 36 42 38 Q55 38 56 48 L55 53 L10 53 Q7 42 12 21Z',sage)+p('M12 47 L54 47 M23 30 L29 27 M28 35 L34 32 M34 39 L40 36 M15 28 L14 39'),
  'category-fun':p('M18 22 Q30 18 45 23 Q52 30 55 45 Q54 55 45 46 L38 40 L25 40 L17 47 Q9 54 9 44 Q9 28 18 22Z',blue)+p('M16 30 L26 30 M21 25 L21 35')+c(42,29,2,rose)+c(47,35,2,yellow),
  'category-home':p('M10 30 L31 11 L54 29 M16 27 L16 53 L49 52 L48 26',yellow)+p('M27 53 L27 38 L38 38 L39 53 M21 31 L25 31 M41 31 L44 31'),
  'category-software':p('M22 8 L44 10 L43 56 L20 55Z',blue)+p('M24 16 L40 17 L39 45 L23 45Z',paper)+p('M29 13 L35 13')+c(31,51,1.5)+p('M28 29 L32 25 L36 30 L32 35Z',sage),
  'category-beauty':p('M20 53 L44 53 M32 37 L31 52')+p('M16 23 Q14 8 31 8 Q48 10 47 25 Q44 40 31 38 Q16 38 16 23Z',rose)+p('M22 20 Q23 14 29 14 M22 26 L22 27'),
  'category-hotel':p('M9 53 L9 24 M54 29 L55 53 M9 47 L55 47 M10 35 L51 35 Q55 35 55 44 L10 44Z',yellow)+p('M14 33 L14 25 L28 25 L29 34Z',paper)+p('M32 34 L32 28 L50 28 L51 35Z',rose),
  'category-travel':p('M9 35 L26 29 L28 12 Q32 6 35 12 L36 28 L53 35 L52 39 L36 36 L35 49 L41 53 L40 56 L31 53 L23 56 L22 53 L28 49 L27 36 L10 39Z',blue),
  'category-child':c(20,16,7,yellow)+c(44,17,7,yellow)+p('M17 26 Q15 14 31 13 Q49 13 47 29 Q45 40 31 39 Q18 38 17 26Z',yellow)+p('M24 38 Q14 42 13 51 Q18 56 24 50 Q31 57 40 50 Q48 56 51 49 Q49 41 40 38',yellow)+c(25,25,1,ink)+c(39,25,1,ink)+p('M29 30 L32 32 L35 29 M32 32 L31 35'),
  'category-elder':p('M14 27 L46 27 L44 47 Q29 54 17 46Z',yellow)+p('M46 29 Q61 26 55 38 Q52 42 46 40 M10 53 Q32 58 51 52 M23 21 Q18 16 24 11 M35 21 Q30 15 36 10')+p('M25 35 Q29 29 32 35 Q36 28 39 34 Q40 38 32 42 Q25 38 25 35Z',rose),
  'category-car':p('M10 32 L18 17 L43 18 L53 34 L56 46 L8 46Z',sage)+p('M19 22 L41 23 L46 33 L14 32Z',paper)+p('M30 23 L30 32 M13 39 L18 39 M45 39 L50 39')+c(18,48,5)+c(45,48,5),
  'category-health':p('M22 20 L23 12 L41 12 L42 20 M11 21 Q31 18 53 22 L52 52 L11 52Z',rose)+p('M28 27 L36 27 L36 34 L43 34 L43 41 L36 41 L36 48 L28 48 L28 41 L21 41 L21 34 L28 34Z',paper),
  'category-book':p('M8 16 Q19 11 31 19 Q44 12 56 17 L54 51 Q42 47 31 54 Q19 48 8 52Z',yellow)+p('M31 20 L31 52 M14 25 Q21 24 25 28 M14 33 Q20 31 25 35 M38 27 L49 25 M38 35 L48 33'),
  'category-study':p('M13 49 L17 38 L45 9 L53 17 L25 47Z',yellow)+p('M17 38 L25 47 M39 15 L47 24 M13 49 L21 47 L15 42Z',ink)+p('M31 53 L55 53 M37 46 L52 46'),
  'category-lottery':p('M9 19 L54 19 L53 29 Q44 33 53 38 L54 48 L10 48 L11 38 Q20 33 10 29Z',rose)+p('M25 21 L25 27 M25 31 L25 36 M25 40 L25 46 M38 25 L40 30 L46 31 L42 35 L43 41 L38 38 L33 40 L34 34 L30 31 L36 30Z',yellow),
  'category-loss':c(23,26,14,yellow)+p('M20 17 L27 17 M20 24 L26 24 M24 15 L22 35 M30 35 L42 47 L52 36 M42 47 L42 37 M42 47 L51 47'),
  'category-gift':p('M12 29 L53 28 L52 52 L13 53Z',rose)+p('M9 22 L55 22 L55 30 L9 30Z',yellow)+p('M28 23 L35 23 L35 53 L28 53Z',yellow)+p('M31 21 Q14 21 18 12 Q26 7 31 21 Q34 5 43 11 Q49 20 31 21Z',rose),
  'category-office':p('M17 11 L48 13 L47 54 L14 53Z',sage)+p('M23 12 L23 53 M10 18 L19 18 M10 28 L19 28 M10 39 L19 39 M10 48 L19 48 M29 24 L41 24 M29 33 L39 33'),
  'category-salary':p('M9 19 L55 20 L53 51 L10 50Z',yellow)+p('M10 21 L31 36 L54 21 M10 49 L25 35 M54 50 L39 35')+p('M21 12 L21 24 L42 24 L42 11Z',paper)+p('M27 17 L36 17'),
  'category-side':p('M21 40 L43 40 L40 55 L25 55Z',rose)+p('M32 40 L31 16 M31 30 Q13 29 13 17 Q30 14 31 30Z',sage)+p('M32 23 Q34 9 50 13 Q50 28 32 23Z',sage),
  'category-invest':p('M9 47 L9 54 L28 55 L28 47Z',yellow)+p('M9 40 L10 47 L28 47 L28 40Z',yellow)+p('M31 31 L31 54 L52 54 L51 31Z',sage)+p('M32 28 L41 16 L52 23 M41 16 L41 25 M41 16 L50 15'),
  'category-bonus':p('M16 12 L49 14 L47 54 L15 53Z',rose)+p('M16 14 L31 28 L49 15')+c(32,36,9,yellow)+p('M28 34 L35 34 M29 39 L35 39 M32 31 L32 42'),
  'category-other-income':p('M19 25 L46 25 L49 52 Q34 58 16 52Z',blue)+p('M21 20 L44 20 L44 26 L20 26Z',yellow)+p('M31 10 L33 15 L39 15 L35 19 L36 24 L31 21 L27 24 L28 19 L24 15 L29 15Z',yellow)+p('M24 37 Q31 44 40 36'),
  'category-other':p('M31 9 L36 24 L52 28 L39 37 L41 53 L29 43 L15 51 L18 35 L7 25 L24 23Z',yellow),
  'asset-daily':p('M12 21 L48 16 L49 24 M11 23 L51 24 L52 51 L11 51Z',rose)+p('M40 31 L55 31 L55 43 L40 43Z',yellow)+c(45,37,1,ink)+p('M16 29 L33 29'),
  'asset-savings':p('M13 27 Q20 14 40 21 L50 18 L50 29 L56 32 L55 41 L49 42 L47 52 L40 51 L40 46 L25 46 L24 52 L17 52 L16 44 Q8 39 13 27Z',rose)+p('M12 33 Q2 32 7 26 M25 21 L37 21')+c(44,30,1.4,ink)+c(31,10,6,yellow)+p('M31 6 L31 13'),
  'asset-cash':p('M10 22 L51 17 L56 45 L14 51Z',sage)+p('M9 16 L52 21 L50 49 L7 44Z',yellow)+c(30,32,9,paper)+p('M30 26 L30 38 M26 29 L34 29 M26 34 L34 34 M13 26 L17 27 M41 39 L45 40'),
  'asset-bank-card':p('M9 18 Q30 15 55 19 L54 48 Q31 52 8 48Z',blue)+p('M9 27 L54 28 M15 35 L24 35 L24 42 L15 41Z',yellow)+p('M31 42 L37 42 M42 42 L47 42'),
  'asset-payment':p('M19 8 L43 9 L43 54 L18 53Z',sage)+p('M23 15 L39 15 L39 42 L22 42Z',paper)+p('M27 25 L34 25 M27 31 L33 31 M31 22 L30 35')+c(31,48,1.5,ink),
  'asset-investment':c(30,42,14,yellow)+p('M29 29 L30 11 M29 23 Q14 23 15 12 Q27 10 29 23Z',sage)+p('M30 19 Q35 6 47 10 Q46 23 30 19Z',sage)+p('M27 38 L34 38 M27 44 L33 44 M30 35 L30 48'),
  'asset-travel':p('M24 19 L24 12 L40 12 L40 19 M13 20 L51 21 L52 51 L12 52Z',yellow)+p('M21 22 L21 51 M43 22 L44 50 M25 33 L38 33 L38 42 L25 42Z',paper)+c(20,55,2,ink)+c(45,55,2,ink),
  'asset-emergency':p('M12 15 L31 9 L51 16 Q51 43 31 55 Q10 42 12 15Z',sage)+p('M27 22 L35 22 L35 29 L42 29 L42 36 L35 36 L35 43 L27 43 L27 36 L20 36 L20 29 L27 29Z',paper),
  'asset-family':p('M8 30 L31 10 L56 31 M15 27 L16 53 L49 53 L49 26',yellow)+p('M23 35 Q23 28 31 34 Q39 27 42 35 Q42 42 32 47 Q22 42 23 35Z',rose),
  'nav-ledger':p('M17 9 L49 12 L47 55 L14 54Z',yellow)+p('M23 10 L22 54 M10 18 L19 18 M10 29 L19 29 M10 41 L19 41 M10 50 L19 50 M29 24 L41 25 M29 34 L40 35'),
  'nav-wallet':p('M11 23 L48 16 L49 24 M10 24 L52 25 L52 51 L10 51Z',sage)+p('M40 32 L56 32 L56 43 L40 43Z',yellow)+c(45,37,1,ink),
  'nav-chart':p('M12 11 L11 53 L55 53')+p('M19 35 L25 35 L25 47 L19 47Z',rose)+p('M32 25 L38 25 L38 47 L32 47Z',yellow)+p('M45 15 L51 15 L51 47 L45 47Z',sage),
  'nav-cat':p('M12 28 L12 10 L26 21 Q33 18 40 21 L53 10 L52 29 Q59 53 33 55 Q5 55 12 28Z',paper)+p('M16 12 L25 21 M49 14 L41 22')+c(24,33,1.5,ink)+c(41,33,1.5,ink)+p('M29 38 L33 41 L36 38 M33 41 Q29 46 25 42 M33 41 Q37 46 41 42 M9 36 L18 37 M47 37 L56 36'),
  'nav-settings':p('M26 10 L38 10 L40 17 L46 21 L53 20 L58 31 L52 36 L50 43 L52 49 L42 56 L36 51 L28 51 L22 56 L12 49 L15 42 L12 36 L6 32 L10 21 L18 22 L24 17Z',yellow)+c(32,33,12,paper)+c(32,33,5,sage),
}

function svg(body, width=64,height=64) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`
}
async function write(name, text, width) {
  fs.writeFileSync(path.join(source,name+'.svg'),text)
  await sharp(Buffer.from(text)).resize({width}).png({palette:true}).toFile(path.join(out,name+'.png'))
}
;(async()=>{
  fs.mkdirSync(out,{recursive:true});fs.mkdirSync(source,{recursive:true})
  for(const [name,body] of Object.entries(icons)) await write(name,svg(body),192)
  // A fresh illustration: a cat keeping a little journal on its desk.
  const scene = `<path d="M25 164 Q145 154 285 164" fill="none"/>
    <path d="M35 146 L150 146 L150 161 L34 161Z" fill="${sage}"/>
    <path d="M43 132 L157 133 L153 147 L40 146Z" fill="${rose}"/>
    <path d="M50 121 L145 119 L151 132 L42 132Z" fill="${yellow}"/>
    <path d="M64 115 Q48 104 57 77 L52 39 L78 56 Q91 52 104 57 L129 39 L125 78 Q136 107 113 118Z" fill="${paper}"/>
    <path d="M54 41 L73 58 M126 42 L107 59 M59 90 L73 91 M109 91 L124 88 M61 99 L73 96 M110 98 L122 101" fill="none"/>
    <circle cx="79" cy="80" r="2" fill="${ink}"/><circle cx="106" cy="81" r="2" fill="${ink}"/>
    <path d="M88 90 L94 94 L100 90 M94 94 Q88 102 81 96 M94 94 Q101 102 108 96" fill="none"/>
    <path d="M73 64 Q71 75 76 78 M91 56 L91 67 M111 64 L107 74" fill="none"/>
    <path d="M139 116 Q165 127 163 105 Q158 92 149 103 Q145 114 154 115" fill="none"/>
    <path d="M178 121 Q197 114 217 121 Q237 113 256 120 L254 156 Q235 150 217 158 Q196 151 177 156Z" fill="${paper}"/>
    <path d="M217 123 L217 155 M185 131 L207 134 M185 141 L204 143 M229 133 L245 130 M229 143 L244 140" fill="none"/>
    <path d="M245 99 L250 83 L263 55 L270 59 L257 91Z" fill="${yellow}"/>
    <path d="M260 60 L267 64 M245 99 L251 96" fill="none"/>
    <path d="M190 95 L185 66 L208 64 L207 95Z" fill="${rose}"/><path d="M190 64 L189 46 M200 64 L204 39" fill="none"/>
    <path d="M187 49 Q174 49 179 39 Q186 31 192 42 Q201 37 202 48 Q200 57 187 49Z" fill="${yellow}"/>
    <path d="M201 38 Q192 31 199 26 Q207 22 211 30 Q218 28 219 36 Q215 44 201 38Z" fill="${paper}"/>
    <path d="M19 68 L23 60 L27 68 L36 70 L27 73 L23 82 L19 73 L12 70Z" fill="${yellow}"/>
    <path d="M149 43 L152 36 M146 36 L155 41 M281 123 L284 116 M280 116 L287 122" fill="none"/>`
  await write('cat-journal',svg(scene,300,185),900)
  // The same little cat, now proudly guarding savings and a treasure chest.
  const wealth = `<path d="M17 165 Q148 158 286 165" fill="none"/>
    <path d="M34 91 L78 84 L90 122 L43 130Z" fill="${sage}"/>
    <path d="M41 96 L73 91 L81 117 L47 123Z" fill="none"/><circle cx="61" cy="107" r="8" fill="${paper}"/>
    <path d="M58 104 L65 104 M58 109 L64 109 M62 101 L61 114" fill="none"/>
    <path d="M104 140 Q93 114 112 91 L166 91 Q189 115 177 148 Q148 160 104 149Z" fill="${paper}"/>
    <path d="M109 98 Q91 102 97 119 Q104 124 116 116 M168 102 Q182 106 178 121 Q173 125 164 118" fill="${paper}"/>
    <path d="M113 142 Q99 140 102 153 Q115 160 130 151 M151 151 Q172 162 180 151 Q179 142 167 141" fill="${paper}"/>
    <path d="M178 138 Q201 154 205 133 Q207 117 195 115 Q185 116 191 126" fill="none"/>
    <path d="M108 91 Q94 76 104 54 L101 26 L122 43 Q140 36 157 43 L180 26 L177 55 Q188 80 173 94 Q143 108 108 91Z" fill="${paper}"/>
    <path d="M104 30 L120 45 M177 30 L160 45 M108 75 L119 77 M163 77 L178 73 M109 84 L119 81 M163 82 L177 87" fill="none"/>
    <path d="M119 43 L123 26 L133 33 L141 20 L150 33 L161 26 L162 43Z" fill="${yellow}"/>
    <path d="M126 44 L156 44" fill="none"/><circle cx="141" cy="35" r="2" fill="${rose}"/>
    <path d="M123 64 Q127 60 131 65 M151 65 Q156 60 160 64 M135 73 L141 77 L147 73 M141 77 Q135 86 129 79 M141 77 Q148 86 155 79" fill="none"/>
    <path d="M114 52 L117 59 M140 46 L140 55 M166 52 L163 59" fill="none"/>
    <path d="M121 103 Q142 117 163 102" fill="none"/><circle cx="142" cy="119" r="8" fill="${yellow}"/>
    <path d="M142 113 L142 124 M138 117 L146 117 M138 121 L146 121" fill="none"/>
    <path d="M24 146 L24 156 Q44 164 65 156 L65 146Z" fill="${yellow}"/><path d="M24 146 Q44 139 65 146 Q44 154 24 146Z" fill="${yellow}"/>
    <path d="M28 136 L28 146 Q47 153 68 145 L68 135Z" fill="${yellow}"/><path d="M28 136 Q47 128 68 135 Q49 143 28 136Z" fill="${yellow}"/>
    <path d="M26 125 L26 136 Q47 142 67 135 L67 124Z" fill="${yellow}"/><path d="M26 125 Q46 117 67 124 Q47 132 26 125Z" fill="${yellow}"/>
    <path d="M64 150 L64 159 Q81 166 97 158 L97 149Z" fill="${yellow}"/><path d="M64 150 Q80 143 97 149 Q80 157 64 150Z" fill="${yellow}"/>
    <circle cx="79" cy="139" r="12" fill="${yellow}"/><path d="M79 132 L79 146 M74 136 L84 136 M75 141 L83 141" fill="none"/>
    <path d="M212 124 Q206 99 239 97 Q271 96 276 122Z" fill="${sage}"/>
    <path d="M214 124 L275 123 L273 158 L214 159Z" fill="${rose}"/>
    <path d="M225 102 L226 124 L225 158 M260 101 L261 124 L261 158" fill="none"/>
    <path d="M235 120 L249 120 L249 140 L235 140Z" fill="${yellow}"/><circle cx="242" cy="129" r="2" fill="${ink}"/>
    <path d="M216 122 Q224 114 234 121 M249 120 Q260 110 270 121" fill="${yellow}"/>
    <path d="M213 77 L217 67 L221 76 L231 80 L221 83 L218 94 L214 84 L204 81Z" fill="${yellow}"/>
    <path d="M77 47 L80 40 M75 41 L83 46 M274 66 L277 57 M271 60 L280 64" fill="none"/>`
  await write('cat-wealth',svg(wealth,300,185),900)
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({icons:Object.keys(icons),illustration:'cat-journal',illustrations:['cat-journal','cat-wealth'],style:'original ink and pastel journal doodles'},null,2)+'\n')
  console.log('Generated '+Object.keys(icons).length+' hand-drawn icons and two cat illustrations')
})().catch(e=>{console.error(e);process.exitCode=1})
