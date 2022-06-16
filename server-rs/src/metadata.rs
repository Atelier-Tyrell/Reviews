use rocket::serde::{Deserialize, Serialize};

#[path = "./db.rs"]
mod db;

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Metadata {
    pub id: i32,
    pub num_1_stars: Option<i32>,
    pub num_2_stars: Option<i32>,
    pub num_3_stars: Option<i32>,
    pub num_4_stars: Option<i32>,
    pub num_5_stars: Option<i32>,
    pub recommended: Option<i32>,
    pub characteristics: Characteristics,
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Characteristic {
    pub id: Option<i32>,
    pub value: Option<f64>,
}

#[derive(Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Characteristics {
    pub Fit: Characteristic,
    pub Size: Characteristic,
    pub Width: Characteristic,
    pub Comfort: Characteristic,
    pub Quality: Characteristic,
    pub Length: Characteristic,
}

pub fn avg_or_none(total: Option<i32>, n: Option<i32>) -> Option<f64> {
    if total.is_none() || n.is_none() {
        return None;
    }
    Some(total.unwrap() as f64 / n.unwrap() as f64)
}
