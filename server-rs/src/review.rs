use rocket::serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Reviews {
    pub product: i32,
    pub page: i32,
    pub count: i64,
    pub results: Vec<Review>,
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Review {
    pub review_id: i32,
    pub rating: i16,
    pub summary: String,
    pub recommend: bool,
    pub response: Option<String>,
    pub body: String,
    pub date: String,
    pub reviewer_name: String,
    pub helpfulness: i32,
    pub photos: Vec<serde_json::Value>,
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Photo {
    pub id: i32,
    pub url: String,
}
