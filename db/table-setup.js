/*
 * This script creates the Ratings and Reviews tables.
 */

const { Pool } = require('pg');

const pool = new Pool({
  'user': 'postgres',
  'password': 's3cr3ts'
});

pool.on('error', (error, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

(async () => {
  // REVIEWS TABLE
  await pool.query(
    `CREATE  TABLE "reviews".reviews (
      id                   integer  NOT NULL  ,
      product_id           integer  NOT NULL  ,
      created_at           timestamp(12) DEFAULT CURRENT_TIMESTAMP NOT NULL  ,
      rating               smallint  NOT NULL  ,
      summary              varchar  NOT NULL  ,
      body                 varchar  NOT NULL  ,
      name                 varchar  NOT NULL  ,
      email                varchar  NOT NULL  ,
      helpful              integer DEFAULT 0 NOT NULL  ,
      recommended          boolean DEFAULT false NOT NULL  ,
      reported             boolean DEFAULT false NOT NULL  ,
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

  // PHOTOS TABLE
  await pool.query(
    `CREATE  TABLE "reviews".meta (
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
      num_reviews          integer DEFAULT 0 NOT NULL  ,
      num_recommended      integer DEFAULT 0 NOT NULL  ,
      CONSTRAINT pk_products PRIMARY KEY ( id )
     );`
  )

  // CHARACTERISTICS TABLE
  await pool.query(
    `CREATE  TABLE "reviews".photos (
      id                   integer  NOT NULL  ,
      review_id            integer  NOT NULL  ,
      product_id           integer  NOT NULL  ,
      url                  varchar  NOT NULL  ,
      CONSTRAINT pk_review_photos PRIMARY KEY ( id ),
      CONSTRAINT unq_review_photos_product_id UNIQUE ( product_id )
     );`
  )

  await pool.query(
    `ALTER TABLE "reviews".photos ADD CONSTRAINT fk_review_photos_reviews FOREIGN KEY ( review_id ) REFERENCES "reviews".reviews( id );`
  )

})().catch(err => console.log(err));
