const config = require('config')
const fs = require('fs')
const es = require('event-stream')

let stat = {}
let count = 0

const show = () => {
  console.log(`count: ${count}`)
  let keys = Object.keys(stat)
  console.log(`** count order **`)
  keys.sort((a, b) => stat[b] - stat[a])
  let c = 0
  for (const key of keys) {
    console.log(`${++c}\t${key}\t${stat[key]}`)
  }
  console.log(`** alphabetical order**`)
  keys.sort()
  c = 0
  for (const key of keys) {
    console.log(`${++c}\t${key}\t${stat[key]}`)
  }
  console.log('')
}

const work = async (src) => {
  return new Promise(resolve => {
    const s = fs.createReadStream(src)
    .on('error', err => {
      console.error(err)
      s.resume()
    })
    .on('end', () => {
      show()
      resolve()
    })
    .pipe(es.split())
    .pipe(es.mapSync(l => {
      s.pause()
      if (l.length === 0) return
      const f = JSON.parse(l)
      key = `${f.properties.ftCode}-${f.properties.orgGILvl}`
      if (stat[key]) {
        stat[key] += 1
      } else {
        stat[key] = 1
      }
      if (++count % 100000 === 0) show()
      s.resume()
    }))
  })
}

const main = async () => {
  for (const src of config.get('srcs')) {
    await work(src)
  }
  show()
}

main()
