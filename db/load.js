/*
 * This script creates the Ratings and Reviews tables.
 */

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
        width                integer    ,
        length               integer    ,
        comfort              integer    ,
        quality              integer    ,
        fit_id               integer    ,
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
        value                integer  NOT NULL);`
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
  } finally {
    client.release();
  }
})().catch(error => {
  console.log(error)
  process.exit();
});
