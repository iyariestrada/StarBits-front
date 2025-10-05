document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".map-btn");
  const updatedText = document.querySelector(".updated");

  // Contenedor que envuelve botón y carrusel
  const carouselWrapper = document.createElement("div");
  carouselWrapper.classList.add("carousel-wrapper");
  document.querySelector(".container").appendChild(carouselWrapper);

  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("carousel-container");
  carouselWrapper.appendChild(carouselContainer);

  let selectedRegion = null;
  let autoSlideInterval = null;

  // Botón centrado arriba del carrusel
  /*const showCarouselBtn = document.createElement("button");
  showCarouselBtn.textContent = "Show Region Images";
  showCarouselBtn.classList.add("show-carousel-btn");
  carouselWrapper.insertBefore(showCarouselBtn, carouselContainer);

  showCarouselBtn.addEventListener("click", () => {
    if (!selectedRegion) {
      Swal.fire({
        title: "Selecciona una región",
        text: "Debes elegir una región antes de mostrar los gráficos.",
        icon: "info",
        confirmButtonColor: "#3085d6",
      });
    } else {
      loadCarouselImages(true);
    }
  });*/

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
          body: JSON.stringify({ region, utcTime: nowUTC }),
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
        console.warn("Servidor no disponible, usando modo de prueba.");
        updatedText.textContent = `Last updated: ${nowUTC}`;
        loadCarouselImages(true);
      } finally {
        document.body.style.cursor = "default";
      }
    });
  });

  // Cargar imágenes (modo normal o de prueba)
  async function loadCarouselImages(testMode = true) {
    try {
      let images = [];

      if (testMode) {
        images = [
          "/assets/zone30.jpeg",
          "/assets/zone31.jpeg",
          "/assets/zone32.jpeg",
          "/assets/zone33.jpeg",
          "/assets/zone34.jpeg",
          "/assets/zone35.jpeg",
        ];
      } else {
        const res = await fetch("http://127.0.0.1:5000/api/images");
        if (!res.ok) throw new Error("No se pudieron cargar las imágenes");
        images = (await res.json()).map((src) => "http://127.0.0.1:5000" + src);
      }

      if (images.length === 0) {
        carouselContainer.innerHTML = "<p>No hay imágenes disponibles.</p>";
        return;
      }

      renderCarousel(images);
      Toastify({
        text: "Imágenes cargadas correctamente",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#007BFF",
      }).showToast();
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al cargar las imágenes.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }

  function renderCarousel(images) {
    carouselContainer.innerHTML = "";

    const carousel = document.createElement("div");
    carousel.classList.add("carousel");

    images.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.classList.add("carousel-img");
      if (i === 0) img.classList.add("active");
      carousel.appendChild(img);
    });

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "‹";
    prevBtn.classList.add("carousel-btn", "prev");

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "›";
    nextBtn.classList.add("carousel-btn", "next");

    carouselContainer.appendChild(prevBtn);
    carouselContainer.appendChild(carousel);
    carouselContainer.appendChild(nextBtn);

    const imgs = carousel.querySelectorAll(".carousel-img");
    let current = 0;

    function showImage(index) {
      imgs.forEach((img, i) => img.classList.toggle("active", i === index));
    }

    prevBtn.addEventListener("click", () => {
      current = (current - 1 + imgs.length) % imgs.length;
      showImage(current);
      resetAutoSlide();
    });

    nextBtn.addEventListener("click", () => {
      current = (current + 1) % imgs.length;
      showImage(current);
      resetAutoSlide();
    });

    function startAutoSlide() {
      autoSlideInterval = setInterval(() => {
        current = (current + 1) % imgs.length;
        showImage(current);
      }, 3000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    startAutoSlide();
  }
});

function mostrarMensajeGood() {
  Swal.fire({
    title: "Sin riesgo",
    html: "La calidad del aire es satisfactoria y existe poco o ningún riesgo para la salud. Se puede realizar cualquier actividad al aire libre",
    confirmButtonText: "Cerrar",
  });
}

function mostrarMensajeModerate() {
  Swal.fire({
    title: "Aceptable",
    html: "La calidad del aire es aceptable, sin embargo, en el caso de algunos contaminantes, las personas que son inusualmente sensibles, pueden presentar sintomas moderados. Las personas que son extremadamente sensibles a la contaminación deben considerar limitar los esfuerzos prolongados al aire libre.",
    confirmButtonText: "Cerrar",
  });
}

function mostrarUSG() {
  Swal.fire({
    title: "Dañina a la salud de grupos sensibles",
    html: "Quienes pertenecen a los grupos sensibles pueden experimentar efectos en la salud. El público en general usualmente no es afectado. Los niños, adultos mayores, personas que realizan actividad física intensa o con enfermedades respiratorias y cardiovasculares, deben limitar los esfuerzos prolongados al aire libre.",
    confirmButtonText: "Cerrar",
  });
}

function mostrarMensajeUnhealthy() {
  Swal.fire({
    title: "Dañina a la salud",
    html: "Todos pueden experimentar efectos en la salud, quienes pertenecen a los grupos sensibles pueden experimentar efectos graves en la salud. Los niños, adultos mayores, personas que realizan actividad fisica intensa o con enfermedades respiratorias y cardiovasculares, deben evitar el esfuerzo prolongado al aire libre.",
    confirmButtonText: "Cerrar",
  });
}

function mostrarVeryUnhealthy() {
  Swal.fire({
    title: "Peligroso para la salud",
    html: "Representa una condición de emergencia. La población en general debe suspender los esfuerzos al aire libre.",
    confirmButtonText: "Cerrar",
  });
}
