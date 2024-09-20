function handleInsert(req, res, exportMysql) {
  const { table, data } = req.body;
  const db = exportMysql.getDbServiceInstance();
  const result = db.defaultInsert(table, data);
  result.then((data) => res.json({ data })).catch((err) => console.log(err));
}

function handleUpdate(req, res, exportMysql) {
  const { table, data, change } = req.body;
  const db = exportMysql.getDbServiceInstance();
  const result = db.defaultUpdate(table, data, change);
  result.then((data) => res.json({ data })).catch((err) => console.log(err));
}

function handleDelete(req, res, exportMysql) {
  const { table, data } = req.body;
  const db = exportMysql.getDbServiceInstance();
  const result = db.defaultDelete(table, data);
  result.then((data) => res.json({ data })).catch((err) => console.log(err));
}

function handleFetch(req, res, exportMysql) {
  const { table, data } = req.body;
  const db = exportMysql.getDbServiceInstance();
  const result = db.defaultFetch(table, data);
  result.then((data) => res.json({ data })).catch((err) => console.log(err));
}

module.exports = {
  handleInsert,
  handleUpdate,
  handleDelete,
  handleFetch,
};
