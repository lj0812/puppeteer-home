const puppeteer = require('puppeteer-core')
const ruleParser = innerHTML => {
  const innerHTMLJSON = innerHTML
    .replace(/^/, '[')
    .replace(/$/, ']')
    .replace(new RegExp('</tr>', 'g'), '},\n')
    .replace(new RegExp('<tr>', 'g'), '{ ')
    .replace(new RegExp('<td><span title="recommended" aria-label="recommended" class="glyphicon glyphicon-ok"></span></td>', 'g'), '"recommended": true, ')
    .replace(new RegExp('<td><span title="fixable" aria-label="fixable" class="glyphicon glyphicon-wrench"></span></td>', 'g'), '"fixable": true, ')
    .replace(new RegExp('<td markdown="1"><a href="([^"]*)">\\1</a></td>', 'g'), '"key": "$1", ')
    .replace(new RegExp('<td markdown="1">(.*)</td>', 'g'), (match, p1) => `"desc": "${p1.replace(/"/g, '\'')}" `)
    .replace(new RegExp('<td></td>', 'g'), '')
    .replace(new RegExp(',\\n]', 'g'), ']')
  
  const obj = JSON.parse(innerHTMLJSON)
  const props = obj.reduce((acc, curr) => {
    acc[curr.key] = { ...curr }
    delete acc[curr.key].key
    return acc
  }, {})

  return props
}

const pageFunc = async () => {
  const els = Array.from(document.querySelectorAll('.rule-list.table tbody'))
  const ids = Array.from(document.querySelectorAll('h2')).map(item => item.id).slice(0, els.length)
  const propArr = await Promise.all(els.map(item => ruleParser(item.innerHTML)))
  // .replace(/\n/gi, "").replace(/\s{2,}/g, "")

  const props = propArr.reduce((acc, curr, index) => ({ 
    ...acc,
    ...Object.entries(curr).reduce((acc, [key, val]) => ({ ...acc, [key]: { ...val, group: ids[index]} }), {})
  }), {})
  console.log(props)
  
  return props
}

const PAGE_ESLINT_RULE = 'https://eslint.org/docs/rules/'
const PAGE_CN_ESLINT_RULE = 'https://cn.eslint.org/docs/rules/'

puppeteer
  .launch({
    executablePath: '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary',
    headless: false,
    devtools: true,
    defaultViewport: {
      width: 1200,
      height: 1050
    }
  })
  .then(async browser => {
    console.log('in')
    const page = await browser.newPage()

    // 向页面window注入函数
    await page.exposeFunction('ruleParser', ruleParser)

    await page.goto(PAGE_ESLINT_RULE)
    const en = await page.evaluate(pageFunc);

    await page.goto(PAGE_CN_ESLINT_RULE)
    const cn = await page.evaluate(pageFunc);

    console.log(en, cn)

    // await browser.close()
  })
  .catch(err => {
    console.log(err)
  })