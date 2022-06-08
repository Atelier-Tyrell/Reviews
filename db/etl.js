const csvParse= require('csv-parse').parse;
const fs = require('fs');

const REVIEWS = './csv/reviews.csv';
const REVIEWS_PHOTOS = './csv/reviews_photos.csv';

// FIELDS:
// 0 id: int
// 1 product_id: int
// 2 rating: int
// 3 date: int
// 4 summary: string
// 6 body: string
// 7 recommend: bool
// 8 reported: bool
// 9 reviewer_name: string
// 10 reviewer_email: string
// 11 response: string or null
// 12 helpfulness: int
const parseReviews = async () => {
  const parser = fs.createReadStream(REVIEWS).pipe(csvParse());
  for await (const row of parser) {
    console.log(row);
  }
}

parseReviews();

