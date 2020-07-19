export const parser = innerHTML => {
  const innerHTMLJSON = innerHTML
    .replace(/\s{2,}/g, '')
    .replace(/\n/g, '')
    .replace(/^/, '[')
    .replace(new RegExp('<tr[^>]*>', 'g'), '{')
    .replace(new RegExp('</tr>', 'g'), '},')
    .replace(new RegExp('<td><span title="recommended" aria-label="recommended" class="glyphicon glyphicon-ok"></span></td>', 'g'), '"recommended":true,')
    .replace(new RegExp('<td><span title="fixable" aria-label="fixable" class="glyphicon glyphicon-wrench"></span></td>', 'g'), '"fixable":true,')
    .replace(new RegExp('<td markdown="1"><a href="([^"]*)">\\1</a></td>', 'g'), '"name":"$1",')
    .replace(new RegExp('<td markdown="1">([^<]*)</td>', 'g'), (match, p1) => `"desc":"${p1.replace(/"/g, '\'')}"`)
    .replace(new RegExp('<td></td>', 'g'), '')
    .replace(/,$/, ']')

  const obj = JSON.parse(innerHTMLJSON)
  const props = obj.reduce((acc, curr) => {
    acc[curr.name] = { ...curr }
    delete acc[curr.name].name
    return acc
  }, {})

  return props
}
