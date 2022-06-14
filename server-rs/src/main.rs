#[macro_use] extern crate rocket;

use rocket::fairing::{self, AdHoc};
use rocket::serde::{Serialize, Deserialize, json::Json};
use rocket_db_pools::{Database, Connection};
use rocket_db_pools::sqlx::{self, Row};

mod controllers;

type Result<T, E = rocket::response::Debug<sqlx::Error>> = std::result::Result<T, E>;

#[derive(Database)]
#[database("reviews")]
struct Reviews(sqlx::PgPool);

#[derive(Serialize)]
#[serde(create = "rocket::serde")]
struct Metadata {
    id: i64,
    num_1_stars: Option<i64>,
    num_2_stars: Option<i64>,
    num_3_stars: Option<i64>,
    num_4_stars: Option<i64>,
    num_5_stars: Option<i64>,
    recommended: Option<i64>,
    // fix me
    characteristics: {
        Fit: {
            id: Option<i64>,
            value: Option<i64>,
        },
        Size: {
            id: Option<i64>,
            value: Option<i64>,
        },
        Width: {
            id: Option<i64>,
            value: Option<i64>,
        },
        Comfort: {
            id: Option<i64>,
            value: Option<i64>,
        },
        Quality: {
            id: Option<i64>,
            value: Option<i64>,
        },
        Length: {
            id: Option<i64>,
            value: Option<i64>,
        },
    }
}




#[get("/metadata")]
async fn metadata(mut db: Connection<Reviews>) {
    sqlx::query(
    "
        SELECT (
            json_build_object(
                'product_id', id,
                'ratings', json_build_object(
                    '1', num_1_stars,
                    '2', num_2_stars,
                    '3', num_3_stars,
                    '4', num_4_stars,
                    '5', num_5_stars
                ),
                'recommended', num_recommended,
                'characteristics', json_build_object(
                    'Fit', json_build_object(
                        'id', fit_id,
                        'value', fit_total::float / num_reviews
                    ),
                    'Size', json_build_object(
                        'id', size_id,
                        'value', size_total::float / num_reviews
                    ),
                    'Width', json_build_object(
                        'id', width_id,
                        'value', width_total::float / num_reviews
                    ),
                    'Comfort', json_build_object(
                        'id', comfort_id,
                        'value', comfort_total::float / num_reviews
                    ),
                    'Quality', json_build_object(
                        'id', quality_id,
                        'value', quality_total::float / num_reviews
                    ),
                    'Length', json_build_object(
                        'id', length_id,
                        'value', length_total::float / num_reviews
                    )
                )
            )
        )
        FROM reviews.products WHERE reviews.products.id = $1;
    ")
        .bind::<i32>(23)
        .fetch_all(&mut *db)
        .await
        .map(|r| r)

}

#[launch]
async fn rocket() -> _ {
    rocket::build()
        .attach(Reviews::init())
        .mount("/", routes![metadata])
}
