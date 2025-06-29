module.exports = {
  development: {
    medivue: {
    username: process.env.MEDIVUE_DB_USER || 'postgres',
    password: process.env.MEDIVUE_DB_PASSWORD || 'postgres',
    database: process.env.MEDIVUE_DB_NAME || 'medivue',
    host: process.env.MEDIVUE_DB_HOST || 'localhost',
    port: process.env.MEDIVUE_DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
      }
    },
    flarePredictor: {
      username: process.env.FLARE_DB_USER || 'postgres',
      password: process.env.FLARE_DB_PASSWORD || 'postgres',
      database: process.env.FLARE_DB_NAME || 'ibd_flarepredictor',
      host: process.env.FLARE_DB_HOST || 'localhost',
      port: process.env.FLARE_DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },
  production: {
    medivue: {
    username: process.env.MEDIVUE_DB_USER || 'postgres',
    password: process.env.MEDIVUE_DB_PASSWORD || 'postgres',
    database: process.env.MEDIVUE_DB_NAME || 'medivue',
    host: process.env.MEDIVUE_DB_HOST || 'localhost',
    port: process.env.MEDIVUE_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
      }
    },
    flarePredictor: {
      username: process.env.FLARE_DB_USER || 'postgres',
      password: process.env.FLARE_DB_PASSWORD || 'postgres',
      database: process.env.FLARE_DB_NAME || 'ibd_flarepredictor',
      host: process.env.FLARE_DB_HOST || 'localhost',
      port: process.env.FLARE_DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  }
}; 