import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 100 },
    { duration: '10s', target: 1000 },
    { duration: '20s', target: 0 },
  ],
};

//Below randomize the endpoints
export default function () {
  http.get(`http://localhost:8000/metadata?product_id=${Math.floor(Math.random() * (1000000 - 1 + 1)) + 1}`);
}
