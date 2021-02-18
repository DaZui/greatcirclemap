async function get (x) {
  const v = await window.fetch(`https://cdn.jsdelivr.net/gh/liandlillc/airports_zh@master/${x}.json`)
  return await v.json()
}
async function getRegions () { return await get('regions') }
async function getAirports () { return await get('airports') }
async function getAirlines () { return await get('airlines') }
export { getRegions, getAirports, getAirlines }
