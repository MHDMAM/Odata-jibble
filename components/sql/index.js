const sql = require('mssql');
const _ = require('lodash');
const logger = require("../logger/index");

function requestInput(target, ioSource) {
  if (!ioSource) return;
  _.each(ioSource, function(val, key) {
    let datatype = null;
    let value = null;
    if (_.isObject(val)) {
      datatype = sql[val.datatype](val.typeLength || (val.value && val.value.length) || null);
      value = val.value
      target.input(key, datatype, value);
    } else {
      target.input(key, val);
    }
  });
}

function requestOutput(target, ioSource) {
  if (!ioSource) return;
  _.each(ioSource, function(val, key) {
    let datatype = null;
    let value = null;
    if (_.isObject(val)) {
      datatype = sql[val.datatype](val.typeLength || (val.value && val.value.length) || null);
      value = val.value
      target.output(key, datatype, value);
    } else {
      target.output(key, val);
    }
  });
}

function _executeQuery(query, inputs) {
  return new Promise(async (resolve, reject) => {
    let request = this.pool.request();
    request.on('error', this.onSqlErrorHandler);
    if (!request) return reject();
    requestInput(request, inputs);

    let executeQueryBenchmark = process.hrtime();
    let result = await request.query(query)
      .catch(error => {
        const diff = process.hrtime(executeQueryBenchmark);
        reject(_.assign({
          executeBenchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
        }, error));
      });
    const diff = process.hrtime(executeQueryBenchmark);
    if (!result) return;

    return resolve(_.assign({
      executeBenchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
    }, result));
    return resolve(result);
  });
}

function _executeSP(spName, inputs, outputs) {
  return new Promise(async (resolve, reject) => {
    let request = await this.pool.request();
    request.on('error', this.onSqlErrorHandler);
    if (!request) return reject();

    requestInput(request, inputs);
    requestOutput(request, outputs);

    let executeQueryBenchmark = process.hrtime();
    let result = await request.execute(spName)
      .catch(error => {
        const diff = process.hrtime(executeQueryBenchmark);
        reject(_.assign({
          executeBenchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
        }, error));
      });
    const diff = process.hrtime(executeQueryBenchmark);
    if (!result) return;
    return resolve(_.assign({
      executeBenchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
    }, result));
  });
}

class Sql {
  Types = ['Char', 'NChar', 'VarChar', 'NVarChar', 'Text', 'NText', 'Int', 'BigInt', 'TinyInt', 'SmallInt', 'Bit',
    'Float', 'Real', 'Money', 'SmallMoney', 'Numeric', 'Decimal', 'DateTime', 'Time', 'Date', 'DateTime2',
    'DateTimeOffset', 'SmallDateTime', 'UniqueIdentifier', 'Image', 'Binary', 'VarBinary', 'Xml', 'UDT', 'TVP',
    'Variant'
  ];

  constructor() {
    if (!this.pool) {
      sql.on('error', this.onSqlErrorHandler);
      this.dbConfig = Object.assign({}, require('config').get('db'));
      this.connect();
    }
  }

  // this._WaitForSql
  async connect() {
    this._WaitForSql = new Promise(async (resolve, reject) => {
      try {
        this.pool = await sql.connect(this.dbConfig);
        logger.info({
          msg: 'Connection pool created.',
          path: "indexSQL/connect",
          msg: "Connection pool created",
          database: {
            dbServer: this.dbConfig.server,
            dbName: this.dbConfig.database
          }
        });
        await this.loadTableSchema();
        resolve();
      } catch (error) {
        this.onSqlErrorHandler(error);
      }
    });
  }

  async loadTableSchema() {
    let query =
      `
        SELECT
            col.name 'ColumnName',
            types.Name 'DataType',
            col.max_length 'MaxLength',
          tbl.name AS 'TableName'

        FROM
            sys.columns col  WITH (NOLOCK)
        INNER JOIN
            sys.types types  WITH (NOLOCK)
            ON col.user_type_id = types.user_type_id
        LEFT OUTER JOIN
            sys.tables  tbl  WITH (NOLOCK)
            ON tbl.object_id = col.object_id
        WHERE tbl.name IS NOT NULL AND tbl.name <> 'sysdiagrams'
        ORDER BY tbl.name
   `;
    let types = await _executeQuery.call(this, query);

    if (!types) Promise.reject();
    this.schema = _(types.recordset).map((item) => {
      let type = this.Types.find(type => {
        return (type.toLocaleLowerCase() == item.DataType)
      })
      item.DataType = type;
      return item;
    }).groupBy('TableName').value();
    Promise.resolve();
  }

  async executeQuery(query, inputs, tables) {
    return this._WaitForSql.then(() => {
      let preparedData = {};

      tables.forEach(table => {
        let tempPreparedData = this.buildDataObj(inputs, table);
        _.assign(preparedData, tempPreparedData);
      });
      return _executeQuery.call(this, query, preparedData)
        .then(result => {
          let executeBenchmark = result.executeBenchmark;
          return Promise.resolve(_.omit(result, 'executeBenchmark'));
        })
        .catch(error => {
          logger.error({
            path: "indexSQL/executeQuery",
            msg: 'Failed Executing Query',
            error,
            error_message: error && error.message,
            error_stack: error && error.stack,
            dbQuery: {
              executeBenchmark: error && error.executeBenchmark,
              query,
              error,
              inputs
            }
          });
          return Promise.reject(error);
        });
    });
  }

  async executeSP(spName, inputs, outputs) {
    return this._WaitForSql.then(() => {
      return _executeSP.call(this, spName, inputs, outputs)
        .then(result => {
          let executeBenchmark = result.executeBenchmark;
          return Promise.resolve(_.omit(result, 'executeBenchmark'));
        })
        .catch(error => {
          logger.error({
            path: "indexSQL/executeSP",
            msg: 'Failed Executing SP',
            error_message: error && error.message,
            error_stack: error && error.stack,
            executeBenchmark: error && error.executeBenchmark,
            dbQuery: {
              inputs,
              outputs
            }
          });
          return Promise.reject(error);
        });
    });
  }

  // utils:
  buildDataObj(obj, tbl) {
    let table = this.schema[tbl];
    let returnObj = {};
    _.each(obj, (v, k) => {
      let col = _.find(table, (item) => {
        return item.ColumnName == k
      });
      if (!col || _.isObject(v)) {
        returnObj[k] = v;
      } else {
        let length = _.min([(v && v.length) || 0, col.MaxLength]);
        returnObj[k] = {
          value: v,
          datatype: col.DataType,
          typeLength: length < 0 ? v.length : length
        }
      }
    });

    return returnObj;
  }

  onSqlErrorHandler(error) {
    let args = [...arguments].slice(1);
    logger.error({
      path: 'sql/index',
      msg: 'Connection Error',
      error_message: error && error.message,
      error_stack: error && error.stack,
      args
    });

    if (error && error.message == "No connection is specified for that request.") {
      try {
        this.pool.close();
      } catch (error) {}
      setTimeout(this.connect, 5000);
    }
  }
}

const sqlInstance = new Sql();

module.exports = sqlInstance;