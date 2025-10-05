import fetch from "node-fetch";

const samples = [
  "http://www.google.com",
  "http://paypal.com",
  "http://www.dghjdgf.com/paypal.co.uk/cycgi-bin/webscrcmd=_home-customer&nav=1/loading.php",
  "http://93.184.216.34/login",
  "http://example.tk/login"
];

async function runTests() {
  for (const url of samples) {
    try {
      const res = await fetch("http://localhost:4000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      console.log("\n=== Test URL:", url, "===");
      console.log("Final Verdict:", data.finalVerdict);
      console.log("API Verdict:", data.apiVerdict);
      console.log("Score:", data.score);
      console.log("Reasons:", data.rules);
    } catch (e) {
      console.error("Error testing URL", url, e);
    }
  }
}

runTests();
