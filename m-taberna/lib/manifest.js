(function () {
  "use strict";

  window.__BRAND__ = {
    name: "M Taberna Picantería",
    shortName: "M Taberna",
    eyebrow: "Picantería de mar · Punta Sal, Punta Hermosa",
    tagline: "Cocina de mar servida sin apuro.",

    contact: {
      phone: "+51 932 612 237",
      whatsapp: "51932612237",
      address: "Esquina de la Av. Coronel Juan Valer con calle Punta Sal, Punta Hermosa, Lima",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=M+Taberna+Picanteria+Punta+Sal+Punta+Hermosa",
      whatsappMsgDefault: "Hola, quiero reservar mesa en M Taberna para [fecha/hora/personas]."
    },

    rating: { value: 4.7, count: 76, source: "Google" },

    schedule: [
      { days: "Martes, miércoles, jueves y domingo", hours: "12:00 m. – 6:00 p.m." },
      { days: "Viernes y sábado", hours: "12:00 m. – 10:30 p.m." },
      { days: "Lunes", hours: "Cerrado" }
    ],

    // ---- Carta completa por categoría (extraída de CARTA M.pdf, sin precios: la carta real no los lista) ----
    menu: {
      piqueos: {
        label: "Entradas y piqueos",
        items: [
          { name: "Ceviche de bonito", desc: "Camote, palta, ajonjolí tostado, aceite de ajonjolí" },
          { name: "Ceviche de bonito y pulpo", desc: "Pulpo, camote, palta, ajonjolí tostado" },
          { name: "Ceviche mixto de bonito", desc: "Langostinos, pulpo, concha, chicharrón de pota, ajonjolí" },
          { name: "Ceviche de charela", desc: "" },
          { name: "Ceviche de charela y pulpo", desc: "" },
          { name: "Ceviche mixto de charela", desc: "Langostinos, pulpo, concha, chicharrón de pota" },
          { name: "Conchas a la chalaca", desc: "6 unidades" },
          { name: "Tiradito al ají amarillo", desc: "Camote, choclo, chalaca, chicharrón de pota" },
          { name: "Muchame de bonito", desc: "Palta, tomate, orégano, ajo, aceite de oliva" },
          { name: "Tartar de bonito", desc: "Palta, soya, kion, ajonjolí, salsa dulce picante" },
          { name: "Langostinos al ajillo", desc: "Vino blanco, crema de ajíes, ajo crocante, mantequilla", photo: "assets/img/langostinos-al-ajillo.webp" },
          { name: "Pulpo al olivo", desc: "Palta, alcaparras, cherry, aceitunas, pimentón ahumado, ajo crocante", photo: "assets/img/pulpo-al-olivo.webp" },
          { name: "Pulpo a la parrilla", desc: "Majado de yuca, alioli de ajo, pimentón ahumado, aceite de huacatay" },
          { name: "Conchas a la parrilla", desc: "Mantequilla de algarrobina, chancaca y limón", photo: "assets/img/conchas-parrilla-algarrobina.webp" },
          { name: "Conchas parmesana", desc: "6 unidades · vino blanco, queso crema, grana padano" },
          { name: "Tequeños de quesos andinos", desc: "8 unidades, con guacamole" },
          { name: "Papa a la huancaína", desc: "" },
          { name: "Tamalito verde", desc: "Pejerrey al panko, salsa de seco, criolla, huancaína" },
          { name: "Papa rellena de carrilleras de res", desc: "Huevos fritos, criolla, huancaína, ocopa" },
          { name: "Chicharrón de pollo", desc: "" },
          { name: "Chicharrón de pesca", desc: "" },
          { name: "Pejerreyes al panko", desc: "Chalaca, tártara, guacamole" },
          { name: "Pulpo anticuchero", desc: "Papa amarilla crocante, choclo a la parrilla, huancaína, ocopa" },
          { name: "Anticuchos de lengua", desc: "A la parrilla", photo: "assets/img/anticuchos-de-lengua.webp" },
          { name: "Erizo en su mantequilla al vongole y vino blanco", desc: "", photo: "assets/img/erizo-mantequilla-vongole.webp" },
          { name: "Causa de pollo", desc: "Palta, tomate, huevo" },
          { name: "Causa de langostinos", desc: "Salsa cóctel" },
          { name: "Causa de pulpo a la parrilla", desc: "Salsa olivo, alcaparras, ajo crocante" },
          { name: "Causa escabechada", desc: "Bonito sellado o chicharrón de charela" }
        ]
      },
      fondos: {
        label: "Fondos",
        items: [
          { name: "Seco de carrilleras", desc: "Frejoles, criolla, arroz con choclo" },
          { name: "Ají de gallina", desc: "Huevo, aceituna, arroz blanco" },
          { name: "Apanado de lomo con spaghetti al pesto", desc: "" },
          { name: "Lomo saltado", desc: "Papas fritas, arroz blanco", photo: "assets/img/lomo-saltado.webp" },
          { name: "Lomo en salsa de pimientas", desc: "Papas fritas, vegetales al wok" },
          { name: "Pesca al curry de ajíes peruanos", desc: "Vegetales al wok, plátano frito, arroz frito con cecina y chifles" },
          { name: "Seco de pesca y vongole", desc: "Tacu tacu, plátano frito, criolla", photo: "assets/img/seco-de-pesca-y-vongole.webp" },
          { name: "Pesca a la chorrillana", desc: "Papa amarilla, arroz con choclo" },
          { name: "Pesca en mantequilla negra", desc: "Fondo de res, mantequilla, alcaparras, puré de papa amarilla" },
          { name: "Pesca en mantequilla de vino blanco y vongole", desc: "Papas cóctel fritas, espinacas salteadas" },
          { name: "Pesca asiática", desc: "Vegetales al wok, arroz blanco" },
          { name: "Cau cau de mariscos", desc: "Pulpo, langostinos, pota, concha" },
          { name: "Tallarín saltado", desc: "Pollo o lomo" },
          { name: "Arroz con mariscos", desc: "Meloso, conchas, langostinos, pulpo, pota" },
          { name: "Chaufa de mariscos", desc: "Pulpo, langostinos, pota, concha, plátano frito" },
          { name: "Milanesa de pollo", desc: "Papas fritas, arroz con choclo" },
          { name: "Milanesa de pollo napolitana", desc: "Pomodoro, pesto, mozzarella, jamón serrano, arúgula" },
          { name: "Pollo en salsa trufada de hongos", desc: "Espárragos a la parrilla, espinacas salteadas" },
          { name: "Pastas tradicionales", desc: "Pomodoro, pesto, puttanesca o aglio" },
          { name: "Spaghetti alle vongole", desc: "Vino blanco, fondo de vongole, peperoncino, ajo" },
          { name: "Ravioles de choclo", desc: "Jamón de trucha ahumado, choclo baby a la parrilla, huacatay" },
          { name: "Panzotti de hongos", desc: "Fondo de hongos trufado, grana padano" },
          { name: "Sorrentinos de zapallo loche", desc: "Mantequilla trufada, grana padano, jamón serrano" },
          { name: "Fideuá de mariscos", desc: "", photo: "assets/img/fideua-de-mariscos.webp" }
        ]
      },
      guarniciones: {
        label: "Guarniciones",
        items: [
          { name: "Papas fritas" }, { name: "Camote" }, { name: "Palta" },
          { name: "Arroz con choclo" }, { name: "Arroz frito" }, { name: "Ensalada mixta" },
          { name: "Vegetales al wok" }, { name: "Choclo" }, { name: "Tostadas" },
          { name: "Pan tostado" }, { name: "Grana padano" }, { name: "Galletas de soda" }
        ]
      },
      coctales: {
        label: "Coctelería",
        items: [
          { name: "Pisco Punch", desc: "El infaltable de la casa", photo: "assets/img/pisco-punch.webp" },
          { name: "Pisco Sour", desc: "" },
          { name: "Chilcanos", desc: "" },
          { name: "Samboni", desc: "" },
          { name: "Capitán", desc: "" },
          { name: "Chikulin", desc: "" },
          { name: "Tinto de verano", desc: "" }
        ]
      },
      bebidas: {
        label: "Bebidas",
        items: [
          { name: "Gaseosas", desc: "Coca Cola, Coca Cola cero, Inca Kola, Inca Kola cero" },
          { name: "Limonada", desc: "Clásica o frozen" },
          { name: "Maracuyá", desc: "Clásica o frozen" },
          { name: "Cerveza Pilsen y Corona", desc: "" },
          { name: "Cervezas artesanales cusqueñas", desc: "Troglo, Lady Hoppy, La Huaranita IPA, Kincho Red, Quechua Brown" },
          { name: "Café pasado", desc: "" },
          { name: "Infusiones", desc: "" }
        ]
      }
    },

    // ---- Galería: fotos reales del local que no van en cards de carta ----
    gallery: [
      { photo: "assets/img/ceviche-mixto.webp", alt: "Ceviche mixto de bonito con langostinos, pulpo, concha y chicharrón de pota" },
      { photo: "assets/img/tiradito-de-charela.webp", alt: "Tiradito de charela al ají amarillo" },
      { photo: "assets/img/langostinos-al-ajillo-2.webp", alt: "Langostinos al ajillo con crema de ajíes" },
      { photo: "assets/img/erizo-mantequilla-vongole.webp", alt: "Erizo en su mantequilla al vongole y vino blanco" }
    ],

    footer: {
      credits: "Fotografías propias de M Taberna Picantería."
    }
  };
})();
