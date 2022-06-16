#[macro_use]
extern crate rocket;

use futures::future::TryFutureExt;
use rocket::serde::json::Json;
use rocket_db_pools::Connection;
use rocket_db_pools::{sqlx, Database};

mod db;
mod metadata;
mod review;

use metadata::{avg_or_none, Characteristic, Characteristics, Metadata};
use review::{Review, Reviews};

/// DATABASE
#[derive(Database)]
#[database("reviews")]
pub struct Pool(pub sqlx::PgPool);

/// ROUTES
#[get("/reviews?<product_id>&<page>&<count>&<sort>")]
pub async fn get_reviews(
    mut db: Connection<Pool>,
    product_id: i32,
    page: Option<i32>,
    count: Option<i32>,
    sort: Option<&str>,
) -> db::Result<Json<Reviews>> {
    let page: i32 = if page.is_none() { 1 } else { page.unwrap() };
    let count: i64 = if count.is_none() {
        5
    } else {
        count.unwrap() as i64
    };
    let sort: &str = if sort.is_none() {
        "helpfulness"
    } else {
        sort.unwrap()
    };
    let offset: i64 = (page as i64 - 1) * count;

    let reviews = sqlx::query!(
        "SELECT
         rr.id,
         rr.rating,
         rr.summary,
         rr.recommended,
         rr.response,
         rr.body,
         rr.created_at,
         rr.name,
         rr.helpful,
         COALESCE (
             json_agg(json_build_object('id', rp.id::text, 'url', rp.url))
         ) AS photos
         FROM reviews.reviews rr
         LEFT JOIN LATERAL (SELECT id, url
                            FROM reviews.photos rp
                            WHERE rr.id = rp.review_id
                           ) rp ON true
         WHERE rr.product_id = $1 AND rr.reported = false
         GROUP BY rr.id
         ORDER BY $2 DESC
         LIMIT $3
         OFFSET $4",
        product_id,
        sort,
        count,
        offset
    )
    .fetch_all(&mut *db)
    .map_ok(|row| {
        let reviews = row
            .into_iter()
            .map(|r| Review {
                review_id: r.id,
                rating: r.rating,
                summary: r.summary,
                recommend: r.recommended,
                response: r.response,
                body: r.body,
                date: r.created_at.to_string(),
                reviewer_name: r.name,
                helpfulness: r.helpful,
                photos: r.photos.into_iter().map(|p| p).collect(),
            })
            .collect();

        Reviews {
            product: product_id,
            page: page,
            count: count,
            results: reviews,
        }
    })
    .await?;

    Ok(Json(reviews))
}

#[get("/metadata?<product_id>")]
pub async fn get_metadata(mut db: Connection<Pool>, product_id: i32) -> db::Result<Json<Metadata>> {
    let product = sqlx::query!("SELECT * FROM reviews.products WHERE id = $1", product_id)
        .fetch_one(&mut *db)
        .await?;

    let data: Metadata = Metadata {
        id: product.id,
        num_1_stars: product.num_1_stars,
        num_2_stars: product.num_2_stars,
        num_3_stars: product.num_3_stars,
        num_4_stars: product.num_4_stars,
        num_5_stars: product.num_5_stars,
        recommended: product.num_recommended,
        characteristics: Characteristics {
            Fit: Characteristic {
                id: product.fit_id,
                value: avg_or_none(product.fit_total, product.num_reviews),
            },
            Size: Characteristic {
                id: product.size_id,
                value: avg_or_none(product.size_total, product.num_reviews),
            },
            Width: Characteristic {
                id: product.width_id,
                value: avg_or_none(product.width_total, product.num_reviews),
            },
            Comfort: Characteristic {
                id: product.comfort_id,
                value: avg_or_none(product.comfort_total, product.num_reviews),
            },
            Quality: Characteristic {
                id: product.quality_id,
                value: avg_or_none(product.quality_total, product.num_reviews),
            },
            Length: Characteristic {
                id: product.length_id,
                value: avg_or_none(product.length_total, product.num_reviews),
            },
        },
    };

    Ok(Json(data))
}

#[launch]
async fn rocket() -> _ {
    rocket::build()
        .attach(Pool::init())
        .mount("/", routes![get_metadata])
        .mount("/", routes![get_reviews])
}
