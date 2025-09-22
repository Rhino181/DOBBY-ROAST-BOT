async function generateRoast() {
  const input = document.getElementById("userInput").value;
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = "Dobby is cooking a roast... 🔪🔥";

  try {
    const response = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    outputDiv.innerText =
      data.roast || "⚠️ No roast from Dobby.\n" + JSON.stringify(data);
  } catch (err) {
    outputDiv.innerText = "❌ Error: " + err.message;
  }
}
