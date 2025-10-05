// app.js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".map-btn");
  const updatedText = document.querySelector(".updated");

  buttons.forEach((button, index) => {
    button.addEventListener("click", async () => {
      const region = `Zone ${index + 1}`;
      const nowUTC = new Date().toISOString().split('.')[0] + 'Z';


      console.log(`Seleccionaste: ${region}`);
      console.log("Hora UTC enviada:", nowUTC);

      try {
        // Cambia la URL al endpoint Flask
        const response = await fetch("http://127.0.0.1:5000/api/region-time", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            region: region,
            utcTime: nowUTC,
          }),
        });

        if (!response.ok) throw new Error("Error en la solicitud al backend");

        const data = await response.json();

        updatedText.textContent = `Last updated (server UTC): ${data.server_utc}`;
        console.log("Respuesta del servidor:", data);
      } catch (error) {
        console.error("Error al enviar los datos:", error);
      }

      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
});
