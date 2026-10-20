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
