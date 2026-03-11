import { DEFAULT_CO2_FACTORS, DEFAULT_WATER_FACTORS } from "./co2-calculator";

export type MaterialCategory =
  | "Plastico"
  | "Papel y Carton"
  | "Metal"
  | "Vidrio"
  | "Organico"
  | "Especial";

export interface MaterialData {
  slug: string;
  name: string;
  materialKey: string;
  co2Factor: number;
  waterFactor: number;
  description: string;
  recyclingProcess: string;
  tips: string[];
  funFact: string;
  keywords: string[];
  category: MaterialCategory;
  faqs: { question: string; answer: string }[];
}

export const MATERIALS: MaterialData[] = [
  // ── TOP MATERIALS (detailed content) ──

  {
    slug: "plastico-pet",
    name: "Plastico PET",
    materialKey: "Plastico PET",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico PET"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico PET"],
    description:
      "El PET (polietileno tereftalato) es el plastico mas reciclado en Chile. Se encuentra en botellas de bebidas, envases de alimentos y fibras textiles. Su reciclaje es fundamental para reducir la contaminacion por plasticos en vertederos y oceanos.",
    recyclingProcess:
      "Las botellas PET se recolectan, separan por color, lavan y trituran en escamas (flakes). Estas escamas se funden y transforman en pellets que sirven para fabricar nuevas botellas, fibras textiles (como polar), envases y laminas. En Chile, plantas como Recipet procesan miles de toneladas anuales.",
    tips: [
      "Enjuaga las botellas antes de reciclar para evitar contaminacion",
      "Retira las tapas (son de otro plastico, PP) y reciclalas por separado",
      "Aplasta las botellas para optimizar espacio en el contenedor",
      "Busca el simbolo triangular con el numero 1 para identificar PET",
    ],
    funFact:
      "Una botella PET tarda hasta 700 anos en degradarse, pero al reciclarla se ahorra el 75% de la energia necesaria para fabricar una nueva desde cero.",
    keywords: [
      "reciclar PET Chile",
      "reciclaje botellas plasticas",
      "plastico PET reciclaje",
      "reciclar botellas PET",
      "PET reciclado",
      "botellas plasticas reciclaje Chile",
      "donde reciclar PET",
      "impacto ambiental PET",
      "huella de carbono plastico",
      "reciclaje plastico numero 1",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "Como identificar el plastico PET para reciclarlo?",
        answer:
          "El PET se identifica por el simbolo de reciclaje triangular con el numero 1 en la base del envase. Es transparente, liviano y se usa principalmente en botellas de bebidas y envases de alimentos.",
      },
      {
        question: "Donde puedo reciclar botellas PET en Chile?",
        answer:
          "En Chile puedes reciclar PET en puntos limpios municipales, centros de reciclaje autorizados y a traves de empresas gestoras certificadas. La Ley REP exige a los productores financiar la recoleccion y reciclaje.",
      },
      {
        question: "Cuantas veces se puede reciclar el plastico PET?",
        answer:
          "El PET puede reciclarse multiples veces. En reciclaje mecanico se recicla 2-3 veces antes de perder propiedades, pero el reciclaje quimico permite ciclos practicamente ilimitados.",
      },
    ],
  },

  {
    slug: "carton",
    name: "Carton",
    materialKey: "Carton",
    co2Factor: DEFAULT_CO2_FACTORS["Carton"],
    waterFactor: DEFAULT_WATER_FACTORS["Carton"],
    description:
      "El carton corrugado es uno de los materiales mas reciclados en la industria chilena. Se usa masivamente en embalajes, cajas de envio y packaging de productos. Su reciclaje ahorra arboles, agua y energia.",
    recyclingProcess:
      "El carton se recolecta, clasifica y compacta en fardos. En la planta recicladora se tritura y mezcla con agua para crear una pulpa. Esta pulpa se limpia de tintas y contaminantes, se prensa y seca para formar nuevas laminas de carton. Chile cuenta con varias plantas de reciclaje de carton, incluyendo CMPC y Papeles Bio Bio.",
    tips: [
      "Aplana las cajas para ahorrar espacio de almacenamiento y transporte",
      "Retira cintas adhesivas, grapas y etiquetas plasticas antes de reciclar",
      "No recicles carton mojado, con grasa o restos de comida",
      "Separa el carton corrugado del carton delgado (cartulina) si tu punto limpio lo requiere",
    ],
    funFact:
      "Reciclar una tonelada de carton salva aproximadamente 17 arboles y ahorra 26,000 litros de agua comparado con fabricar carton virgen.",
    keywords: [
      "reciclar carton Chile",
      "reciclaje carton corrugado",
      "donde reciclar carton",
      "carton reciclado",
      "reciclaje cajas carton",
      "impacto ambiental carton",
      "carton reciclaje empresa",
      "gestionar carton reciclaje",
      "Ley REP carton Chile",
      "certificado reciclaje carton",
    ],
    category: "Papel y Carton",
    faqs: [
      {
        question: "Puedo reciclar carton mojado o con grasa?",
        answer:
          "No. El carton contaminado con grasa, aceite o restos de comida no es apto para reciclaje porque contamina la pulpa. Las cajas de pizza con grasa deben ir a la basura comun o compostar si son de carton puro.",
      },
      {
        question: "Cuantas veces se puede reciclar el carton?",
        answer:
          "Las fibras de carton se pueden reciclar entre 5 y 7 veces antes de que se acorten demasiado para producir nuevo carton. Despues pueden usarse para aislantes o compostaje.",
      },
      {
        question: "Como gestionar el reciclaje de carton en mi empresa?",
        answer:
          "Instala contenedores separados para carton, capacita a tu equipo para aplanarl y mantenerlo seco, y contrata un gestor certificado que emita certificados de reciclaje validos para la Ley REP.",
      },
    ],
  },

  {
    slug: "vidrio",
    name: "Vidrio",
    materialKey: "Vidrio",
    co2Factor: DEFAULT_CO2_FACTORS["Vidrio"],
    waterFactor: DEFAULT_WATER_FACTORS["Vidrio"],
    description:
      "El vidrio es 100% reciclable y puede reciclarse infinitamente sin perder calidad. En Chile, Cristalerias de Chile y otras plantas procesan vidrio para crear nuevos envases. Es uno de los materiales mas amigables con el medio ambiente.",
    recyclingProcess:
      "El vidrio se recolecta, separa por colores (transparente, verde, ambar), se limpia y tritura en un material llamado calcin. El calcin se funde a 1,500 grados C junto con materia prima virgen para fabricar nuevos envases. Usar calcin reduce la temperatura necesaria, ahorrando energia.",
    tips: [
      "Enjuaga los envases de vidrio antes de depositarlos en el contenedor",
      "Separa por color si tu punto limpio lo permite: transparente, verde y ambar",
      "No mezcles con ceramica, porcelana o vidrio de ventana (tienen diferente composicion)",
      "Las tapas metalicas se reciclan por separado como metal",
    ],
    funFact:
      "El vidrio puede reciclarse infinitas veces sin perder propiedades. Una botella de vidrio que se recicla hoy puede volver a estar en la estanteria en solo 30 dias.",
    keywords: [
      "reciclar vidrio Chile",
      "reciclaje vidrio botellas",
      "vidrio reciclado",
      "donde reciclar vidrio",
      "reciclaje envases vidrio",
      "punto limpio vidrio Chile",
      "impacto ambiental vidrio",
      "vidrio reciclaje infinito",
      "separar vidrio por colores",
      "certificado reciclaje vidrio",
    ],
    category: "Vidrio",
    faqs: [
      {
        question: "El vidrio realmente se recicla infinitas veces?",
        answer:
          "Si. A diferencia de otros materiales, el vidrio no pierde calidad ni propiedades al reciclarse. Cada vez que se funde y moldea, el resultado es identico al vidrio virgen.",
      },
      {
        question: "Que tipos de vidrio NO se pueden reciclar?",
        answer:
          "No se reciclan vidrios de ventanas, espejos, ceramica, porcelana, cristal de plomo ni vidrio pyrex, ya que tienen diferente composicion quimica y punto de fusion.",
      },
      {
        question: "Por que es importante separar el vidrio por colores?",
        answer:
          "La separacion por color (transparente, verde, ambar) permite producir vidrio reciclado de mayor calidad. El vidrio de color contamina el transparente, reduciendo su valor comercial.",
      },
    ],
  },

  {
    slug: "aluminio",
    name: "Aluminio",
    materialKey: "Aluminio",
    co2Factor: DEFAULT_CO2_FACTORS["Aluminio"],
    waterFactor: DEFAULT_WATER_FACTORS["Aluminio"],
    description:
      "El aluminio es el material con mayor ahorro de CO2 al reciclarse. Reciclar una lata de aluminio ahorra el 95% de la energia necesaria para producir aluminio virgen. En Chile, las latas de bebidas son la principal fuente de aluminio reciclable.",
    recyclingProcess:
      "Las latas y otros productos de aluminio se recolectan, compactan y transportan a fundiciones. Alli se trituran, eliminan las lacas y pinturas, y se funden a 660 grados C. El aluminio liquido se moldea en lingotes que la industria usa para fabricar nuevas latas, piezas automotrices y materiales de construccion.",
    tips: [
      "Aplasta las latas para ahorrar espacio y facilitar el transporte",
      "No es necesario lavar las latas, pero elimina restos grandes de comida",
      "Separa las latas de aluminio de las de acero usando un iman (el aluminio no es magnetico)",
      "Incluye papel aluminio limpio, bandejas de aluminio y aerosoles vacios",
    ],
    funFact:
      "Reciclar una sola lata de aluminio ahorra energia suficiente para hacer funcionar un televisor durante 3 horas. El aluminio reciclado requiere solo el 5% de la energia del aluminio virgen.",
    keywords: [
      "reciclar aluminio Chile",
      "reciclaje latas aluminio",
      "aluminio reciclado",
      "donde reciclar latas",
      "reciclaje aluminio empresa",
      "impacto CO2 aluminio",
      "precio aluminio reciclado Chile",
      "latas aluminio reciclaje",
      "ahorro energia aluminio reciclado",
      "certificado reciclaje aluminio",
      "aluminio vs acero reciclaje",
    ],
    category: "Metal",
    faqs: [
      {
        question: "Por que el aluminio es tan importante de reciclar?",
        answer:
          "El aluminio es el campeon del reciclaje: reciclarlo ahorra el 95% de la energia y evita 9.1 kg de CO2 por cada kilo reciclado. Es el material con mayor impacto positivo por kilogramo.",
      },
      {
        question: "Como diferenciar latas de aluminio de latas de acero?",
        answer:
          "Usa un iman: el aluminio NO se pega al iman, mientras que el acero si. Las latas de bebidas son generalmente de aluminio, y las de conservas suelen ser de acero.",
      },
      {
        question: "Se puede reciclar el papel aluminio?",
        answer:
          "Si, siempre que este limpio. Junta varias piezas pequenas en una bola del tamano de un puno para que no se pierdan en el proceso de clasificacion.",
      },
    ],
  },

  {
    slug: "papel",
    name: "Papel",
    materialKey: "Papel",
    co2Factor: DEFAULT_CO2_FACTORS["Papel"],
    waterFactor: DEFAULT_WATER_FACTORS["Papel"],
    description:
      "El reciclaje de papel es esencial para reducir la deforestacion y el consumo de agua en Chile. Incluye papel de oficina, periodicos, revistas y papel blanco. La industria papelera chilena es lider en Latinoamerica en tasas de reciclaje.",
    recyclingProcess:
      "El papel se recolecta, clasifica por tipo y calidad, y se lleva a plantas recicladoras. Alli se mezcla con agua para crear pulpa, se eliminan tintas mediante destintado, y se procesan nuevas hojas o rollos. El papel de oficina blanco tiene mayor valor por su fibra de calidad.",
    tips: [
      "Separa el papel blanco del papel de color, periodico y revistas",
      "No recicles papel plastificado, papel carbon ni papel higienico",
      "Retira clips, grapas y ventanas plasticas de los sobres",
      "Mantiene el papel seco y limpio para maximizar su valor de reciclaje",
    ],
    funFact:
      "Reciclar una tonelada de papel salva 17 arboles, ahorra 26,000 litros de agua, 4,000 kWh de electricidad y evita 2.5 metros cubicos de espacio en vertedero.",
    keywords: [
      "reciclar papel Chile",
      "reciclaje papel oficina",
      "papel reciclado",
      "donde reciclar papel",
      "reciclaje papel empresa",
      "impacto ambiental papel",
      "ahorro agua papel reciclado",
      "papel blanco reciclaje",
      "gestionar papel reciclaje",
      "certificado reciclaje papel",
    ],
    category: "Papel y Carton",
    faqs: [
      {
        question: "Que tipos de papel se pueden reciclar?",
        answer:
          "Se reciclan papel de oficina, periodicos, revistas, folletos, cuadernos y papel kraft. No se reciclan papel higienico, servilletas usadas, papel encerado ni papel plastificado.",
      },
      {
        question: "El papel con tinta se puede reciclar?",
        answer:
          "Si. El proceso de destintado en las plantas recicladoras elimina la tinta. Solo el papel impreso con tintas especiales o plastificado no es apto.",
      },
      {
        question: "Cuantas veces se puede reciclar el papel?",
        answer:
          "Las fibras de papel se pueden reciclar entre 5 y 7 veces. Cada ciclo acorta las fibras, por lo que eventualmente se usan para productos de menor calidad como carton o papel higienico reciclado.",
      },
    ],
  },

  {
    slug: "acero",
    name: "Acero",
    materialKey: "Acero",
    co2Factor: DEFAULT_CO2_FACTORS["Acero"],
    waterFactor: DEFAULT_WATER_FACTORS["Acero"],
    description:
      "El acero es el metal mas reciclado del mundo. En Chile se encuentra en latas de conserva, electrodomesticos, estructuras y vehiculos. Reciclarlo reduce significativamente el consumo de mineral de hierro y energia.",
    recyclingProcess:
      "El acero se recolecta, separa magneticamente de otros materiales, compacta y transporta a fundiciones. Se funde en hornos de arco electrico a mas de 1,500 grados C y se moldea en nuevos productos. El proceso es mas eficiente energeticamente que la produccion desde mineral de hierro.",
    tips: [
      "Usa un iman para identificar latas de acero: el acero es magnetico",
      "Enjuaga las latas de conserva antes de reciclar",
      "Incluye tapas de frascos metalicas, clavos y tornillos",
      "Consulta si tu gestor acepta chatarra de mayor tamano como electrodomesticos",
    ],
    funFact:
      "El acero es 100% reciclable y puede reciclarse infinitamente sin perder sus propiedades. Actualmente, el 30% del acero mundial proviene de material reciclado.",
    keywords: [
      "reciclar acero Chile",
      "reciclaje latas conserva",
      "acero reciclado",
      "chatarra acero reciclaje",
      "donde reciclar acero",
      "latas acero reciclaje",
      "reciclaje metales Chile",
      "impacto ambiental acero",
      "certificado reciclaje acero",
      "acero vs aluminio reciclaje",
    ],
    category: "Metal",
    faqs: [
      {
        question: "Como diferenciar latas de acero de aluminio?",
        answer:
          "Aplica un iman: las latas de acero son magneticas y se pegan, las de aluminio no. Las latas de conservas son generalmente acero, las de bebidas son aluminio.",
      },
      {
        question: "Se pueden reciclar electrodomesticos de acero?",
        answer:
          "Si. Los electrodomesticos grandes (linea blanca) contienen acero reciclable. Contacta a un gestor autorizado o lleva a un punto limpio que acepte RAE (residuos de aparatos electricos).",
      },
    ],
  },

  {
    slug: "textil",
    name: "Textil",
    materialKey: "Textil",
    co2Factor: DEFAULT_CO2_FACTORS["Textil"],
    waterFactor: DEFAULT_WATER_FACTORS["Textil"],
    description:
      "La industria textil es una de las mas contaminantes del mundo. En Chile, el desierto de Atacama recibe toneladas de ropa desechada. Reciclar textiles evita una enorme cantidad de CO2 y reduce la demanda de fibras virgenes.",
    recyclingProcess:
      "Los textiles se clasifican por tipo de fibra y estado. La ropa en buen estado se destina a reutilizacion. Los textiles no reutilizables se trituran mecanicamente para obtener fibras que se usan en aislantes, trapos industriales o nuevos hilos. El reciclaje quimico disuelve fibras sinteticas para crear material virgen.",
    tips: [
      "Dona ropa en buen estado antes de enviarla a reciclaje",
      "Separa por tipo de fibra si es posible: algodon, poliester, lana",
      "Incluye sabanas, cortinas, toallas y otros textiles del hogar",
      "Busca puntos de recoleccion de ropa en supermercados y tiendas de moda",
    ],
    funFact:
      "Fabricar una sola camiseta de algodon requiere 2,700 litros de agua. Reciclar textiles evita 3.5 kg de CO2 por cada kilogramo, uno de los mayores ahorros entre todos los materiales.",
    keywords: [
      "reciclar ropa Chile",
      "reciclaje textil",
      "ropa usada reciclaje",
      "donde reciclar ropa Chile",
      "textil reciclado",
      "impacto ambiental moda",
      "fast fashion reciclaje",
      "reciclaje fibras textiles",
      "ropa Atacama reciclaje",
      "economia circular textil",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Donde puedo llevar ropa usada en Chile?",
        answer:
          "Puedes llevar ropa a tiendas con programas de recoleccion (H&M, Zara), puntos limpios municipales, organizaciones como Ropa Amiga o contenedores de ropa en supermercados.",
      },
      {
        question: "Que pasa con la ropa que se desecha en el desierto de Atacama?",
        answer:
          "Chile recibe toneladas de ropa usada importada que termina en vertederos ilegales en Atacama. El reciclaje textil es clave para reducir este problema ambiental y de salud.",
      },
    ],
  },

  {
    slug: "tetrapak",
    name: "TetraPak",
    materialKey: "TetraPak",
    co2Factor: DEFAULT_CO2_FACTORS["TetraPak"],
    waterFactor: DEFAULT_WATER_FACTORS["TetraPak"],
    description:
      "Los envases TetraPak estan compuestos de carton (75%), polietileno (20%) y aluminio (5%). Aunque son mas complejos de reciclar que un solo material, en Chile ya existen plantas capaces de separar y reciclar sus componentes.",
    recyclingProcess:
      "Los envases se abren, enjuagan y envian a plantas especializadas. Alli se sumergen en agua para separar las capas: la fibra de carton se usa para fabricar papel y carton reciclado. Las capas de plastico y aluminio (polialuminio) se procesan para crear placas de techos, muebles o ladrillos ecologicos.",
    tips: [
      "Enjuaga los envases y abrelos completamente para facilitar el secado",
      "Aplanalos para reducir volumen",
      "No retires la tapita plastica, se recicla junto con el envase",
      "Busca puntos de recoleccion especificos para TetraPak en tu comuna",
    ],
    funFact:
      "Del reciclaje del polialuminio de TetraPak se fabrican placas de techo, maceteros y mobiliario urbano. Un solo envase de 1 litro contiene suficiente carton para fabricar una hoja de papel A4.",
    keywords: [
      "reciclar tetrapak Chile",
      "reciclaje tetra pak",
      "envases tetrapak reciclaje",
      "donde reciclar tetrapak",
      "tetra pak reciclado",
      "leche caja reciclaje",
      "envase multicapa reciclaje",
      "polialuminio reciclaje",
      "carton bebidas reciclaje",
      "tetrapak punto limpio Chile",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Se puede reciclar TetraPak en Chile?",
        answer:
          "Si. Aunque son envases multicapa, en Chile existen puntos de recoleccion y plantas que separan el carton del polialuminio. Consulta el mapa de puntos limpios de tu municipio.",
      },
      {
        question: "Hay que enjuagar los TetraPak antes de reciclar?",
        answer:
          "Si. Enjuagalos con poca agua, abrelos completamente y aplanalos. Esto evita malos olores y facilita el proceso de reciclaje.",
      },
    ],
  },

  {
    slug: "electronicos",
    name: "Electronicos (RAEE)",
    materialKey: "Electronicos",
    co2Factor: DEFAULT_CO2_FACTORS["Electronicos"],
    waterFactor: DEFAULT_WATER_FACTORS["Electronicos"],
    description:
      "Los residuos de aparatos electricos y electronicos (RAEE) contienen metales valiosos como oro, plata, cobre y tierras raras, pero tambien sustancias toxicas. Su correcto reciclaje es obligatorio en Chile bajo la Ley REP.",
    recyclingProcess:
      "Los RAEE se desmontan manualmente para separar componentes reutilizables. Los circuitos impresos se envian a plantas de refinacion para recuperar metales preciosos. Los plasticos, vidrio y metales se procesan por separado. Las sustancias peligrosas como mercurio y plomo se tratan de forma segura.",
    tips: [
      "Nunca deseches electronicos en la basura comun por los componentes toxicos",
      "Borra tus datos personales antes de entregar dispositivos a reciclaje",
      "Busca campanas de recoleccion de RAEE en tu municipio",
      "Considera donar equipos funcionales antes de reciclar",
    ],
    funFact:
      "Una tonelada de celulares contiene mas oro que una tonelada de mineral de mina de oro. Recuperar metales preciosos de electronica reciclada es 13 veces mas eficiente que la mineria tradicional.",
    keywords: [
      "reciclar electronicos Chile",
      "reciclaje RAEE",
      "residuos electronicos reciclaje",
      "donde reciclar celulares Chile",
      "reciclaje computadores",
      "RAEE Chile Ley REP",
      "reciclar electrodomesticos",
      "basura electronica Chile",
      "e-waste reciclaje",
      "metales preciosos electronica",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Donde reciclar electronicos en Chile?",
        answer:
          "Puedes llevarlos a puntos limpios municipales, campanas de recoleccion de RAEE, tiendas de tecnologia con programas de retorno, o contactar gestores autorizados por el Ministerio del Medio Ambiente.",
      },
      {
        question: "Que electronicos se pueden reciclar?",
        answer:
          "Celulares, computadores, tablets, televisores, impresoras, microondas, refrigeradores y practicamente cualquier aparato electrico o electronico. La Ley REP cubre 6 categorias de RAEE.",
      },
    ],
  },

  {
    slug: "aceite-vegetal",
    name: "Aceite Vegetal Usado",
    materialKey: "Aceite vegetal",
    co2Factor: DEFAULT_CO2_FACTORS["Aceite vegetal"],
    waterFactor: DEFAULT_WATER_FACTORS["Aceite vegetal"],
    description:
      "El aceite de cocina usado es altamente contaminante si se vierte por el desague: un litro contamina hasta 1,000 litros de agua. En Chile, se recicla para producir biodiesel y otros productos quimicos.",
    recyclingProcess:
      "El aceite usado se recolecta, filtra para eliminar residuos solidos y se somete a un proceso de transesterificacion para convertirlo en biodiesel. Tambien puede usarse para fabricar jabones, lubricantes industriales y velas. Empresas como Bioils en Chile procesan aceite usado a escala industrial.",
    tips: [
      "Deja enfriar el aceite completamente antes de almacenarlo",
      "Filtralo con un colador para retirar restos de comida",
      "Guarda en botellas plasticas con tapa para su recoleccion",
      "Nunca lo viertas por el lavaplatos, inodoro o alcantarillado",
    ],
    funFact:
      "Un litro de aceite usado puede contaminar hasta 1,000 litros de agua potable. Pero al reciclarlo, ese mismo litro produce 0.9 litros de biodiesel que reduce emisiones un 80% comparado con diesel fosil.",
    keywords: [
      "reciclar aceite cocina Chile",
      "reciclaje aceite vegetal usado",
      "donde reciclar aceite cocina",
      "aceite usado biodiesel",
      "aceite cocina contaminacion agua",
      "reciclar aceite restaurante",
      "aceite vegetal punto limpio",
      "biodiesel aceite reciclado Chile",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Por que no debo botar aceite por el lavaplatos?",
        answer:
          "El aceite se solidifica en las tuberias causando atascos. Ademas, un litro contamina hasta 1,000 litros de agua, dificultando el tratamiento en plantas depuradoras.",
      },
      {
        question: "Como almacenar aceite usado para reciclaje?",
        answer:
          "Dejalo enfriar, filtralo y guardalo en botellas plasticas con tapa. Cuando tengas suficiente, llevalo a un punto limpio o contacta un gestor de aceites usados.",
      },
    ],
  },

  // ── SECONDARY MATERIALS (shorter content) ──

  {
    slug: "plastico-hdpe",
    name: "Plastico HDPE",
    materialKey: "Plastico HDPE",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico HDPE"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico HDPE"],
    description:
      "El HDPE (polietileno de alta densidad) se encuentra en envases de detergente, shampoo, leche y bolsas plasticas gruesas. Es el plastico numero 2 y uno de los mas faciles de reciclar.",
    recyclingProcess:
      "Los envases HDPE se recolectan, lavan, trituran y funden para crear pellets. Estos se usan para fabricar tuberias, mobiliario urbano, contenedores y nuevos envases.",
    tips: [
      "Identifica el simbolo triangular con numero 2",
      "Enjuaga los envases de detergente y shampoo",
      "Las tapas de botellas PET son frecuentemente HDPE",
    ],
    funFact:
      "Los envases HDPE reciclados se usan para fabricar bancas de parques, juegos infantiles y tuberias de riego agricola en Chile.",
    keywords: [
      "reciclar HDPE Chile",
      "plastico numero 2 reciclaje",
      "envases HDPE reciclaje",
      "polietileno alta densidad reciclar",
      "HDPE reciclado",
      "botellas detergente reciclar",
      "plastico HDPE punto limpio",
      "reciclaje plastico HDPE empresa",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "Que productos estan hechos de HDPE?",
        answer:
          "Envases de detergente, shampoo, leche, aceite, bolsas plasticas gruesas y bidones. Se identifica con el numero 2 dentro del triangulo de reciclaje.",
      },
    ],
  },

  {
    slug: "plastico-ldpe",
    name: "Plastico LDPE",
    materialKey: "Plastico LDPE",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico LDPE"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico LDPE"],
    description:
      "El LDPE (polietileno de baja densidad) se usa en bolsas plasticas flexibles, film de embalaje y envolturas. Es el plastico numero 4 y su reciclaje es menos comun pero igualmente importante.",
    recyclingProcess:
      "El LDPE se recolecta, lava, funde y transforma en pellets para fabricar nuevas bolsas, film agricola, tuberias flexibles y madera plastica.",
    tips: [
      "Junta varias bolsas plasticas en una sola para facilitar la recoleccion",
      "Lleva film stretch y burbujas de embalaje al punto limpio",
      "Busca el numero 4 en el triangulo de reciclaje",
    ],
    funFact:
      "Las bolsas plasticas LDPE pueden reciclarse para crear madera plastica, un material que no se pudre y reemplaza la madera natural en bancas y cercos.",
    keywords: [
      "reciclar LDPE Chile",
      "plastico numero 4 reciclaje",
      "bolsas plasticas reciclaje",
      "LDPE reciclado",
      "film plastico reciclaje",
      "polietileno baja densidad",
      "reciclar bolsas plasticas Chile",
      "plastico LDPE punto limpio",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "Donde puedo reciclar bolsas plasticas en Chile?",
        answer:
          "Algunos supermercados tienen contenedores para bolsas plasticas. Tambien puedes llevarlas a puntos limpios que acepten plastico numero 4 (LDPE).",
      },
    ],
  },

  {
    slug: "plastico-pp",
    name: "Plastico PP",
    materialKey: "Plastico PP",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico PP"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico PP"],
    description:
      "El polipropileno (PP) es el plastico numero 5, presente en tapas de botellas, envases de yogur, tuppers y pajitas. Es resistente al calor y cada vez mas reciclado en Chile.",
    recyclingProcess:
      "El PP se recolecta, lava, tritura y funde en pellets para fabricar piezas automotrices, muebles de jardin, contenedores y textiles no tejidos.",
    tips: [
      "Las tapas de botellas de agua y bebidas suelen ser PP",
      "Enjuaga envases de yogur y margarina antes de reciclar",
      "Busca el numero 5 en el triangulo de reciclaje",
    ],
    funFact:
      "El PP reciclado es tan resistente que se usa para fabricar paragolpes de autos y cajas de herramientas industriales.",
    keywords: [
      "reciclar PP Chile",
      "plastico numero 5 reciclaje",
      "polipropileno reciclaje",
      "PP reciclado",
      "envases yogur reciclar",
      "tapas botella reciclaje",
      "plastico PP punto limpio",
      "reciclaje polipropileno empresa",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "Se pueden reciclar las tapas de botellas?",
        answer:
          "Si. Las tapas de botellas son generalmente PP (numero 5) y se reciclan por separado. Retiralas de las botellas PET y depositalas en el contenedor de plasticos.",
      },
    ],
  },

  {
    slug: "plastico-ps",
    name: "Plastico PS",
    materialKey: "Plastico PS",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico PS"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico PS"],
    description:
      "El poliestireno (PS), incluyendo el plumavit (EPS), es el plastico numero 6. Se usa en vasos desechables, bandejas de carne y embalaje. Es mas dificil de reciclar pero no imposible.",
    recyclingProcess:
      "El PS se compacta (ocupa mucho volumen), tritura y funde para crear pellets. El plumavit se densifica con calor o solventes. Se transforma en marcos de cuadros, molduras decorativas y materiales de construccion.",
    tips: [
      "El plumavit limpio es reciclable, pero pocos puntos limpios lo aceptan",
      "Busca el numero 6 en el triangulo de reciclaje",
      "Prefiere alternativas al plumavit cuando sea posible",
    ],
    funFact:
      "El plumavit esta compuesto en un 98% de aire. Compactarlo reduce su volumen en 50 a 80 veces, haciendolo viable para transporte y reciclaje.",
    keywords: [
      "reciclar plumavit Chile",
      "reciclaje poliestireno",
      "PS reciclado",
      "plumavit reciclaje",
      "plastico numero 6",
      "reciclar vasos desechables",
      "poliestireno expandido reciclaje",
      "EPS reciclaje Chile",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "Se puede reciclar el plumavit en Chile?",
        answer:
          "Si, aunque es menos comun. Busca puntos de recoleccion especificos para plumavit. Debe estar limpio y sin restos de comida o cinta adhesiva.",
      },
    ],
  },

  {
    slug: "madera",
    name: "Madera",
    materialKey: "Madera",
    co2Factor: DEFAULT_CO2_FACTORS["Madera"],
    waterFactor: DEFAULT_WATER_FACTORS["Madera"],
    description:
      "La madera de pallets, embalajes y muebles puede reciclarse en Chile para fabricar tableros de particulas, biomasa energetica o compost. Su correcto reciclaje evita la quema no controlada.",
    recyclingProcess:
      "La madera se recolecta, retira clavos y elementos metalicos, tritura en astillas y se usa para fabricar tableros aglomerados (MDF, MDP), biomasa para calderas o mulch para jardineria.",
    tips: [
      "No recicles madera tratada quimicamente (CCA) o pintada con plomo",
      "Separa clavos y herrajes metalicos antes de entregar",
      "Los pallets en buen estado pueden reutilizarse directamente",
    ],
    funFact:
      "Un pallet de madera puede reutilizarse hasta 10 veces y al final de su vida util se recicla en tableros de particulas o biomasa energetica.",
    keywords: [
      "reciclar madera Chile",
      "reciclaje pallets",
      "madera reciclada",
      "biomasa madera reciclaje",
      "tableros particulas reciclaje",
      "residuos madera Chile",
      "madera construccion reciclaje",
      "pallets reutilizar reciclar",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Que tipo de madera se puede reciclar?",
        answer:
          "Se recicla madera no tratada: pallets, cajas, muebles sin pintura toxica y restos de construccion. No se recicla madera con tratamiento CCA, barnices toxicos o contaminada con quimicos.",
      },
    ],
  },

  {
    slug: "organico",
    name: "Residuos Organicos",
    materialKey: "Organico",
    co2Factor: DEFAULT_CO2_FACTORS["Organico"],
    waterFactor: DEFAULT_WATER_FACTORS["Organico"],
    description:
      "Los residuos organicos representan mas del 50% de la basura domiciliaria en Chile. El compostaje y biodigestion evitan emisiones de metano en vertederos y generan abono natural para la agricultura.",
    recyclingProcess:
      "Los residuos organicos se compostan (descomposicion aerobica) o se procesan en biodigestores (anaerobica) para generar biogas y digestato fertil. El compost resultante se usa como mejorador de suelos en agricultura y paisajismo.",
    tips: [
      "Separa restos de frutas, verduras, cascaras de huevo y borra de cafe",
      "Evita carnes, lacteos y aceites en compostaje casero",
      "Tritura los residuos grandes para acelerar el compostaje",
    ],
    funFact:
      "Los residuos organicos en vertederos generan metano, un gas de efecto invernadero 28 veces mas potente que el CO2. Compostar elimina por completo esta emision.",
    keywords: [
      "compostar Chile",
      "reciclaje organico",
      "compostaje residuos",
      "residuos organicos reciclaje",
      "compost casero Chile",
      "biodigestion residuos",
      "organico punto limpio",
      "abono organico reciclaje",
    ],
    category: "Organico",
    faqs: [
      {
        question: "Como empezar a compostar en casa?",
        answer:
          "Consigue una compostera o haz una con un recipiente con agujeros. Alterna capas verdes (restos de cocina) con capas secas (hojas, carton). Mantiene humedo y revuelve semanalmente.",
      },
    ],
  },

  {
    slug: "neumaticos",
    name: "Neumaticos",
    materialKey: "Neumaticos",
    co2Factor: DEFAULT_CO2_FACTORS["Neumaticos"],
    waterFactor: DEFAULT_WATER_FACTORS["Neumaticos"],
    description:
      "Los neumaticos fuera de uso (NFU) son un residuo problematico en Chile. No se biodegradan y ocupan mucho espacio en vertederos. Su reciclaje produce caucho granulado para canchas, pavimentos y energia.",
    recyclingProcess:
      "Los neumaticos se trituran mecanicamente para separar caucho, acero y fibra textil. El caucho granulado se usa en canchas de pasto sintetico, pavimentos de seguridad, asfalto modificado y como combustible alternativo en cementeras.",
    tips: [
      "Nunca quemes neumaticos: liberan gases altamente toxicos",
      "Entrega los NFU en vulcanizaciones o puntos de recoleccion autorizados",
      "Los talleres estan obligados a gestionar los neumaticos reemplazados",
    ],
    funFact:
      "El caucho de neumaticos reciclados se usa para crear las superficies de seguridad en parques infantiles y pistas de atletismo en toda Chile.",
    keywords: [
      "reciclar neumaticos Chile",
      "NFU reciclaje",
      "neumaticos fuera uso",
      "caucho granulado reciclaje",
      "donde reciclar neumaticos",
      "neumaticos reciclados canchas",
      "Ley REP neumaticos Chile",
      "vulcanizacion reciclaje",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Donde puedo llevar neumaticos usados en Chile?",
        answer:
          "Puedes dejarlos en vulcanizaciones autorizadas, puntos limpios municipales o contactar gestores de NFU. La Ley REP obliga a los productores a financiar su gestion.",
      },
    ],
  },

  {
    slug: "baterias",
    name: "Baterias",
    materialKey: "Baterias",
    co2Factor: DEFAULT_CO2_FACTORS["Baterias"],
    waterFactor: DEFAULT_WATER_FACTORS["Baterias"],
    description:
      "Las baterias contienen metales pesados como plomo, cadmio y litio que son altamente contaminantes. Su reciclaje es obligatorio en Chile y permite recuperar materiales valiosos de forma segura.",
    recyclingProcess:
      "Las baterias se clasifican por tipo (plomo-acido, litio-ion, alcalinas), se desmontan y procesan para recuperar plomo, litio, cobalto y otros metales. Las baterias de plomo-acido son las mas recicladas, con tasas superiores al 95%.",
    tips: [
      "Nunca deseches baterias en la basura comun",
      "Almacena baterias usadas en un recipiente seco, no metalico",
      "Las baterias de auto se entregan en talleres y distribuidores",
    ],
    funFact:
      "Las baterias de plomo-acido son el producto de consumo mas reciclado del mundo, con tasas de reciclaje superiores al 99% en paises desarrollados.",
    keywords: [
      "reciclar baterias Chile",
      "reciclaje pilas baterias",
      "baterias litio reciclaje",
      "donde reciclar pilas Chile",
      "baterias plomo reciclaje",
      "residuos peligrosos baterias",
      "baterias auto reciclaje",
      "pilas usadas punto limpio",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Donde reciclar pilas y baterias en Chile?",
        answer:
          "Depositalas en contenedores de pilas disponibles en supermercados, farmacias y puntos limpios. Las baterias de auto se entregan en talleres mecanicos o distribuidores de baterias.",
      },
    ],
  },

  {
    slug: "escombros",
    name: "Escombros",
    materialKey: "Escombros",
    co2Factor: DEFAULT_CO2_FACTORS["Escombros"],
    waterFactor: DEFAULT_WATER_FACTORS["Escombros"],
    description:
      "Los residuos de construccion y demolicion (RCD) son el mayor flujo de residuos en Chile por volumen. Incluyen hormigon, ladrillos, ceramica y asfalto. Su reciclaje reduce la extraccion de aridos naturales.",
    recyclingProcess:
      "Los escombros se clasifican, trituran y criban para obtener aridos reciclados. El hormigon triturado se usa como base de caminos, relleno estructural y sub-base de pavimentos. Los metales se separan magneticamente para reciclaje aparte.",
    tips: [
      "Contrata servicios de retiro de escombros que certifiquen disposicion legal",
      "Separa metales, madera y plasticos de los escombros de hormigon",
      "Los escombros no deben mezclarse con residuos peligrosos como asbesto",
    ],
    funFact:
      "En Chile se generan mas de 7 millones de toneladas de residuos de construccion al ano. Reciclarlos como aridos reduce la necesidad de explotar canteras y lechos de rios.",
    keywords: [
      "reciclar escombros Chile",
      "RCD reciclaje",
      "residuos construccion reciclaje",
      "aridos reciclados",
      "escombros hormigon reciclaje",
      "donde botar escombros legal",
      "gestion RCD Chile",
      "economia circular construccion",
    ],
    category: "Especial",
    faqs: [
      {
        question: "Es legal botar escombros en cualquier lugar?",
        answer:
          "No. En Chile esta prohibido depositar escombros en sitios no autorizados. Debes contratar un servicio de retiro que los lleve a plantas de reciclaje o rellenos autorizados.",
      },
    ],
  },
];

export function getMaterialBySlug(slug: string): MaterialData | undefined {
  return MATERIALS.find((m) => m.slug === slug);
}

export function getMaterialsByCategory(category: MaterialCategory): MaterialData[] {
  return MATERIALS.filter((m) => m.category === category);
}

export function getRelatedMaterials(slug: string, limit = 3): MaterialData[] {
  const current = getMaterialBySlug(slug);
  if (!current) return [];

  // Same category first, then others
  const sameCategory = MATERIALS.filter(
    (m) => m.slug !== slug && m.category === current.category
  );
  const otherCategory = MATERIALS.filter(
    (m) => m.slug !== slug && m.category !== current.category
  );

  return [...sameCategory, ...otherCategory].slice(0, limit);
}

export const CATEGORY_ORDER: MaterialCategory[] = [
  "Plastico",
  "Papel y Carton",
  "Vidrio",
  "Metal",
  "Organico",
  "Especial",
];

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  Plastico: "Plasticos",
  "Papel y Carton": "Papel y Carton",
  Vidrio: "Vidrio",
  Metal: "Metales",
  Organico: "Organicos",
  Especial: "Materiales Especiales",
};
