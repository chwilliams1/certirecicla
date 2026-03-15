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
    name: "Plástico PET",
    materialKey: "Plastico PET",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico PET"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico PET"],
    description:
      "El PET (polietileno tereftalato) es el plástico más reciclado en Chile. Se encuentra en botellas de bebidas, envases de alimentos y fibras textiles. Su reciclaje es fundamental para reducir la contaminación por plásticos en vertederos y océanos.",
    recyclingProcess:
      "Las botellas PET se recolectan, separan por color, lavan y trituran en escamas (flakes). Estas escamas se funden y transforman en pellets que sirven para fabricar nuevas botellas, fibras textiles (como polar), envases y láminas. En Chile, plantas como Recipet procesan miles de toneladas anuales.",
    tips: [
      "Enjuaga las botellas antes de reciclar para evitar contaminación",
      "Retira las tapas (son de otro plástico, PP) y recíclalas por separado",
      "Aplasta las botellas para optimizar espacio en el contenedor",
      "Busca el símbolo triangular con el número 1 para identificar PET",
    ],
    funFact:
      "Una botella PET tarda hasta 700 años en degradarse, pero al reciclarla se ahorra el 75% de la energía necesaria para fabricar una nueva desde cero.",
    keywords: [
      "reciclar PET Chile",
      "reciclaje botellas plásticas",
      "plástico PET reciclaje",
      "reciclar botellas PET",
      "PET reciclado",
      "botellas plásticas reciclaje Chile",
      "dónde reciclar PET",
      "impacto ambiental PET",
      "huella de carbono plástico",
      "reciclaje plástico número 1",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "¿Cómo identificar el plástico PET para reciclarlo?",
        answer:
          "El PET se identifica por el símbolo de reciclaje triangular con el número 1 en la base del envase. Es transparente, liviano y se usa principalmente en botellas de bebidas y envases de alimentos.",
      },
      {
        question: "¿Dónde puedo reciclar botellas PET en Chile?",
        answer:
          "En Chile puedes reciclar PET en puntos limpios municipales, centros de reciclaje autorizados y a través de empresas gestoras certificadas. La Ley REP exige a los productores financiar la recolección y reciclaje.",
      },
      {
        question: "¿Cuántas veces se puede reciclar el plástico PET?",
        answer:
          "El PET puede reciclarse múltiples veces. En reciclaje mecánico se recicla 2-3 veces antes de perder propiedades, pero el reciclaje químico permite ciclos prácticamente ilimitados.",
      },
    ],
  },

  {
    slug: "carton",
    name: "Cartón",
    materialKey: "Carton",
    co2Factor: DEFAULT_CO2_FACTORS["Carton"],
    waterFactor: DEFAULT_WATER_FACTORS["Carton"],
    description:
      "El cartón corrugado es uno de los materiales más reciclados en la industria chilena. Se usa masivamente en embalajes, cajas de envío y packaging de productos. Su reciclaje ahorra árboles, agua y energía.",
    recyclingProcess:
      "El cartón se recolecta, clasifica y compacta en fardos. En la planta recicladora se tritura y mezcla con agua para crear una pulpa. Esta pulpa se limpia de tintas y contaminantes, se prensa y seca para formar nuevas láminas de cartón. Chile cuenta con varias plantas de reciclaje de cartón, incluyendo CMPC y Papeles Bío-Bío.",
    tips: [
      "Aplana las cajas para ahorrar espacio de almacenamiento y transporte",
      "Retira cintas adhesivas, grapas y etiquetas plásticas antes de reciclar",
      "No recicles cartón mojado, con grasa o restos de comida",
      "Separa el cartón corrugado del cartón delgado (cartulina) si tu punto limpio lo requiere",
    ],
    funFact:
      "Reciclar una tonelada de cartón salva aproximadamente 17 árboles y ahorra 26,000 litros de agua comparado con fabricar cartón virgen.",
    keywords: [
      "reciclar cartón Chile",
      "reciclaje cartón corrugado",
      "dónde reciclar cartón",
      "cartón reciclado",
      "reciclaje cajas cartón",
      "impacto ambiental cartón",
      "cartón reciclaje empresa",
      "gestionar cartón reciclaje",
      "Ley REP cartón Chile",
      "certificado reciclaje cartón",
    ],
    category: "Papel y Carton",
    faqs: [
      {
        question: "¿Puedo reciclar cartón mojado o con grasa?",
        answer:
          "No. El cartón contaminado con grasa, aceite o restos de comida no es apto para reciclaje porque contamina la pulpa. Las cajas de pizza con grasa deben ir a la basura común o compostar si son de cartón puro.",
      },
      {
        question: "¿Cuántas veces se puede reciclar el cartón?",
        answer:
          "Las fibras de cartón se pueden reciclar entre 5 y 7 veces antes de que se acorten demasiado para producir nuevo cartón. Después pueden usarse para aislantes o compostaje.",
      },
      {
        question: "¿Cómo gestionar el reciclaje de cartón en mi empresa?",
        answer:
          "Instala contenedores separados para cartón, capacita a tu equipo para aplanarlos y mantenerlo seco, y contrata un gestor certificado que emita certificados de reciclaje válidos para la Ley REP.",
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
      "El vidrio es 100% reciclable y puede reciclarse infinitamente sin perder calidad. En Chile, Cristalerías de Chile y otras plantas procesan vidrio para crear nuevos envases. Es uno de los materiales más amigables con el medio ambiente.",
    recyclingProcess:
      "El vidrio se recolecta, separa por colores (transparente, verde, ámbar), se limpia y tritura en un material llamado calcín. El calcín se funde a 1,500 grados C junto con materia prima virgen para fabricar nuevos envases. Usar calcín reduce la temperatura necesaria, ahorrando energía.",
    tips: [
      "Enjuaga los envases de vidrio antes de depositarlos en el contenedor",
      "Separa por color si tu punto limpio lo permite: transparente, verde y ámbar",
      "No mezcles con cerámica, porcelana o vidrio de ventana (tienen diferente composición)",
      "Las tapas metálicas se reciclan por separado como metal",
    ],
    funFact:
      "El vidrio puede reciclarse infinitas veces sin perder propiedades. Una botella de vidrio que se recicla hoy puede volver a estar en la estantería en solo 30 días.",
    keywords: [
      "reciclar vidrio Chile",
      "reciclaje vidrio botellas",
      "vidrio reciclado",
      "dónde reciclar vidrio",
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
        question: "¿El vidrio realmente se recicla infinitas veces?",
        answer:
          "Sí. A diferencia de otros materiales, el vidrio no pierde calidad ni propiedades al reciclarse. Cada vez que se funde y moldea, el resultado es idéntico al vidrio virgen.",
      },
      {
        question: "¿Qué tipos de vidrio NO se pueden reciclar?",
        answer:
          "No se reciclan vidrios de ventanas, espejos, cerámica, porcelana, cristal de plomo ni vidrio pyrex, ya que tienen diferente composición química y punto de fusión.",
      },
      {
        question: "¿Por qué es importante separar el vidrio por colores?",
        answer:
          "La separación por color (transparente, verde, ámbar) permite producir vidrio reciclado de mayor calidad. El vidrio de color contamina el transparente, reduciendo su valor comercial.",
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
      "El aluminio es el material con mayor ahorro de CO₂ al reciclarse. Reciclar una lata de aluminio ahorra el 95% de la energía necesaria para producir aluminio virgen. En Chile, las latas de bebidas son la principal fuente de aluminio reciclable.",
    recyclingProcess:
      "Las latas y otros productos de aluminio se recolectan, compactan y transportan a fundiciones. Allí se trituran, eliminan las lacas y pinturas, y se funden a 660 grados C. El aluminio líquido se moldea en lingotes que la industria usa para fabricar nuevas latas, piezas automotrices y materiales de construcción.",
    tips: [
      "Aplasta las latas para ahorrar espacio y facilitar el transporte",
      "No es necesario lavar las latas, pero elimina restos grandes de comida",
      "Separa las latas de aluminio de las de acero usando un imán (el aluminio no es magnético)",
      "Incluye papel aluminio limpio, bandejas de aluminio y aerosoles vacíos",
    ],
    funFact:
      "Reciclar una sola lata de aluminio ahorra energía suficiente para hacer funcionar un televisor durante 3 horas. El aluminio reciclado requiere solo el 5% de la energía del aluminio virgen.",
    keywords: [
      "reciclar aluminio Chile",
      "reciclaje latas aluminio",
      "aluminio reciclado",
      "dónde reciclar latas",
      "reciclaje aluminio empresa",
      "impacto CO₂ aluminio",
      "precio aluminio reciclado Chile",
      "latas aluminio reciclaje",
      "ahorro energía aluminio reciclado",
      "certificado reciclaje aluminio",
      "aluminio vs acero reciclaje",
    ],
    category: "Metal",
    faqs: [
      {
        question: "¿Por qué el aluminio es tan importante de reciclar?",
        answer:
          "El aluminio es el campeón del reciclaje: reciclarlo ahorra el 95% de la energía y evita 9.1 kg de CO₂ por cada kilo reciclado. Es el material con mayor impacto positivo por kilogramo.",
      },
      {
        question: "¿Cómo diferenciar latas de aluminio de latas de acero?",
        answer:
          "Usa un imán: el aluminio NO se pega al imán, mientras que el acero sí. Las latas de bebidas son generalmente de aluminio, y las de conservas suelen ser de acero.",
      },
      {
        question: "¿Se puede reciclar el papel aluminio?",
        answer:
          "Sí, siempre que esté limpio. Junta varias piezas pequeñas en una bola del tamaño de un puño para que no se pierdan en el proceso de clasificación.",
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
      "El reciclaje de papel es esencial para reducir la deforestación y el consumo de agua en Chile. Incluye papel de oficina, periódicos, revistas y papel blanco. La industria papelera chilena es líder en Latinoamérica en tasas de reciclaje.",
    recyclingProcess:
      "El papel se recolecta, clasifica por tipo y calidad, y se lleva a plantas recicladoras. Allí se mezcla con agua para crear pulpa, se eliminan tintas mediante destintado, y se procesan nuevas hojas o rollos. El papel de oficina blanco tiene mayor valor por su fibra de calidad.",
    tips: [
      "Separa el papel blanco del papel de color, periódico y revistas",
      "No recicles papel plastificado, papel carbón ni papel higiénico",
      "Retira clips, grapas y ventanas plásticas de los sobres",
      "Mantén el papel seco y limpio para maximizar su valor de reciclaje",
    ],
    funFact:
      "Reciclar una tonelada de papel salva 17 árboles, ahorra 26,000 litros de agua, 4,000 kWh de electricidad y evita 2.5 metros cúbicos de espacio en vertedero.",
    keywords: [
      "reciclar papel Chile",
      "reciclaje papel oficina",
      "papel reciclado",
      "dónde reciclar papel",
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
        question: "¿Qué tipos de papel se pueden reciclar?",
        answer:
          "Se reciclan papel de oficina, periódicos, revistas, folletos, cuadernos y papel kraft. No se reciclan papel higiénico, servilletas usadas, papel encerado ni papel plastificado.",
      },
      {
        question: "¿El papel con tinta se puede reciclar?",
        answer:
          "Sí. El proceso de destintado en las plantas recicladoras elimina la tinta. Solo el papel impreso con tintas especiales o plastificado no es apto.",
      },
      {
        question: "¿Cuántas veces se puede reciclar el papel?",
        answer:
          "Las fibras de papel se pueden reciclar entre 5 y 7 veces. Cada ciclo acorta las fibras, por lo que eventualmente se usan para productos de menor calidad como cartón o papel higiénico reciclado.",
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
      "El acero es el metal más reciclado del mundo. En Chile se encuentra en latas de conserva, electrodomésticos, estructuras y vehículos. Reciclarlo reduce significativamente el consumo de mineral de hierro y energía.",
    recyclingProcess:
      "El acero se recolecta, separa magnéticamente de otros materiales, compacta y transporta a fundiciones. Se funde en hornos de arco eléctrico a más de 1,500 grados C y se moldea en nuevos productos. El proceso es más eficiente energéticamente que la producción desde mineral de hierro.",
    tips: [
      "Usa un imán para identificar latas de acero: el acero es magnético",
      "Enjuaga las latas de conserva antes de reciclar",
      "Incluye tapas de frascos metálicas, clavos y tornillos",
      "Consulta si tu gestor acepta chatarra de mayor tamaño como electrodomésticos",
    ],
    funFact:
      "El acero es 100% reciclable y puede reciclarse infinitamente sin perder sus propiedades. Actualmente, el 30% del acero mundial proviene de material reciclado.",
    keywords: [
      "reciclar acero Chile",
      "reciclaje latas conserva",
      "acero reciclado",
      "chatarra acero reciclaje",
      "dónde reciclar acero",
      "latas acero reciclaje",
      "reciclaje metales Chile",
      "impacto ambiental acero",
      "certificado reciclaje acero",
      "acero vs aluminio reciclaje",
    ],
    category: "Metal",
    faqs: [
      {
        question: "¿Cómo diferenciar latas de acero de aluminio?",
        answer:
          "Aplica un imán: las latas de acero son magnéticas y se pegan, las de aluminio no. Las latas de conservas son generalmente acero, las de bebidas son aluminio.",
      },
      {
        question: "¿Se pueden reciclar electrodomésticos de acero?",
        answer:
          "Sí. Los electrodomésticos grandes (línea blanca) contienen acero reciclable. Contacta a un gestor autorizado o lleva a un punto limpio que acepte RAE (residuos de aparatos eléctricos).",
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
      "La industria textil es una de las más contaminantes del mundo. En Chile, el desierto de Atacama recibe toneladas de ropa desechada. Reciclar textiles evita una enorme cantidad de CO₂ y reduce la demanda de fibras vírgenes.",
    recyclingProcess:
      "Los textiles se clasifican por tipo de fibra y estado. La ropa en buen estado se destina a reutilización. Los textiles no reutilizables se trituran mecánicamente para obtener fibras que se usan en aislantes, trapos industriales o nuevos hilos. El reciclaje químico disuelve fibras sintéticas para crear material virgen.",
    tips: [
      "Dona ropa en buen estado antes de enviarla a reciclaje",
      "Separa por tipo de fibra si es posible: algodón, poliéster, lana",
      "Incluye sábanas, cortinas, toallas y otros textiles del hogar",
      "Busca puntos de recolección de ropa en supermercados y tiendas de moda",
    ],
    funFact:
      "Fabricar una sola camiseta de algodón requiere 2,700 litros de agua. Reciclar textiles evita 3.5 kg de CO₂ por cada kilogramo, uno de los mayores ahorros entre todos los materiales.",
    keywords: [
      "reciclar ropa Chile",
      "reciclaje textil",
      "ropa usada reciclaje",
      "dónde reciclar ropa Chile",
      "textil reciclado",
      "impacto ambiental moda",
      "fast fashion reciclaje",
      "reciclaje fibras textiles",
      "ropa Atacama reciclaje",
      "economía circular textil",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Dónde puedo llevar ropa usada en Chile?",
        answer:
          "Puedes llevar ropa a tiendas con programas de recolección (H&M, Zara), puntos limpios municipales, organizaciones como Ropa Amiga o contenedores de ropa en supermercados.",
      },
      {
        question: "¿Qué pasa con la ropa que se desecha en el desierto de Atacama?",
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
      "Los envases TetraPak están compuestos de cartón (75%), polietileno (20%) y aluminio (5%). Aunque son más complejos de reciclar que un solo material, en Chile ya existen plantas capaces de separar y reciclar sus componentes.",
    recyclingProcess:
      "Los envases se abren, enjuagan y envían a plantas especializadas. Allí se sumergen en agua para separar las capas: la fibra de cartón se usa para fabricar papel y cartón reciclado. Las capas de plástico y aluminio (polialuminio) se procesan para crear placas de techos, muebles o ladrillos ecológicos.",
    tips: [
      "Enjuaga los envases y ábrelos completamente para facilitar el secado",
      "Aplanalos para reducir volumen",
      "No retires la tapita plástica, se recicla junto con el envase",
      "Busca puntos de recolección específicos para TetraPak en tu comuna",
    ],
    funFact:
      "Del reciclaje del polialuminio de TetraPak se fabrican placas de techo, maceteros y mobiliario urbano. Un solo envase de 1 litro contiene suficiente cartón para fabricar una hoja de papel A4.",
    keywords: [
      "reciclar tetrapak Chile",
      "reciclaje tetra pak",
      "envases tetrapak reciclaje",
      "dónde reciclar tetrapak",
      "tetra pak reciclado",
      "leche caja reciclaje",
      "envase multicapa reciclaje",
      "polialuminio reciclaje",
      "cartón bebidas reciclaje",
      "tetrapak punto limpio Chile",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Se puede reciclar TetraPak en Chile?",
        answer:
          "Sí. Aunque son envases multicapa, en Chile existen puntos de recolección y plantas que separan el cartón del polialuminio. Consulta el mapa de puntos limpios de tu municipio.",
      },
      {
        question: "¿Hay que enjuagar los TetraPak antes de reciclar?",
        answer:
          "Sí. Enjuágalos con poca agua, ábrelos completamente y aplanalos. Esto evita malos olores y facilita el proceso de reciclaje.",
      },
    ],
  },

  {
    slug: "electronicos",
    name: "Electrónicos (RAEE)",
    materialKey: "Electronicos",
    co2Factor: DEFAULT_CO2_FACTORS["Electronicos"],
    waterFactor: DEFAULT_WATER_FACTORS["Electronicos"],
    description:
      "Los residuos de aparatos eléctricos y electrónicos (RAEE) contienen metales valiosos como oro, plata, cobre y tierras raras, pero también sustancias tóxicas. Su correcto reciclaje es obligatorio en Chile bajo la Ley REP.",
    recyclingProcess:
      "Los RAEE se desmontan manualmente para separar componentes reutilizables. Los circuitos impresos se envían a plantas de refinación para recuperar metales preciosos. Los plásticos, vidrio y metales se procesan por separado. Las sustancias peligrosas como mercurio y plomo se tratan de forma segura.",
    tips: [
      "Nunca deseches electrónicos en la basura común por los componentes tóxicos",
      "Borra tus datos personales antes de entregar dispositivos a reciclaje",
      "Busca campañas de recolección de RAEE en tu municipio",
      "Considera donar equipos funcionales antes de reciclar",
    ],
    funFact:
      "Una tonelada de celulares contiene más oro que una tonelada de mineral de mina de oro. Recuperar metales preciosos de electrónica reciclada es 13 veces más eficiente que la minería tradicional.",
    keywords: [
      "reciclar electrónicos Chile",
      "reciclaje RAEE",
      "residuos electrónicos reciclaje",
      "dónde reciclar celulares Chile",
      "reciclaje computadores",
      "RAEE Chile Ley REP",
      "reciclar electrodomésticos",
      "basura electrónica Chile",
      "e-waste reciclaje",
      "metales preciosos electrónica",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Dónde reciclar electrónicos en Chile?",
        answer:
          "Puedes llevarlos a puntos limpios municipales, campañas de recolección de RAEE, tiendas de tecnología con programas de retorno, o contactar gestores autorizados por el Ministerio del Medio Ambiente.",
      },
      {
        question: "¿Qué electrónicos se pueden reciclar?",
        answer:
          "Celulares, computadores, tablets, televisores, impresoras, microondas, refrigeradores y prácticamente cualquier aparato eléctrico o electrónico. La Ley REP cubre 6 categorías de RAEE.",
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
      "El aceite de cocina usado es altamente contaminante si se vierte por el desagüe: un litro contamina hasta 1,000 litros de agua. En Chile, se recicla para producir biodiésel y otros productos químicos.",
    recyclingProcess:
      "El aceite usado se recolecta, filtra para eliminar residuos sólidos y se somete a un proceso de transesterificación para convertirlo en biodiésel. También puede usarse para fabricar jabones, lubricantes industriales y velas. Empresas como Bioils en Chile procesan aceite usado a escala industrial.",
    tips: [
      "Deja enfriar el aceite completamente antes de almacenarlo",
      "Fíltralo con un colador para retirar restos de comida",
      "Guarda en botellas plásticas con tapa para su recolección",
      "Nunca lo viertas por el lavaplatos, inodoro o alcantarillado",
    ],
    funFact:
      "Un litro de aceite usado puede contaminar hasta 1,000 litros de agua potable. Pero al reciclarlo, ese mismo litro produce 0.9 litros de biodiésel que reduce emisiones un 80% comparado con diésel fósil.",
    keywords: [
      "reciclar aceite cocina Chile",
      "reciclaje aceite vegetal usado",
      "dónde reciclar aceite cocina",
      "aceite usado biodiésel",
      "aceite cocina contaminación agua",
      "reciclar aceite restaurante",
      "aceite vegetal punto limpio",
      "biodiésel aceite reciclado Chile",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Por qué no debo botar aceite por el lavaplatos?",
        answer:
          "El aceite se solidifica en las tuberías causando atascos. Además, un litro contamina hasta 1,000 litros de agua, dificultando el tratamiento en plantas depuradoras.",
      },
      {
        question: "¿Cómo almacenar aceite usado para reciclaje?",
        answer:
          "Déjalo enfriar, fíltralo y guárdalo en botellas plásticas con tapa. Cuando tengas suficiente, llévalo a un punto limpio o contacta un gestor de aceites usados.",
      },
    ],
  },

  // ── SECONDARY MATERIALS (shorter content) ──

  {
    slug: "plastico-hdpe",
    name: "Plástico HDPE",
    materialKey: "Plastico HDPE",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico HDPE"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico HDPE"],
    description:
      "El HDPE (polietileno de alta densidad) se encuentra en envases de detergente, shampoo, leche y bolsas plásticas gruesas. Es el plástico número 2 y uno de los más fáciles de reciclar.",
    recyclingProcess:
      "Los envases HDPE se recolectan, lavan, trituran y funden para crear pellets. Estos se usan para fabricar tuberías, mobiliario urbano, contenedores y nuevos envases.",
    tips: [
      "Identifica el símbolo triangular con número 2",
      "Enjuaga los envases de detergente y shampoo",
      "Las tapas de botellas PET son frecuentemente HDPE",
    ],
    funFact:
      "Los envases HDPE reciclados se usan para fabricar bancas de parques, juegos infantiles y tuberías de riego agrícola en Chile.",
    keywords: [
      "reciclar HDPE Chile",
      "plástico número 2 reciclaje",
      "envases HDPE reciclaje",
      "polietileno alta densidad reciclar",
      "HDPE reciclado",
      "botellas detergente reciclar",
      "plástico HDPE punto limpio",
      "reciclaje plástico HDPE empresa",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "¿Qué productos están hechos de HDPE?",
        answer:
          "Envases de detergente, shampoo, leche, aceite, bolsas plásticas gruesas y bidones. Se identifica con el número 2 dentro del triángulo de reciclaje.",
      },
    ],
  },

  {
    slug: "plastico-ldpe",
    name: "Plástico LDPE",
    materialKey: "Plastico LDPE",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico LDPE"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico LDPE"],
    description:
      "El LDPE (polietileno de baja densidad) se usa en bolsas plásticas flexibles, film de embalaje y envolturas. Es el plástico número 4 y su reciclaje es menos común pero igualmente importante.",
    recyclingProcess:
      "El LDPE se recolecta, lava, funde y transforma en pellets para fabricar nuevas bolsas, film agrícola, tuberías flexibles y madera plástica.",
    tips: [
      "Junta varias bolsas plásticas en una sola para facilitar la recolección",
      "Lleva film stretch y burbujas de embalaje al punto limpio",
      "Busca el número 4 en el triángulo de reciclaje",
    ],
    funFact:
      "Las bolsas plásticas LDPE pueden reciclarse para crear madera plástica, un material que no se pudre y reemplaza la madera natural en bancas y cercos. También se usa en tuberías de riego.",
    keywords: [
      "reciclar LDPE Chile",
      "plástico número 4 reciclaje",
      "bolsas plásticas reciclaje",
      "LDPE reciclado",
      "film plástico reciclaje",
      "polietileno baja densidad",
      "reciclar bolsas plásticas Chile",
      "plástico LDPE punto limpio",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "¿Dónde puedo reciclar bolsas plásticas en Chile?",
        answer:
          "Algunos supermercados tienen contenedores para bolsas plásticas. También puedes llevarlas a puntos limpios que acepten plástico número 4 (LDPE).",
      },
    ],
  },

  {
    slug: "plastico-pp",
    name: "Plástico PP",
    materialKey: "Plastico PP",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico PP"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico PP"],
    description:
      "El polipropileno (PP) es el plástico número 5, presente en tapas de botellas, envases de yogur, tuppers y pajitas. Es resistente al calor y cada vez más reciclado en Chile.",
    recyclingProcess:
      "El PP se recolecta, lava, tritura y funde en pellets para fabricar piezas automotrices, muebles de jardín, contenedores y textiles no tejidos.",
    tips: [
      "Las tapas de botellas de agua y bebidas suelen ser PP",
      "Enjuaga envases de yogur y margarina antes de reciclar",
      "Busca el número 5 en el triángulo de reciclaje",
    ],
    funFact:
      "El PP reciclado es tan resistente que se usa para fabricar paragolpes de autos y cajas de herramientas industriales.",
    keywords: [
      "reciclar PP Chile",
      "plástico número 5 reciclaje",
      "polipropileno reciclaje",
      "PP reciclado",
      "envases yogur reciclar",
      "tapas botella reciclaje",
      "plástico PP punto limpio",
      "reciclaje polipropileno empresa",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "¿Se pueden reciclar las tapas de botellas?",
        answer:
          "Sí. Las tapas de botellas son generalmente PP (número 5) y se reciclan por separado. Retíralas de las botellas PET y deposítalas en el contenedor de plásticos.",
      },
    ],
  },

  {
    slug: "plastico-ps",
    name: "Plástico PS",
    materialKey: "Plastico PS",
    co2Factor: DEFAULT_CO2_FACTORS["Plastico PS"],
    waterFactor: DEFAULT_WATER_FACTORS["Plastico PS"],
    description:
      "El poliestireno (PS), incluyendo el plumavit (EPS), es el plástico número 6. Se usa en vasos desechables, bandejas de carne y embalaje. Es más difícil de reciclar pero no imposible.",
    recyclingProcess:
      "El PS se compacta (ocupa mucho volumen), tritura y funde para crear pellets. El plumavit se densifica con calor o solventes. Se transforma en marcos de cuadros, molduras decorativas y materiales de construcción.",
    tips: [
      "El plumavit limpio es reciclable, pero pocos puntos limpios lo aceptan",
      "Busca el número 6 en el triángulo de reciclaje",
      "Prefiere alternativas al plumavit cuando sea posible",
    ],
    funFact:
      "El plumavit está compuesto en un 98% de aire. Compactarlo reduce su volumen en 50 a 80 veces, haciéndolo viable para transporte y reciclaje.",
    keywords: [
      "reciclar plumavit Chile",
      "reciclaje poliestireno",
      "PS reciclado",
      "plumavit reciclaje",
      "plástico número 6",
      "reciclar vasos desechables",
      "poliestireno expandido reciclaje",
      "EPS reciclaje Chile",
    ],
    category: "Plastico",
    faqs: [
      {
        question: "¿Se puede reciclar el plumavit en Chile?",
        answer:
          "Sí, aunque es menos común. Busca puntos de recolección específicos para plumavit. Debe estar limpio y sin restos de comida o cinta adhesiva.",
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
      "La madera de pallets, embalajes y muebles puede reciclarse en Chile para fabricar tableros de partículas, biomasa energética o compost. Su correcto reciclaje evita la quema no controlada.",
    recyclingProcess:
      "La madera se recolecta, retira clavos y elementos metálicos, tritura en astillas y se usa para fabricar tableros aglomerados (MDF, MDP), biomasa para calderas o mulch para jardinería.",
    tips: [
      "No recicles madera tratada químicamente (CCA) o pintada con plomo",
      "Separa clavos y herrajes metálicos antes de entregar",
      "Los pallets en buen estado pueden reutilizarse directamente",
    ],
    funFact:
      "Un pallet de madera puede reutilizarse hasta 10 veces y al final de su vida útil se recicla en tableros de partículas o biomasa energética.",
    keywords: [
      "reciclar madera Chile",
      "reciclaje pallets",
      "madera reciclada",
      "biomasa madera reciclaje",
      "tableros partículas reciclaje",
      "residuos madera Chile",
      "madera construcción reciclaje",
      "pallets reutilizar reciclar",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Qué tipo de madera se puede reciclar?",
        answer:
          "Se recicla madera no tratada: pallets, cajas, muebles sin pintura tóxica y restos de construcción. No se recicla madera con tratamiento CCA, barnices tóxicos o contaminada con químicos.",
      },
    ],
  },

  {
    slug: "organico",
    name: "Residuos Orgánicos",
    materialKey: "Organico",
    co2Factor: DEFAULT_CO2_FACTORS["Organico"],
    waterFactor: DEFAULT_WATER_FACTORS["Organico"],
    description:
      "Los residuos orgánicos representan más del 50% de la basura domiciliaria en Chile. El compostaje y biodigestión evitan emisiones de metano en vertederos y generan abono natural para la agricultura.",
    recyclingProcess:
      "Los residuos orgánicos se compostan (descomposición aeróbica) o se procesan en biodigestores (anaeróbica) para generar biogás y digestato fértil. El compost resultante se usa como mejorador de suelos en agricultura y paisajismo.",
    tips: [
      "Separa restos de frutas, verduras, cáscaras de huevo y borra de café",
      "Evita carnes, lácteos y aceites en compostaje casero",
      "Tritura los residuos grandes para acelerar el compostaje",
    ],
    funFact:
      "Los residuos orgánicos en vertederos generan metano, un gas de efecto invernadero 28 veces más potente que el CO₂. Compostar elimina por completo esta emisión.",
    keywords: [
      "compostar Chile",
      "reciclaje orgánico",
      "compostaje residuos",
      "residuos orgánicos reciclaje",
      "compost casero Chile",
      "biodigestión residuos",
      "orgánico punto limpio",
      "abono orgánico reciclaje",
    ],
    category: "Organico",
    faqs: [
      {
        question: "¿Cómo empezar a compostar en casa?",
        answer:
          "Consigue una compostera o haz una con un recipiente con agujeros. Alterna capas verdes (restos de cocina) con capas secas (hojas, cartón). Mantén húmedo y revuelve semanalmente.",
      },
    ],
  },

  {
    slug: "neumaticos",
    name: "Neumáticos",
    materialKey: "Neumaticos",
    co2Factor: DEFAULT_CO2_FACTORS["Neumaticos"],
    waterFactor: DEFAULT_WATER_FACTORS["Neumaticos"],
    description:
      "Los neumáticos fuera de uso (NFU) son un residuo problemático en Chile. No se biodegradan y ocupan mucho espacio en vertederos. Su reciclaje produce caucho granulado para canchas, pavimentos y energía.",
    recyclingProcess:
      "Los neumáticos se trituran mecánicamente para separar caucho, acero y fibra textil. El caucho granulado se usa en canchas de pasto sintético, pavimentos de seguridad, asfalto modificado y como combustible alternativo en cementeras.",
    tips: [
      "Nunca quemes neumáticos: liberan gases altamente tóxicos",
      "Entrega los NFU en vulcanizaciones o puntos de recolección autorizados",
      "Los talleres están obligados a gestionar los neumáticos reemplazados",
    ],
    funFact:
      "El caucho de neumáticos reciclados se usa para crear las superficies de seguridad en parques infantiles y pistas de atletismo en todo Chile.",
    keywords: [
      "reciclar neumáticos Chile",
      "NFU reciclaje",
      "neumáticos fuera uso",
      "caucho granulado reciclaje",
      "dónde reciclar neumáticos",
      "neumáticos reciclados canchas",
      "Ley REP neumáticos Chile",
      "vulcanización reciclaje",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Dónde puedo llevar neumáticos usados en Chile?",
        answer:
          "Puedes dejarlos en vulcanizaciones autorizadas, puntos limpios municipales o contactar gestores de NFU. La Ley REP obliga a los productores a financiar su gestión.",
      },
    ],
  },

  {
    slug: "baterias",
    name: "Baterías",
    materialKey: "Baterias",
    co2Factor: DEFAULT_CO2_FACTORS["Baterias"],
    waterFactor: DEFAULT_WATER_FACTORS["Baterias"],
    description:
      "Las baterías contienen metales pesados como plomo, cadmio y litio que son altamente contaminantes. Su reciclaje es obligatorio en Chile y permite recuperar materiales valiosos de forma segura.",
    recyclingProcess:
      "Las baterías se clasifican por tipo (plomo-ácido, litio-ion, alcalinas), se desmontan y procesan para recuperar plomo, litio, cobalto y otros metales. Las baterías de plomo-ácido son las más recicladas, con tasas superiores al 95%.",
    tips: [
      "Nunca deseches baterías en la basura común",
      "Almacena baterías usadas en un recipiente seco, no metálico",
      "Las baterías de auto se entregan en talleres y distribuidores",
    ],
    funFact:
      "Las baterías de plomo-ácido son el producto de consumo más reciclado del mundo, con tasas de reciclaje superiores al 99% en países desarrollados.",
    keywords: [
      "reciclar baterías Chile",
      "reciclaje pilas baterías",
      "baterías litio reciclaje",
      "dónde reciclar pilas Chile",
      "baterías plomo reciclaje",
      "residuos peligrosos baterías",
      "baterías auto reciclaje",
      "pilas usadas punto limpio",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Dónde reciclar pilas y baterías en Chile?",
        answer:
          "Deposítalas en contenedores de pilas disponibles en supermercados, farmacias y puntos limpios. Las baterías de auto se entregan en talleres mecánicos o distribuidores de baterías.",
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
      "Los residuos de construcción y demolición (RCD) son el mayor flujo de residuos en Chile por volumen. Incluyen hormigón, ladrillos, cerámica y asfalto. Su reciclaje reduce la extracción de áridos naturales.",
    recyclingProcess:
      "Los escombros se clasifican, trituran y criban para obtener áridos reciclados. El hormigón triturado se usa como base de caminos, relleno estructural y sub-base de pavimentos. Los metales se separan magnéticamente para reciclaje aparte.",
    tips: [
      "Contrata servicios de retiro de escombros que certifiquen disposición legal",
      "Separa metales, madera y plásticos de los escombros de hormigón",
      "Los escombros no deben mezclarse con residuos peligrosos como asbesto",
    ],
    funFact:
      "En Chile se generan más de 7 millones de toneladas de residuos de construcción al año. Reciclarlos como áridos reduce la necesidad de explotar canteras y lechos de ríos.",
    keywords: [
      "reciclar escombros Chile",
      "RCD reciclaje",
      "residuos construcción reciclaje",
      "áridos reciclados",
      "escombros hormigón reciclaje",
      "dónde botar escombros legal",
      "gestión RCD Chile",
      "economía circular construcción",
    ],
    category: "Especial",
    faqs: [
      {
        question: "¿Es legal botar escombros en cualquier lugar?",
        answer:
          "No. En Chile está prohibido depositar escombros en sitios no autorizados. Debes contratar un servicio de retiro que los lleve a plantas de reciclaje o rellenos autorizados.",
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
  Plastico: "Plásticos",
  "Papel y Carton": "Papel y Cartón",
  Vidrio: "Vidrio",
  Metal: "Metales",
  Organico: "Orgánicos",
  Especial: "Materiales Especiales",
};
