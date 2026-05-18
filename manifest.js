(function () {
  "use strict";

  window.__BRAND__ = {
    name: "La ReContra",
    tagline: "Fast food. Plant-based. Sin concesiones.",
    whatsapp: "https://wa.me/51934233858",
    instagram: "https://www.instagram.com/la.recontra",
    rappi: "https://www.rappi.com.pe",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Av.+Mariscal+C%C3%A1ceres+270,+Miraflores,+Lima",
    embedMap: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.0!2d-77.0310!3d-12.1210!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAv.+Mariscal+C%C3%A1ceres+270+Miraflores!5e0!3m2!1ses!2spe!4v1716000000000",

    menu: [
      {
        id: "crispy",
        nombre: "La Crispy",
        precio: "S/25",
        descripcion: "Imita pollo frito. Salsa ahumada casera, ensalada de col crispy.",
        tag: "Bestseller",
        foto: "assets/img/crispy.webp"
      },
      {
        id: "clasica",
        nombre: "La Clásica",
        precio: "S/26",
        descripcion: "Burger tipo res, lechuga hidropónica, tomate, pepinillo encurtido.",
        tag: "",
        foto: "assets/img/clasica.webp"
      },
      {
        id: "cheese-bacon",
        nombre: "Cheese Bacon",
        precio: "S/29",
        descripcion: "Queso fundido plant-based, tocino vegano casero. Intensidad máxima.",
        tag: "Recomendada",
        foto: "assets/img/cheese-bacon.webp"
      },
      {
        id: "big-r",
        nombre: "La Big R",
        precio: "S/34",
        descripcion: "Doble burger. La más grande. Para los valientes.",
        tag: "La más grande",
        foto: "assets/img/big-r.webp"
      },
      {
        id: "nuggets",
        nombre: "Nuggets & No-Pollo",
        precio: "S/25+",
        descripcion: "Combos para compartir. Sin pollito, con todo el sabor.",
        tag: "",
        foto: "assets/img/nuggets.webp"
      },
      {
        id: "acompanamientos",
        nombre: "Acompañamientos",
        precio: "S/12+",
        descripcion: "Aros de cebolla, papas con queso y tocino vegano. 4 salsas de la casa.",
        tag: "",
        foto: "assets/img/acompanamientos.webp"
      }
    ],

    stats: [
      { valor: "100%", label: "Plant-Based" },
      { valor: "23K", label: "Seguidores" },
      { valor: "S/25", label: "Desde" }
    ],

    facts: [
      { icono: "💧", titulo: "75% menos agua", texto: "Producir nuestras burgers consume tres cuartas partes menos agua que la carne convencional." },
      { icono: "🏆", titulo: "Top 10 Premios Somos 2023", texto: "Reconocidos entre los mejores restaurantes del año por la revista Somos." },
      { icono: "🌿", titulo: "Seitan casero", texto: "Elaboramos nuestro propio seitan a diario. Sin conservantes, sin atajos." }
    ]
  };
})();
