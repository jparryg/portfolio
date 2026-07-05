(function () {
  "use strict";
  window.__BRAND__ = {
    name: "Casa Miramar",
    location: "Condominio Miramar · Frente al Point · Punta Hermosa",
    whatsapp: "51993514463",
    waGeneral: "https://wa.me/51993514463?text=Hola%20Marcela%21%20Vi%20Casa%20Miramar%20y%20quiero%20reservar%20directo%2C%20sin%20pasar%20por%20Airbnb.%20%C2%BFMe%20ayudas%20con%20la%20disponibilidad%3F",
    host: {
      years: 3,
      reviews: 29,
      rating: 4.93
    },
    units: [
      {
        id: "1a",
        code: "1A",
        badge: true,
        guests: 2,
        bedrooms: 1,
        beds: 2,
        baths: 1.5,
        rating: 4.94,
        reviews: 17,
        price: 60,
        video: "assets/video/1a-hero.mp4",
        poster: "assets/img/1a/video-poster.webp",
        photos: [
          "assets/img/1a/hero.webp",
          "assets/img/1a/1a-02.webp",
          "assets/img/1a/1a-04.webp"
        ],
        // PENDIENTE: sin testimonios reales confirmados todavía para 1A.
        // Agregar aquí en el mismo formato que 1B/2A cuando John tenga el texto.
        testimonials: [],
        // PENDIENTE: sin descripción/equipamiento real confirmado todavía para 1A.
        about: null
      },
      {
        id: "1b",
        code: "1B",
        badge: false,
        guests: 4,
        bedrooms: 2,
        beds: 3,
        baths: 2,
        rating: 4.88,
        reviews: 8,
        price: 85,
        video: "assets/video/1b-hero.mp4",
        poster: "assets/img/1b/video-poster.webp",
        photos: [
          "assets/img/1b/hero.webp",
          "assets/img/1b/1b-02.webp",
          "assets/img/1b/1b-04.webp",
          "assets/img/1b/1b-08.webp"
        ],
        // Testimonios reales parafraseados de reseñas de Airbnb (no copiados textualmente).
        testimonials: [
          { name: "Ingrid", date: "abril 2026", text: "Dijo que fue de las mejores ubicaciones que probó en Punta Hermosa: todo limpio, práctico y con buena onda de la anfitriona." },
          { name: "Dajanna", date: "enero 2026", text: "Destacó la excelente ubicación con vista a la playa — el depa tal cual las fotos." },
          { name: "Inti", date: "marzo 2025", text: "Un espacio lindo y ordenado, con anfitriones amables. Dijo que volvería." }
        ],
        // Descripción y equipamiento reales, tomados del listado de Airbnb (parafraseado).
        about: {
          text: "Lugar tranquilo para disfrutar la playa en familia, frente al Point — ideal para surfear o ver a los surfistas.",
          highlights: ["Cocina full equipada: refrigeradora, licuadora, horno", "Cámaras de seguridad exteriores"]
        }
      },
      {
        id: "2a",
        code: "2A",
        badge: false,
        guests: 5,
        bedrooms: 2,
        beds: 4,
        baths: 2,
        rating: 5.0,
        reviews: 2,
        price: 100,
        video: null,
        poster: null,
        photos: [
          "assets/img/2a/hero.webp",
          "assets/img/2a/2a-02.webp",
          "assets/img/2a/2a-05.webp"
        ],
        // Testimonios reales parafraseados de reseñas de Airbnb (no copiados textualmente).
        testimonials: [
          { name: "Marha", date: "enero 2026, con niños", text: "Resaltó la limpieza, la vista y la atención de “Marce” — dijo que definitivamente volverían." },
          { name: "David", date: "diciembre 2025, Panamá", text: "Vista espectacular y muy recomendable. Planea volver." }
        ],
        // Descripción y equipamiento reales, tomados del listado de Airbnb (parafraseado).
        // Nota: estos destacados son específicos de 2A, no generalizar a 1A/2B sin confirmar.
        about: {
          text: "Departamento espacioso con vista al mar y al Point, a 5 minutos caminando de la playa, full equipado, con wifi y TV por cable.",
          highlights: ["Patio / balcón privado", "Lavavajillas", "Tostador"]
        }
      },
      {
        id: "2b",
        code: "2B",
        badge: false,
        guests: 5,
        bedrooms: 2,
        beds: 4,
        baths: 2,
        rating: 5.0,
        reviews: 1,
        price: 100,
        video: null,
        poster: null,
        photos: [
          "assets/img/2b/2b-07.webp",
          "assets/img/2b/2b-02.webp",
          "assets/img/2b/2b-04.webp",
          "assets/img/2b/hero.webp"
        ],
        // PENDIENTE: sin testimonios reales confirmados todavía para 2B.
        // Agregar aquí en el mismo formato que 1B/2A cuando John tenga el texto.
        testimonials: [],
        // PENDIENTE: sin descripción/equipamiento real confirmado todavía para 2B.
        about: null
      }
    ]
  };
})();
