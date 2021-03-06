/*
 * This script creates the Ratings and Reviews tables.
 */

const format = require('pg-format');
const { Client } = require('pg');

const pool = require('./db');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const log = (msg) => {
  console.log(
    `[${new Date().toLocaleString().split(' ').slice(1).join(' ')}] ${msg}`
  );
}

;(async () => {
  console.log('This action will overwrite all tables!');
  console.log('Type OK to proceed:');
  const permission = await new Promise(resolve => {
    readline.question('-> ', resolve);
  });

  if (permission !== 'OK') {
    process.exit();
  }

  log('Re-creating the database...');
  const tempClient = new Client({
    database: 'template1',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  })

  try {
    await tempClient.connect();
    await tempClient.query(format('DROP DATABASE IF EXISTS %s;', process.env.DATABASE));
    await tempClient.query(format('CREATE DATABASE %s;', [process.env.DATABASE]));
    await tempClient.end();
  } catch (error) {
    await tempClient.end();
    console.log(error);
    process.exit();
  }

  // Connect to pool and build the tables
  try {
    log('Deleting existing schema...');
    await pool.query(
      `DROP SCHEMA if exists reviews CASCADE;`
    )

    log('Creating new schema...');
    await pool.query(
      `CREATE SCHEMA reviews;`
    )

    log('Creating reviews table...');
    await pool.query(
      `CREATE  TABLE if not exists reviews.reviews (
        id                   serial PRIMARY KEY ,
        product_id           integer  NOT NULL  ,
        rating               smallint  NOT NULL  ,
        created_at           bigint   NOT NULL   ,
        summary              varchar  NOT NULL  ,
        body                 varchar  NOT NULL  ,
        recommended          boolean DEFAULT false NOT NULL  ,
        reported             boolean DEFAULT false NOT NULL  ,
        name                 varchar  NOT NULL  ,
        email                varchar  NOT NULL ,
        response             varchar    ,
        helpful              integer DEFAULT 0 NOT NULL
       );`
    )

    log('Creating meta table...');
    await pool.query(
      `CREATE  TABLE if not exists reviews.products (
        id                   integer    NOT NULL,
        num_1_stars          integer DEFAULT 0   ,
        num_2_stars          integer DEFAULT 0   ,
        num_3_stars          integer DEFAULT 0   ,
        num_4_stars          integer DEFAULT 0   ,
        num_5_stars          integer DEFAULT 0   ,
        fit_id               integer     ,
        size_id              integer     ,
        width_id             integer     ,
        length_id            integer     ,
        comfort_id           integer     ,
        quality_id           integer     ,
        fit_total            integer     ,
        size_total           integer     ,
        width_total          integer     ,
        length_total         integer     ,
        comfort_total        integer     ,
        quality_total        integer     ,
        num_reviews          integer DEFAULT 0    ,
        num_recommended      integer DEFAULT 0    ,
        CONSTRAINT pk_products PRIMARY KEY ( id )
       );`
    )

    log('Creating photos table...');
    await pool.query(
      `CREATE  TABLE if not exists reviews.photos (
        id                   serial PRIMARY KEY,
        review_id            integer  NOT NULL  ,
        url                  varchar  NOT NULL
      );`
    )

    log('Creating characteristics table...');
    await pool.query(
      `CREATE TABLE if not exists reviews.characteristics (
        id                   integer  NOT NULL  ,
        product_id           integer  NOT NULL  ,
        name                 varchar  NOT NULL);`
    )

    log('Creating characteristics reviews table...');
    await pool.query(
      `CREATE TABLE if not exists reviews.characteristicsreviews (
        id                   integer  NOT NULL  ,
        characteristic_id    integer  NOT NULL  ,
        review_id            integer  NOT NULL  ,
        value                integer  NOT NULL  ,
        product_id           integer  ,
        name                 varchar);`
    )

    log('Creating temporary product table...');
    await pool.query(
      `CREATE TABLE if not exists reviews.temp (
          id  integer,
          name varchar,
          slogan varchar,
          description varchar,
          category varchar,
          default_price int
      );`
    )


    log('Copying product ids in to temporary table...');
    await pool.query(
      `COPY reviews.temp (id, name, slogan, description, category, default_price)
       FROM '/home/jordan/hr/reviewsAPI/server-js/db/csv/product.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    await pool.query(
      `INSERT INTO reviews.products (id)
       SELECT id
       FROM reviews.temp;`
    );

    await pool.query(
      `DROP TABLE reviews.temp;`
    )

    log('Copying characteristics csv into characteristics table...');
    await pool.query(
      `COPY reviews.characteristics (id, product_id, name)
       FROM '/home/jordan/hr/reviewsAPI/server-js/db/csv/characteristics.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    log('Copying characteristic reviews csv into cr table...');
    await pool.query(
      `COPY reviews.characteristicsreviews (
         id, characteristic_id, review_id, value
       )
       FROM '/home/jordan/hr/reviewsAPI/server-js/db/csv/characteristic_reviews.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    log('Copying reviews csv into reviews table...');
    await pool.query(
      `COPY reviews.reviews (
         id, product_id, rating, created_at, summary, body,
         recommended, reported, name, email, response, helpful
       )
       FROM '/home/jordan/hr/reviewsAPI/server-js/db/csv/reviews.csv'
       DELIMITER ','
       CSV HEADER;
    `)

    log('Copying photos csv into photos table...');
    await pool.query(`
       COPY reviews.photos (id, review_id, url)
       FROM '/home/jordan/hr/reviewsAPI/server-js/db/csv/reviews_photos.csv'
       DELIMITER ','
       CSV HEADER;
    `)

    log('Updating characteristics reviews table to include name...');
    await pool.query(
      `UPDATE reviews.characteristicsreviews
       SET name = reviews.characteristics.name,
           product_id = reviews.characteristics.product_id
       FROM reviews.characteristics
       WHERE reviews.characteristicsreviews.characteristic_id = reviews.characteristics.id;`
    )

    // Adding indexes is necessary here because otherwise the following update
    // queries will take dramatically longer
    log('Adding indices to products reviews, and cr tables...');
    await pool.query(
      `CREATE INDEX reviews_idx ON reviews.reviews (product_id);`
    )

    await pool.query(
      `CREATE UNIQUE INDEX products_idx ON reviews.products (id);`
    )

    await pool.query(
      `CREATE INDEX characteristics_idx ON reviews.characteristicsreviews(product_id);`
    )


    log('Updating reviews count for products table');
    await pool.query(
      `UPDATE reviews.products
       SET num_reviews =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id)`
    )

    log('Updating star counts...');
    await pool.query(
      `UPDATE reviews.products
       SET num_1_stars =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id
          AND rr.rating = 1)`
    )

    await pool.query(
      `UPDATE reviews.products
       SET num_2_stars =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id
          AND rr.rating = 2)`
    )

    await pool.query(
      `UPDATE reviews.products
       SET num_3_stars =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id
          AND rr.rating = 3)`
    )

    await pool.query(
      `UPDATE reviews.products
       SET num_4_stars =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id
          AND rr.rating = 4)`
    )

    await pool.query(
      `UPDATE reviews.products
       SET num_5_stars =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id
          AND rr.rating = 5)`
    )


    await pool.query(
      `UPDATE reviews.products
       SET num_recommended =
         (SELECT count(*)
          FROM reviews.reviews as rr
          WHERE rr.product_id = reviews.products.id
          AND rr.recommended = true);`
    )

    log('Updating width characteristics metadata...');
    await pool.query(
      `UPDATE reviews.products
       SET width_total =
         (SELECT sum(value)
          FROM reviews.characteristicsreviews as rc
          WHERE rc.product_id = reviews.products.id
          AND rc.name = 'Width');`
    )

    log('Updating size characteristics metadata...');
    await pool.query(
      `UPDATE reviews.products
       SET size_total =
         (SELECT sum(value)
          FROM reviews.characteristicsreviews as rc
          WHERE rc.product_id = reviews.products.id
          AND rc.name = 'Size');`
    )

    log('Updating fit characteristics metadata...');
    await pool.query(
      `UPDATE reviews.products
       SET fit_total =
         (SELECT sum(value)
          FROM reviews.characteristicsreviews as rc
          WHERE rc.product_id = reviews.products.id
          AND rc.name = 'Fit');`
    )

    log('Updating length characteristics metadata...');
    await pool.query(
      `UPDATE reviews.products
       SET length_total =
         (SELECT sum(value)
          FROM reviews.characteristicsreviews as rc
          WHERE rc.product_id = reviews.products.id
          AND rc.name = 'Length');`
    )

    log('Updating comfort characteristics metadata...');
    await pool.query(
      `UPDATE reviews.products
       SET comfort_total =
         (SELECT sum(value)
          FROM reviews.characteristicsreviews as rc
          WHERE rc.product_id = reviews.products.id
          AND rc.name = 'Comfort');`
    )

    log('Updating quality characteristics metadata...');
    await pool.query(
      `UPDATE reviews.products
       SET quality_total =
         (SELECT sum(value)
          FROM reviews.characteristicsreviews as rc
          WHERE rc.product_id = reviews.products.id
          AND rc.name = 'Quality');`
    )

    log('Updating product characteristic ids...');
    await pool.query(
      `UPDATE reviews.products rp
         SET fit_id = rc.id
         FROM reviews.characteristics rc
         WHERE rc.product_id = rp.id
         AND rc.name = 'Fit'
      ;`
    )

    await pool.query(
      `UPDATE reviews.products rp
         SET size_id = rc.id
         FROM reviews.characteristics rc
         WHERE rc.product_id = rp.id
         AND rc.name = 'Size'
      ;`
    )

    await pool.query(
      `UPDATE reviews.products rp
         SET width_id = rc.id
         FROM reviews.characteristics rc
         WHERE rc.product_id = rp.id
         AND rc.name = 'Width'
      ;`
    )


    await pool.query(
      `UPDATE reviews.products rp
         SET length_id = rc.id
         FROM reviews.characteristics rc
         WHERE rc.product_id = rp.id
         AND rc.name = 'Length'
      ;`
    )

    await pool.query(
      `UPDATE reviews.products rp
         SET comfort_id = rc.id
         FROM reviews.characteristics rc
         WHERE rc.product_id = rp.id
         AND rc.name = 'Comfort'
      ;`
    )

    await pool.query(
      `UPDATE reviews.products rp
         SET quality_id = rc.id
         FROM reviews.characteristics rc
         WHERE rc.product_id = rp.id
         AND rc.name = 'Quality'
      ;`
    )

    log('Adding foreign keys and setting timestamps...');
    await pool.query(
      `ALTER TABLE reviews.photos
       ADD CONSTRAINT fk_review_photos_reviews
       FOREIGN KEY ( review_id )
       REFERENCES "reviews".reviews( id );`
    )

    await pool.query(
      `ALTER TABLE reviews.reviews
       ALTER COLUMN created_at TYPE timestamp(3)
       USING to_timestamp(created_at / 1000.0),
       ALTER COLUMN created_at SET DEFAULT LOCALTIMESTAMP(3);`
    )

    log('Creating indices on photos and reviews sorting');
    await pool.query(
      `CREATE INDEX photos_idx ON reviews.photos(review_id);`
    )

    await pool.query(
      `CREATE INDEX reviews_created_idx ON reviews.reviews(created_at ASC);`
    )

    await pool.query(
      `CREATE INDEX reviews_helpfullnes_idx ON reviews.reviews(helpful DESC);`
    )

    log('Updating the serial IDs for reviews and photos...');
    await pool.query(`
      SELECT setval('reviews.reviews_id_seq', (SELECT MAX(id) FROM reviews.reviews)+1);
      SELECT setval('reviews.photos_id_seq', (SELECT MAX(id) FROM reviews.photos)+1);
    `)

    console.log('Done.');
    process.exit();
  } finally {
  }
})().catch(error => {
  console.log(error)
  process.exit();
});
