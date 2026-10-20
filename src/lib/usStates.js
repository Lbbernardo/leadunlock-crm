// Estados de EE.UU. — compartido entre frontend y API (api/_lib importa este archivo)

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
  ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
  ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
  ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['PR', 'Puerto Rico'],
].map(([code, name]) => ({ code, name }))

// Nombres en español que la gente escribe
const ALIASES = {
  'nueva york': 'NY', 'nuevo mexico': 'NM', 'nuevo méxico': 'NM', 'nueva jersey': 'NJ',
  'carolina del norte': 'NC', 'carolina del sur': 'SC', 'pensilvania': 'PA',
  'luisiana': 'LA', 'misisipi': 'MS', 'hawái': 'HI', 'virginia occidental': 'WV',
}

// "FL", "Florida", "florida " → "FL"; desconocido → null
export function toStateCode(value) {
  if (!value) return null
  const v = String(value).trim()
  const upper = v.toUpperCase()
  if (US_STATES.some(s => s.code === upper)) return upper
  const lower = v.toLowerCase()
  if (ALIASES[lower]) return ALIASES[lower]
  return US_STATES.find(s => s.name.toLowerCase() === lower)?.code || null
}

// "Florida, Texas y CA" → ["FL", "TX", "CA"]
export function parseStates(text) {
  if (!text) return []
  const codes = String(text).split(/[,;/]| y | and /i).map(toStateCode).filter(Boolean)
  return [...new Set(codes)]
}

// Rangos de los 3 primeros dígitos del ZIP → estado
const ZIP3_RANGES = [
  [5, 5, 'NY'], [6, 7, 'PR'], [9, 9, 'PR'], [10, 27, 'MA'], [28, 29, 'RI'], [30, 38, 'NH'],
  [39, 49, 'ME'], [50, 54, 'VT'], [55, 55, 'MA'], [56, 59, 'VT'], [60, 69, 'CT'], [70, 89, 'NJ'],
  [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'], [200, 200, 'DC'], [201, 201, 'VA'],
  [202, 205, 'DC'], [206, 219, 'MD'], [220, 246, 'VA'], [247, 268, 'WV'], [270, 289, 'NC'],
  [290, 299, 'SC'], [300, 319, 'GA'], [320, 339, 'FL'], [341, 349, 'FL'], [350, 369, 'AL'],
  [370, 385, 'TN'], [386, 397, 'MS'], [398, 399, 'GA'], [400, 427, 'KY'], [430, 459, 'OH'],
  [460, 479, 'IN'], [480, 499, 'MI'], [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'],
  [570, 577, 'SD'], [580, 588, 'ND'], [590, 599, 'MT'], [600, 629, 'IL'], [630, 658, 'MO'],
  [660, 679, 'KS'], [680, 693, 'NE'], [700, 714, 'LA'], [716, 729, 'AR'], [730, 732, 'OK'],
  [733, 733, 'TX'], [734, 749, 'OK'], [750, 799, 'TX'], [800, 816, 'CO'], [820, 831, 'WY'],
  [832, 838, 'ID'], [840, 847, 'UT'], [850, 865, 'AZ'], [870, 884, 'NM'], [885, 885, 'TX'],
  [889, 898, 'NV'], [900, 961, 'CA'], [967, 968, 'HI'], [970, 979, 'OR'], [980, 994, 'WA'],
  [995, 999, 'AK'],
]

// "33101" / "33101-1234" → "FL"; inválido → null
export function zipToState(zip) {
  let digits = String(zip || '').replace(/\D/g, '')
  if (digits.length === 4) digits = '0' + digits // Excel le quita el 0 inicial
  if (digits.length < 5) return null
  const zip3 = parseInt(digits.slice(0, 3), 10)
  return ZIP3_RANGES.find(([from, to]) => zip3 >= from && zip3 <= to)?.[2] || null
}
