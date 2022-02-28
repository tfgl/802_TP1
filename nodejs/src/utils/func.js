const log = fn => async(req, res) => {
  console.table( (await fn(req, res)).flat() )
}

const extract = template => record => {
  return template.reduce((obj, key) => ({...obj, [key]: record.fields[key]}), {});
}

export {
  log,
  extract
}
