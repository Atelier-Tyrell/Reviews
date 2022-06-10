/*
 * This script creates the Ratings and Reviews tables.
 */

const format = require('pg-format');
const { Client } = require('pg');

const pool = require('./db').pool;

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

;(async () => {
  console.log('This action will overwrite all tables!');
  console.log('Type OK to proceed:');
  const permission = await new Promise(resolve => {
    readline.question('-> ', resolve);
  });

  if (permission !== 'OK') {
    process.exit();
  }

  console.log('Re-creating the database...');
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
  const client = await pool.connect();
  try {
    console.log('Deleting existing schema...');
    await client.query(
      `DROP SCHEMA if exists reviews CASCADE;`
    )

    console.log('Creating new schema...');
    await client.query(
      `CREATE SCHEMA reviews;`
    )

    console.log('Creating reviews table...');
    await client.query(
      `CREATE  TABLE if not exists reviews.reviews (
        id                   integer  NOT NULL  ,
        product_id           integer  NOT NULL  ,
        rating               smallint  NOT NULL  ,
        created_at           bigint   NOT NULL   ,
        summary              varchar  NOT NULL  ,
        body                 varchar  NOT NULL  ,
        recommended          boolean DEFAULT false NOT NULL  ,
        reported             boolean DEFAULT false NOT NULL  ,
        name                 varchar  NOT NULL  ,
        email                varchar  NOT NULL  ,
        response             varchar    ,
        helpful              integer DEFAULT 0 NOT NULL  ,
        fit                  integer    ,
        size                 integer    ,
        width                integer    ,
        length               integer    ,
        comfort              integer    ,
        quality              integer    ,
        fit_id               integer    ,
        size_id              integer    ,
        width_id             integer    ,
        length_id            integer    ,
        comfort_id           integer    ,
        quality_id           integer    ,
        CONSTRAINT pk_reviews PRIMARY KEY ( id )
       );`
    )

    console.log('Creating meta table...');
    await client.query(
      `CREATE  TABLE if not exists reviews.meta (
        id                   integer  NOT NULL  ,
        num_1_stars          integer DEFAULT 0 NOT NULL  ,
        num_2_stars          integer DEFAULT 0 NOT NULL  ,
        num_3_stars          integer DEFAULT 0 NOT NULL  ,
        num_4_stars          integer DEFAULT 0 NOT NULL  ,
        num_5_stars          integer DEFAULT 0 NOT NULL  ,
        fit_avg              double precision  NOT NULL  ,
        width_avg            double precision  NOT NULL  ,
        length_avg           double precision  NOT NULL  ,
        comfort_avg          double precision  NOT NULL  ,
        quality_avg          double precision  NOT NULL  ,
        fit_count            integer DEFAULT 0  NOT NULL  ,
        width_count          integer DEFAULT 0  NOT NULL  ,
        length_count         integer DEFAULT 0  NOT NULL  ,
        comfort_count        integer DEFAULT 0  NOT NULL  ,
        quality_count        integer DEFAULT 0  NOT NULL  ,
        num_reviews          integer DEFAULT 0 NOT NULL  ,
        num_recommended      integer DEFAULT 0 NOT NULL  ,
        CONSTRAINT pk_products PRIMARY KEY ( id )
       );`
    )

    console.log('Creating photos table...');
    await client.query(
      `CREATE  TABLE if not exists reviews.photos (
        id                   integer  NOT NULL  ,
        review_id            integer  NOT NULL  ,
        url                  varchar  NOT NULL);`
    )

    console.log('Creating characteristics table...');
    await client.query(
      `CREATE TABLE if not exists reviews.characteristics (
        id                   integer  NOT NULL  ,
        product_id           integer  NOT NULL  ,
        name                 varchar  NOT NULL);`
    )

    console.log('Creating characteristics reviews table...');
    await client.query(
      `CREATE TABLE if not exists reviews.characteristicsreviews (
        id                   integer  NOT NULL  ,
        characteristic_id    integer  NOT NULL  ,
        review_id            integer  NOT NULL  ,
        value                integer  NOT NULL  ,
        name                 varchar);`
    )


    console.log('Copying characteristics csv into characteristics table...');
    await client.query(
      `COPY reviews.characteristics (id, product_id, name)
       FROM '/home/jordan/hr/reviewsAPI/db/csv/characteristics.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    console.log('Copying characteristic reviews csv into cr table...');
    await client.query(
      `COPY reviews.characteristicsreviews (
         id, characteristic_id, review_id, value
       )
       FROM '/home/jordan/hr/reviewsAPI/db/csv/characteristic_reviews.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    console.log('Copying reviews csv into reviews table...');
    await client.query(
      `COPY reviews.reviews (
         id, product_id, rating, created_at, summary, body,
         recommended, reported, name, email, response, helpful
       )
       FROM '/home/jordan/hr/reviewsAPI/db/csv/reviews.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    console.log('Copying photos csv into photos table...');
    await client.query(
      `COPY reviews.photos (id, review_id, url)
       FROM '/home/jordan/hr/reviewsAPI/db/csv/reviews_photos.csv'
       DELIMITER ','
       CSV HEADER;`
    )

    console.log('Updating characteristics reviews table to include name...');
    await client.query(
      `UPDATE reviews.characteristicsreviews
       SET name = reviews.characteristics.name
       FROM reviews.characteristics
       WHERE reviews.characteristicsreviews.characteristic_id = reviews.characteristics.id;`
    )

    console.log('Updating reviews table to include fit...');
    await client.query(
      `UPDATE reviews.reviews
       SET
         fit = reviews.characteristicsreviews.value,
         fit_id = reviews.characteristicsreviews.characteristic_id
       FROM reviews.characteristicsreviews
       WHERE reviews.characteristicsreviews.review_id = reviews.reviews.id
       AND reviews.characteristicsreviews.name = 'Fit';`
    )

    console.log('Updating reviews table to include length...');
    await client.query(
      `UPDATE reviews.reviews
       SET
         length = reviews.characteristicsreviews.value,
         length_id = reviews.characteristicsreviews.characteristic_id
       FROM reviews.characteristicsreviews
       WHERE reviews.characteristicsreviews.review_id = reviews.reviews.id
       AND reviews.characteristicsreviews.name = 'Length';`
    )

    console.log('Updating reviews table to include comfort...');
    await client.query(
      `UPDATE reviews.reviews
       SET
         comfort = reviews.characteristicsreviews.value,
         comfort_id = reviews.characteristicsreviews.characteristic_id
       FROM reviews.characteristicsreviews
       WHERE reviews.characteristicsreviews.review_id = reviews.reviews.id
       AND reviews.characteristicsreviews.name = 'Comfort';`
    )

    console.log('Updating reviews table to include quality...');
    await client.query(
      `UPDATE reviews.reviews
       SET
         length = reviews.characteristicsreviews.value,
         length_id = reviews.characteristicsreviews.characteristic_id
       FROM reviews.characteristicsreviews
       WHERE reviews.characteristicsreviews.review_id = reviews.reviews.id
       AND reviews.characteristicsreviews.name = 'Length';`
    )

    console.log('Updating reviews table to include size...');
    await client.query(
      `UPDATE reviews.reviews
       SET
         size = reviews.characteristicsreviews.value,
         size_id = reviews.characteristicsreviews.characteristic_id
       FROM reviews.characteristicsreviews
       WHERE reviews.characteristicsreviews.review_id = reviews.reviews.id
       AND reviews.characteristicsreviews.name = 'Size';`
    )


    console.log('Updating reviews table to include width...');
    await client.query(
      `UPDATE reviews.reviews
       SET
         width = reviews.characteristicsreviews.value,
         width_id = reviews.characteristicsreviews.characteristic_id
       FROM reviews.characteristicsreviews
       WHERE reviews.characteristicsreviews.review_id = reviews.reviews.id
       AND reviews.characteristicsreviews.name = 'Width';`
    )

    console.log('Dropping temporary characteristics tables...');
    await client.query(
      `DROP TABLE reviews.characteristics;`
    )

    await client.query(
      `DROP TABLE reviews.characteristicsreviews;`
    )

    console.log('Adding foreign keys and setting timestamps...');
    await client.query(
      `ALTER TABLE reviews.photos
       ADD CONSTRAINT fk_review_photos_reviews
       FOREIGN KEY ( review_id )
       REFERENCES "reviews".reviews( id );`
    )

    await client.query(
      `ALTER TABLE reviews.reviews
       ALTER COLUMN created_at TYPE timestamp(3)
       USING to_timestamp(created_at / 1000.0),
       ALTER COLUMN created_at SET DEFAULT LOCALTIMESTAMP(3);`
    )

    console.log('Done.');
    process.exit();
    client.release();
  } finally {
    client.release();
  }
})().catch(error => {
  console.log(error)
  process.exit();
});
