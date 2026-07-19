import http from "http";

const urls = [
  "http://localhost:3000/shop",
  "http://localhost:3000/customizer",
  "http://localhost:3000/product/cap",
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on("error", (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function verifyAll() {
  console.log("Verifying route HTTP responses...");
  let allOk = true;
  for (const url of urls) {
    const res = await checkUrl(url);
    if (res.status === 200) {
      console.log(`✅ ${res.url} -> HTTP 200 OK`);
    } else if (res.status) {
      console.log(`❌ ${res.url} -> HTTP ${res.status}`);
      allOk = false;
    } else {
      console.log(`⚠️ ${res.url} -> Error: ${res.error}`);
      allOk = false;
    }
  }
  return allOk;
}

verifyAll().then((ok) => {
  if (ok) {
    console.log("All routes verified successfully with HTTP 200!");
  }
});
