function scapedString(str) {
  return str.replaceAll(/"/g, '\\"').replaceAll(/'/g, "\\'");
}

module.exports = {
  query: {
    insert: async function (Model, data = []) {
      let { tableName } = Model;
      const values = data
        .map((item) => {
          return `(${Object.values(item).map((it) => {
            if (typeof it === 'string') {
              it = it.trim(); // Elimina los espacios en blanco al principio y al final de la cadena.
              if (it === '') {
                return 'NULL'; // Si la cadena está vacía, devuelve NULL.
              }
              it = '"' + scapedString(it) + '"';
            }
            if (typeof it === 'object' && it !== null) {
              it = "'" + JSON.stringify(it) + "'";
            }
            if (typeof it === 'object' && it === null) {
              return 'NULL'; // Si el valor es nulo, devuelve NULL.
            }
            return it;
          })})`;
        })
        .join(', ');

      if (data.length === 0) throw new Error('data is empty');
      data = data[0];
      const keys = Object.keys(data).join(',');
      let query = `INSERT INTO ${tableName}(${keys}) VALUES ${values}`;

      return await Model.raw(query);
    },
  },
};
