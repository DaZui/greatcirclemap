const getQueryVariable = (variable) => {
  const vars = window.location.search.substring(1).split('&')
  for (const i in vars) {
    const [a, b] = vars[i].split('=')
    if (a === variable) { return b }
  }
  return ''
}
export { getQueryVariable }
