use rocket::serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct NewReview {
    pub product_id: i32,
    pub rating: i16,
    pub summary: String,
    pub body: String,
    pub recommended: bool,
    pub name: String,
    pub email: String,
    pub photos: Option<serde_json::Value>,
    pub characteristics: Option<serde_json::Value>,
}
