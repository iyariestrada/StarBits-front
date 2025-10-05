document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".map-btn");
  const updatedText = document.querySelector(".updated");

  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("carousel-container");
  document.querySelector(".container").appendChild(carouselContainer);

  let selectedRegion = null;

  // Evento al seleccionar una región
  buttons.forEach((button, index) => {
    button.addEventListener("click", async () => {
      const region = `Zone ${index + 1}`;
      const nowUTC = new Date().toISOString().split(".")[0] + "Z";
      selectedRegion = region;

      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      document.body.style.cursor = "wait";

      console.log(`Seleccionaste: ${region}`);
      console.log("Hora UTC enviada:", nowUTC);

      try {
        const response = await fetch("http://127.0.0.1:5000/api/region-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ region: region, utcTime: nowUTC }),
        });

        if (!response.ok) throw new Error("Error en la solicitud al backend");

        const data = await response.json();
        updatedText.textContent = `Last updated (server UTC): ${data.server_utc}`;

        Toastify({
          text: `Datos cargados para ${region}`,
          duration: 3000,
          gravity: "bottom",
          position: "right",
          backgroundColor: "#4CAF50",
        }).showToast();

        await loadCarouselImages();
      } catch (error) {
        console.error("Error al enviar los datos:", error);

        Swal.fire({
          title: "Error",
          text: "No se pudo comunicar con el servidor. Intenta nuevamente.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } finally {
        document.body.style.cursor = "default";
      }
    });
  });

  // Cargar las imágenes del backend
  async function loadCarouselImages() {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/images");
      if (!res.ok) throw new Error("No se pudieron cargar las imágenes");

      const images = await res.json();

      if (images.length === 0) {
        carouselContainer.innerHTML = "<p>No hay imágenes disponibles.</p>";
        return;
      }

      carouselContainer.innerHTML = ""; // limpiar carrusel anterior

      const carousel = document.createElement("div");
      carousel.classList.add("carousel");

      images.forEach((src) => {
        const img = document.createElement("img");
        img.src = "http://127.0.0.1:5000" + src;
        img.classList.add("carousel-img");
        carousel.appendChild(img);
      });

      carouselContainer.appendChild(carousel);
      startCarousel(carousel);

      Toastify({
        text: "Imágenes de la región cargadas correctamente",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#007BFF",
      }).showToast();
    } catch (error) {
      console.error("Error al cargar las imágenes:", error);

      Swal.fire({
        title: "Error",
        text: "Hubo un problema al cargar las imágenes de la región.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }

  // Carrusel automático
  function startCarousel(container) {
    const images = container.querySelectorAll(".carousel-img");
    if (images.length === 0) return;

    let current = 0;
    images.forEach((img, i) => (img.style.display = i === 0 ? "block" : "none"));

    setInterval(() => {
      images[current].style.display = "none";
      current = (current + 1) % images.length;
      images[current].style.display = "block";
    }, 3000);
  }

  // Botón para mostrar imágenes manualmente
  const showCarouselBtn = document.createElement("button");
  showCarouselBtn.textContent = "Show Region Images";
  showCarouselBtn.classList.add("show-carousel-btn");
  document.querySelector(".container").appendChild(showCarouselBtn);

  showCarouselBtn.addEventListener("click", () => {
    if (!selectedRegion) {
      Swal.fire({
        title: "Selecciona una región",
        text: "Debes elegir una región antes de mostrar los gráficos.",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
    } else {
      loadCarouselImages();
    }
  });
});
