const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFile = path.join(__dirname, '..', process.env.DB_FILE || 'database.sqlite');
const jsonDbFile = path.join(__dirname, '..', 'database.json');

let dbType = 'sqlite';
let sqliteDB = null;

// JSON DB Fallback implementation
const jsonDb = {
  users: [],
  modules: [],
  progress: [],
  exams: [],
  certificates: []
};

function loadJsonDb() {
  if (fs.existsSync(jsonDbFile)) {
    try {
      const data = fs.readFileSync(jsonDbFile, 'utf8');
      const parsed = JSON.parse(data);
      Object.assign(jsonDb, parsed);
    } catch (err) {
      console.error('Error reading JSON fallback DB:', err);
    }
  }
}

function saveJsonDb() {
  try {
    fs.writeFileSync(jsonDbFile, JSON.stringify(jsonDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON fallback DB:', err);
  }
}

// Seed data definition
const seedModules = [
  {
    "id": 1,
    "titulo": "Módulo 1: Inocuidad alimentaria y BPM",
    "descripcion": "Inocuidad alimentaria y BPM Definición de alimento Todo producto natural o artificial, elaborado o no, que ingerido aporta al organismo huma...",
    "orden": 1,
    "tipo_recurso": "video",
    "contenido": "<h3>Inocuidad alimentaria y BPM</h3><h4>Definición de alimento</h4><p>Todo producto natural o artificial, elaborado o no, que ingerido aporta al organismo humano los nutrientes y la energía necesarios para el desarrollo de los procesos biológicos.</p><h4>Definición de calidad</h4><p>Calidad es el conjunto de propiedades y características inherentes de un producto o servicio que le dan la capacidad de satisfacer gustos, necesidades, preferencias según un parámetro y cumplir con sus requerimientos. También se define calidad como la percepción de un cliente hacia un producto o servicio por sus cualidades, respecto al grado de conformidad y satisfacción que se consigue.</p><h4>Definición de inocuidad</h4><p>Es la garantía de que los alimentos no causarán daño al consumidor cuando se preparen y consuman de acuerdo con el uso al que se destina. Resolución 2674 del 2013</p><h4>Diferencia entre calidad e inocuidad</h4><p>La calidad se relaciona con las características del producto que satisfacen al cliente, como sabor, apariencia y presentación, mientras que la inocuidad garantiza que el alimento sea seguro y no represente un riesgo para la salud. Ambos conceptos son fundamentales, pero la inocuidad es un requisito obligatorio para cualquier alimento.</p><h4>Importancia de la inocuidad alimentaria</h4><p>Los alimentos no inocuos socavan la seguridad alimentaria y la salud. Asegurar la inocuidad de los alimentos es esencial para promover la salud, los medios de vida, el comercio, el crecimiento económico y la prosperidad general.</p><p>Cada año, millones de personas enferman como consecuencia de alimentos no inocuos. Los grupos vulnerables, como los niños, las mujeres embarazadas y las personas de más edad corren mayor riesgo. FAO</p><h4>Definición de alimento contaminado</h4><p>Alimento que presenta o contiene agentes y/o sustancias extrañas de cualquier naturaleza en cantidades superiores a las permitidas en las normas nacionales, o en su defecto en normas reconocidas internacionalmente</p><h4>Clasificación de los alimentos según el riesgo para la salud pública</h4><ul><li><b>Alimento de mayor riesgo:</b> Alimento que, en razón a sus características de composición especialmente en sus contenidos de nutrientes, favorece el crecimiento microbiano y, por consiguiente, cualquier deficiencia en su proceso, manipulación, conservación, transporte, distribución y comercialización, puede ocasionar trastornos a la salud del consumidor. Ejemplo: Carne, pollo, lácteos, huevos, entre otros.</li></ul><ul><li><b>Alimento de riesgo medio:</b> Los alimentos que pueden contener microorganismos patógenos, pero normalmente no favorecen su crecimiento debido a las características del alimento o alimentos que es poco probable que contengan microorganismos patógenos debido al tipo de alimento o procesamiento del mismo, pero que pueden apoyar a la formación de toxinas o el crecimiento de microorganismos patógenos. Ejemplo: Mantequilla, enlatados, entre otros.</li><li><b>Alimento de menor riesgo:</b> Poseen menor riesgo de contaminación debido a su bajo contenido de Nutrientes, son más secos o más ácidos y por tanto tienen más resistencia y son más estables a T ambiente. Ejemplo: Galletas, cereales, pan, productos ácidos como el vinagre, mermelada, entre otros.</li></ul><h4>Definición de BPM</h4><p>Principios básicos y generales de higiene en la elaboración, preparación, elaboración, envasado, almacenamiento, transporte y distribución de alimentos para el consumo humano. Resolución 2674 del 2013.</p><h4>Definición de seguridad alimentaria</h4><p>Existe seguridad alimentaria cuando las personas tienen acceso a alimentos suficientes, seguros y nutritivos para su crecimiento, desarrollo y una vida activa y saludable.</p><p>“…El 28 % de la población mundial se enfrentó a una inseguridad alimentaria moderada o grave en 2024. Los niveles de hambre y de inseguridad alimentaria mejoraron en algunas partes de América del Sur y Asia, pero empeoraron en África.” FAO.</p>",
    "url_recurso": "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    "id": 2,
    "titulo": "Módulo 2: Higiene del personal manipulador",
    "descripcion": "Higiene del personal manipulador Definición de manipulador de alimentos Es toda persona que está en contacto directo con el alimento durante...",
    "orden": 2,
    "tipo_recurso": "audio",
    "contenido": "<h3>Higiene del personal manipulador</h3><h4>Definición de manipulador de alimentos</h4><p>Es toda persona que está en contacto directo con el alimento durante todo el proceso de transformación del mismo y que puede influir en la inocuidad o calidad sanitaria.</p><p>“Las personas son el principal transporte gratis para los microorganismos”</p><h4>Estado de salud del manipulador de alimentos</h4><ul><li>El personal debe contar con buen estado de salud, no se permite con enfermedades infecciosas.</li><li>El personal debe contar con certificación médica para manipular alimentos, realizando exámenes periódicos 1 vez al año.</li><li>Realizar acciones correctivas y preventivas dependiendo de los exámenes de salud del personal.</li><li>La empresa deberá garantizar el seguimiento periódico de los exámenes médicos del personal manipulador.</li><li>Cuando se presenten enfermedades, heridas, tatuajes o demás, será responsabilidad del colaborador comunicar al jefe inmediato para tomar las medidas correspondientes.</li></ul><h4>Educación y capacitación del personal manipulador</h4><p>Según la resolución 2674 del 2013, se debe contar con un plan de capacitación anual de por lo menos 10 horas sobre temas relacionados con la resolución 2674 del 2013. Los capacitadores deben demostrar su idoneidad para capacitar, deben tener formación en el tema y experiencia relacionada con el campo de los alimentos.</p><h4>Prácticas higiénicas y medidas de protección</h4><p>Las prácticas higiénicas son fundamentales para garantizar la inocuidad de los alimentos y prevenir riesgos de contaminación. Todo manipulador debe mantener una adecuada higiene personal, realizar un correcto lavado de manos, utilizar la dotación de protección requerida y evitar conductas que puedan afectar la seguridad de los alimentos. Asimismo, es importante aplicar medidas de protección durante la preparación, almacenamiento y manipulación, con el fin de proteger la salud del consumidor y cumplir con las Buenas Prácticas de Manufactura (BPM).</p><ul><li>No hablar ni estornudar sobre los alimentos</li><li>Mantener un constante y correcto lavado de manos</li><li><b>Utilizar el uniforme que sea proporcionado por la organización en condiciones óptimas de limpieza:</b> Botas de seguridad, gorro, cubre barbas (cuando sea el caso), tapabocas, bata antifluido, entre otros.</li><li>Evitar joyas, accesorios como relojes, cadenas, aretes, manillas, piercings, entre otros.</li><li>No fumar ni comer en el lugar de trabajo.</li><li>Reportar heridas, cortadas, tatuajes.</li><li>Evitar olores fuertes tales como perfume.</li><li>Las uñas deben permanecer limpias, sin esmalte y cortas.</li><li>En el caso de las mujeres, no podrán portar maquillaje, cremas para el cuerpo, pestañas postizas, entre otros.</li></ul><h4>Lavado de manos</h4><p>El lavado de manos debe realizarse en diversas situaciones:</p><ul><li>Antes de comenzar a trabajar</li><li>Al ingresar a la planta de producción</li><li>Al cambiar de proceso</li><li>Al salir del baño</li><li>Al tocar cualquier elemento contaminado</li><li>Al tener contacto con utensilios sucios</li><li>Después de tocar cualquier parte del cuerpo que no esté limpia</li><li>Después de trabajar con alimentos crudos o alérgenos</li><li>Después de tocar elementos personales como el celular, loncheras, entre otros.</li></ul><p>El lavado constante de manos previene de enfermedades en la piel, ojos o demás.</p><p>Proceso correcto del lavado de manos:</p><p><b>1. Humedecer las manos con abundante agua</b></p><p><b>2. Enjabonar las manos con el grifo cerrado</b></p><p><b>3. Comenzar frotando las palmas entre ellas</b></p><p><b>4. Intercalar los dedos y frotar la palma y el anverso de la mano</b></p><p><b>5. Continuar con los dedos intercalados y limpiar los espacios entre sí.</b></p><p><b>6. Con las manos de frente, agarrarse los dedos y moverlos de lado a lado.</b></p><p><b>7. Tomar el dedo pulgar y limpiar la zona del agarre de la mano.</b></p><p><b>8. Limpiar las yemas de los dedos, frotando contra la palma de la mano.</b></p><p><b>9. Enjuagar las manos con abundante agua (8 seg aproximadamente)</b></p><p><b>10. Secar las manos con una toalla desechable.</b></p><p><b>11. Cerrar el grifo con la toalla desechable.</b></p><h4>Prácticas higiénicas de los visitantes</h4><ul><li>Todos los visitantes que deseen ingresar a las instalaciones deberán seguir todas las medidas de protección y sanitarias establecidas. No podrán ingresar con accesorios, olores fuertes y/o maquillaje.</li><li>Deben portar la vestimenta y dotación adecuada suministrada por la empresa (polainas, bata desechable, gorro desechable, cubre barba (si es el caso) y tapabocas).</li></ul>",
    "url_recurso": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    "id": 3,
    "titulo": "Módulo 3: Tipos de contaminación alimentaria",
    "descripcion": "Tipos de contaminación alimentaria Definición contaminación de los alimentos La contaminación de los alimentos es la presencia de agentes fí...",
    "orden": 3,
    "tipo_recurso": "imagen",
    "contenido": "<h3>Tipos de contaminación alimentaria</h3><h4>Definición contaminación de los alimentos</h4><p>La contaminación de los alimentos es la presencia de agentes físicos, químicos o biológicos que pueden alterar la inocuidad de un alimento y representar un riesgo para la salud del consumidor. Esta contaminación puede ocurrir durante la preparación, almacenamiento, transporte, manipulación o distribución de los alimentos debido a prácticas inadecuadas de higiene y manipulación. La contaminación de los mismos puede producirse en cualquier momento desde su cosecha, pasando por la elaboración a nivel industrial, hasta cuando se prepara la comida en el hogar.</p><h4>Definición de alérgenos</h4><p>Los alérgenos son sustancias presentes en ciertos alimentos que pueden provocar reacciones alérgicas en personas sensibles. Estas reacciones pueden variar desde síntomas leves hasta efectos graves que comprometen la salud del consumidor.</p><p>Los 14 alérgenos declarados son:</p><ul><li>Cereales que contienen gluten (trigo, centeno, cebada, avena, espelta, kamut o sus variedades híbridas)</li><li>Crustáceos y productos a base de crustáceos</li><li>Huevos y productos a base de huevo</li><li>Pescado y productos a base de pescado</li><li>Maní (cacahuate) y productos a base de maní</li><li>Soja y productos a base de soja</li><li>Leche y productos lácteos (incluida la lactosa)</li><li>Frutos de cáscara (almendras, avellanas, nueces, anacardos, pacanas, nuez de Brasil, pistachos y macadamias)</li><li>Apio y productos a base de apio</li><li>10. Mostaza y productos a base de mostaza</li><li>11. Granos de sésamo (ajonjolí) y productos a base de sésamo</li><li>12. Dióxido de azufre y sulfitos en concentraciones superiores a 10 mg/kg o 10 mg/L</li><li>13. Altramuces (lupino) y productos a base de altramuces</li><li>14. Moluscos y productos a base de moluscos</li></ul><h4>Contaminación física</h4><p>La contaminación física ocurre cuando cuerpos extraños o partículas ajenas al alimento entran en contacto con este, afectando su inocuidad y representando un riesgo para la salud del consumidor. Entre los contaminantes físicos más comunes se encuentran cabello, vidrio, plástico, metal, tierra, madera, piedras, uñas, joyas o fragmentos de utensilios y empaques.</p><p>Este tipo de contaminación generalmente se produce por malas prácticas de manipulación, deficiencias en limpieza, deterioro de equipos o incumplimiento de las medidas de higiene y protección durante el procesamiento y manejo de los alimentos.</p><h4>Contaminación química</h4><p>La contaminación química se presenta cuando sustancias químicas peligrosas entran en contacto con los alimentos, afectando su inocuidad y poniendo en riesgo la salud del consumidor. Este tipo de contaminación puede originarse por el uso inadecuado de productos de limpieza y desinfección, residuos de plaguicidas, jabones o desinfectantes mal enjuagados, lubricantes, metales pesados o sustancias tóxicas presentes en envases y superficies.</p><p>La contaminación química suele ocurrir por almacenamiento incorrecto de sustancias químicas, malas prácticas de manipulación o falta de control durante los procesos de limpieza y producción de alimentos.</p><h4>Contaminación biológica</h4><p>La contaminación biológica ocurre cuando microorganismos como bacterias, virus, hongos o parásitos contaminan los alimentos, pudiendo causar enfermedades transmitidas por alimentos (ETA). Este tipo de contaminación es una de las más comunes y peligrosas, ya que muchos microorganismos no alteran el olor, sabor o apariencia del alimento.</p><p>La contaminación biológica puede producirse por una mala higiene personal, manipulación inadecuada, contaminación cruzada, uso de agua no potable, temperaturas inadecuadas de conservación o deficiencias en limpieza y desinfección.</p><h4>Contaminación cruzada</h4><p>La contaminación cruzada ocurre cuando microorganismos, sustancias o cuerpos extraños se transfieren de un alimento, superficie, utensilio o persona hacia otro alimento, afectando su inocuidad. Generalmente sucede cuando alimentos crudos entran en contacto con alimentos listos para el consumo, o cuando no se realiza una adecuada limpieza y desinfección de manos, equipos y utensilios.</p><p>Este tipo de contaminación puede prevenirse mediante buenas prácticas de higiene, correcta separación de alimentos y adecuado manejo durante la preparación, almacenamiento y distribución.</p><p>La contaminación física, química, biológica y cruzada son los tipos de contaminación alimentaria que se pueden presentar en todas las industrias alimenticias. Sin embargo, puede ocurrir otro tipo de contaminación en algunas industrias que manejan productos alérgenos.</p><h4>Contaminación por alérgenos</h4><p>La contaminación por alérgenos ocurre cuando un alimento entra en contacto con sustancias capaces de generar reacciones alérgicas en personas sensibles. Esta contaminación puede producirse por contacto directo entre alimentos, uso compartido de utensilios, superficies o equipos, o por una inadecuada manipulación durante los procesos de preparación y almacenamiento.</p><p>Entre los alérgenos más comunes se encuentran leche, huevo, soya, maní, frutos secos, trigo, pescado y mariscos. La correcta identificación, separación y manejo de estos ingredientes es fundamental para prevenir riesgos en la salud del consumidor.</p>",
    "url_recurso": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 4,
    "titulo": "Módulo 4: Limpieza y desinfección",
    "descripcion": "Limpieza y desinfección Definición de limpieza La limpieza es el proceso mediante el cual se eliminan residuos visibles como grasa, suciedad...",
    "orden": 4,
    "tipo_recurso": "texto",
    "contenido": "<h3>Limpieza y desinfección</h3><h4>Definición de limpieza</h4><p>La limpieza es el proceso mediante el cual se eliminan residuos visibles como grasa, suciedad, restos de alimentos, polvo y otras impurezas presentes en superficies, equipos, utensilios y áreas de trabajo.</p><p>Este procedimiento es fundamental para mantener condiciones higiénicas adecuadas y facilitar la posterior desinfección, contribuyendo a la prevención de la contaminación de los alimentos.</p><h4>Definición de desinfección</h4><p>La desinfección es el proceso mediante el cual se eliminan o reducen los microorganismos presentes en superficies, equipos, utensilios y áreas de trabajo, mediante el uso de agentes químicos o métodos físicos autorizados.</p><p>Este procedimiento se realiza después de la limpieza y es fundamental para prevenir la contaminación de los alimentos y garantizar condiciones adecuadas de higiene e inocuidad.</p><h4>Diferencia entre limpieza y desinfección</h4><p>La limpieza y la desinfección son procesos complementarios, pero no significan lo mismo. La limpieza consiste en eliminar suciedad, grasa y residuos visibles de las superficies, mientras que la desinfección tiene como objetivo eliminar o reducir los microorganismos que pueden causar contaminación. Para lograr una adecuada inocuidad, primero debe realizarse la limpieza y posteriormente la desinfección.</p><p>Los pasos básicos de limpieza son:</p><ul><li>Retirar residuos, aplicar detergente y enjuagar con agua.</li><li>Mantener limpias todas las áreas y superficies del lugar de trabajo, así como los equipos y utensilios que tienen contacto con los alimentos.</li><li>Mantener los productos de aseo almacenados en un lugar exclusivo bajo llave, los cuales deben mantener identificados con su respectiva dosificación.</li><li>No se deben mezclar productos químicos debido a que pueden generar olores tóxicos o nocivos para la salud.</li><li>Cada persona debe ser responsable de limpiar y desinfectar correctamente su área de trabajo al terminar la jornada.</li></ul><h4>Tipos de desinfección</h4><ul><li><b>Desinfección por inmersión:</b> La desinfección por inmersión es un método mediante el cual utensilios, equipos o elementos de manipulación se sumergen completamente en una solución desinfectante durante un tiempo determinado, con el fin de eliminar o reducir los microorganismos presentes en sus superficies.</li></ul><p>Este procedimiento debe realizarse utilizando productos autorizados, concentraciones adecuadas y respetando los tiempos de contacto recomendados para garantizar una correcta desinfección y prevenir la contaminación de los alimentos.</p><ul><li><b>Desinfección por aspersión:</b> La desinfección por aspersión es un método que consiste en aplicar una solución desinfectante sobre superficies, equipos o utensilios mediante pulverización o rociado, con el fin de eliminar o reducir los microorganismos presentes.</li></ul><p>Para garantizar su efectividad, es importante que las superficies se encuentren previamente limpias y que el desinfectante utilizado permanezca el tiempo de contacto recomendado según las indicaciones del fabricante.</p><ul><li><b>Desinfección manual:</b> La desinfección manual es un método mediante el cual se aplica una solución desinfectante sobre superficies, equipos o utensilios utilizando elementos como paños, cepillos o esponjas limpias, con el fin de eliminar o reducir los microorganismos presentes.</li></ul><p>Este procedimiento debe realizarse después de la limpieza y respetando las concentraciones y tiempos de contacto recomendados para garantizar una adecuada inocuidad de los alimentos.</p><h4>Métodos para desinfectar</h4><ul><li><b>Calor:</b> La desinfección por calor es un método que utiliza altas temperaturas, como agua caliente o vapor, para eliminar o reducir los microorganismos presentes en utensilios, equipos y superficies. Este procedimiento ayuda a garantizar condiciones higiénicas adecuadas y es ampliamente utilizado en procesos de manipulación de alimentos debido a su efectividad para disminuir la carga microbiana.</li><li><b>Desinfección por productos químicos:</b> La desinfección por productos químicos es un método que consiste en utilizar sustancias desinfectantes autorizadas para eliminar o reducir los microorganismos presentes en superficies, equipos, utensilios y áreas de trabajo. Estos productos deben aplicarse en las concentraciones y tiempos de contacto recomendados para garantizar su efectividad y evitar riesgos de contaminación en los alimentos.</li></ul><h4>Tipos de productos químicos</h4><p>Entre los más utilizados se encuentran:</p><ul><li>Hipoclorito de sodio (cloro)</li><li>Amonios cuaternarios</li><li>Alcohol</li><li>Yodo y compuestos yodados</li><li>Peróxido de hidrógeno</li><li>Ácido peracético</li></ul><p>La selección del desinfectante dependerá del tipo de superficie, el nivel de contaminación y las necesidades del proceso de manipulación de alimentos.</p>",
    "url_recurso": ""
  },
  {
    "id": 5,
    "titulo": "Módulo 5: Agua potable y control de plagas",
    "descripcion": "Agua potable y control de plagas El agua potable es aquella que cumple con las condiciones físicas, químicas y microbiológicas aptas para el...",
    "orden": 5,
    "tipo_recurso": "video",
    "contenido": "<h3>Agua potable y control de plagas</h3><p>El agua potable es aquella que cumple con las condiciones físicas, químicas y microbiológicas aptas para el consumo humano y para su uso seguro en la preparación, limpieza y manipulación de alimentos.</p><p>El agua potable es fundamental en los procesos de manipulación de alimentos, ya que se utiliza para la preparación de productos, lavado de materias primas, limpieza de utensilios, equipos, superficies y aseo personal. El uso de agua contaminada puede convertirse en una fuente de contaminación biológica, química o física, afectando la inocuidad de los alimentos y poniendo en riesgo la salud del consumidor.</p><h4>Usos del agua potable en la manipulación de alimentos</h4><ul><li>Lavado de manos.</li><li>Lavado y desinfección de frutas y verduras.</li><li>Limpieza y desinfección de equipos y utensilios.</li><li>Preparación de alimentos y bebidas.</li><li>Producción de hielo y vapor.</li><li>Limpieza de instalaciones y superficies.</li></ul><h4>Riesgos de utilizar agua contaminada o no potable</h4><p>El uso de agua no potable en la manipulación de alimentos representa un riesgo importante para la inocuidad, ya que puede convertirse en una fuente de contaminación física, química y biológica. El agua contaminada puede contener microorganismos patógenos, sustancias químicas o partículas extrañas capaces de alterar la calidad de los alimentos y causar enfermedades transmitidas por alimentos (ETA).</p><p>Además, el uso de agua no potable durante la limpieza, preparación, lavado de materias primas o higiene del personal puede favorecer la contaminación cruzada y la proliferación de microorganismos, afectando la seguridad de los productos y poniendo en riesgo la salud del consumidor.</p><h4>Medidas de control del agua potable</h4><p>Las industrias de alimentos implementan diferentes controles para garantizar que el agua utilizada durante los procesos sea potable y segura. Entre las principales medidas se encuentran la limpieza y desinfección periódica de tanques de almacenamiento, el mantenimiento preventivo de tuberías y conexiones, y la realización de análisis físicos, químicos y microbiológicos para verificar la calidad del agua.</p><p>Así mismo, se controlan las condiciones de almacenamiento y distribución del agua dentro de las instalaciones, evitando posibles fuentes de contaminación. Estos controles permiten asegurar que el agua utilizada en la preparación, limpieza y manipulación de alimentos cumpla con las condiciones sanitarias necesarias para proteger la inocuidad y la salud del consumidor.</p><h4>Control de plagas</h4><h4>Definición de plagas</h4><p>Las plagas son organismos como insectos, roedores, aves u otros animales que pueden ingresar a las áreas de manipulación de alimentos y representar un riesgo para la inocuidad, ya que tienen la capacidad de contaminar alimentos, superficies, equipos y utensilios.</p><p>La presencia de plagas puede favorecer la transmisión de enfermedades, generar contaminación física y biológica, y afectar las condiciones higiénico-sanitarias de los establecimientos de alimentos.</p><h4>Importancia del control de plagas</h4><p>El control de plagas es fundamental para prevenir la contaminación de los alimentos y mantener condiciones higiénicas adecuadas dentro de las áreas de almacenamiento, preparación y manipulación.</p><p>Las plagas pueden:</p><ul><li>Transmitir enfermedades.</li><li>Contaminar superficies y alimentos.</li><li>Deteriorar materias primas y empaques.</li><li>Generar pérdidas económicas.</li><li>Afectar la imagen del establecimiento.</li></ul><h4>Plagas más comunes en la industria alimentaria</h4><ul><li>Moscas</li><li>Cucarachas</li><li>Hormigas</li><li>Roedores</li><li>Aves</li><li>Gorgojos y otros insectos de almacenamiento</li></ul><h4>Manejo integrado de plagas</h4><p>Es fundamental mantener un adecuado control sobre las materias primas, empaques y áreas de almacenamiento, verificando continuamente su estado higiénico y evitando condiciones que favorezcan la presencia de plagas. Asimismo, deben cumplirse de manera permanente los programas de limpieza y desinfección establecidos, con el fin de conservar ambientes limpios, seguros y aptos para la manipulación de alimentos.</p><h4>Medidas preventivas para el control de plagas</h4><ul><li>Mantener orden y limpieza.</li><li>Disponer adecuadamente los residuos.</li><li>Mantener recipientes de basura tapados.</li><li>Evitar acumulación de agua.</li><li>Sellar grietas, huecos y entradas.</li><li>Almacenar alimentos protegidos y separados del piso.</li><li>Mantener puertas y ventanas protegidas.</li><li>Realizar inspecciones periódicas.</li></ul><p>Los manipuladores deberán comunicar al área encargada de cualquier avistamiento de plagas, roedores o demás insectos que puedan afectar la inocuidad del proceso o producto.</p>",
    "url_recurso": "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    "id": 6,
    "titulo": "Módulo 6: Enfermedades transmitidas por alimentos (ETA)",
    "descripcion": "Enfermedades transmitidas por alimentos (ETA) Las Enfermedades Transmitidas por Alimentos (ETA), se definen como el síndrome originado por l...",
    "orden": 6,
    "tipo_recurso": "audio",
    "contenido": "<h3>Enfermedades transmitidas por alimentos (ETA)</h3><p>Las Enfermedades Transmitidas por Alimentos (ETA), se definen como el síndrome originado por la ingestión de alimentos y/o agua, que contengan agentes etiológicos, en cantidades suficientes, que afecten la salud del consumidor a nivel individual o colectivo.</p><p>Por otra parte, las enfermedades relacionadas con el consumo de agua son aquellas producidas por el agua contaminada con desechos humanos, animales o químicos. Se consideran enfermedades transmitidas por el agua el cólera, la fiebre tifoidea, la disentería, la poliomielitis, la meningitis y las hepatitis A y E.</p><h4>Infección alimentaria</h4><p>La infección alimentaria ocurre cuando una persona consume alimentos o agua contaminados con microorganismos patógenos vivos, como bacterias, virus o parásitos, que ingresan al organismo y se multiplican, causando enfermedad. Generalmente, las infecciones alimentarias se producen por malas prácticas de higiene, contaminación cruzada o consumo de alimentos mal cocidos o contaminados.</p><h4>Intoxicación alimentaria</h4><p>La intoxicación alimentaria se presenta cuando una persona consume alimentos que contienen toxinas o sustancias tóxicas producidas por microorganismos, sustancias químicas o contaminantes presentes en el alimento.</p><p>En este caso, la enfermedad no es causada por el microorganismo vivo, sino por las toxinas presentes en el alimento contaminado.</p><h4>Factores que contribuyen a la formación de una ETA</h4><p>Las Enfermedades Transmitidas por Alimentos (ETA) pueden originarse por diferentes factores relacionados con una inadecuada manipulación y conservación de los alimentos. Entre las principales causas se encuentran la mala higiene personal de los manipuladores, el uso de agua no potable, la contaminación cruzada, la limpieza y desinfección insuficiente de equipos y utensilios, y la presencia de plagas en las áreas de almacenamiento o preparación.</p><p>Asimismo, las temperaturas inadecuadas de conservación, la cocción insuficiente, el almacenamiento incorrecto de materias primas y el consumo de alimentos contaminados favorecen la proliferación de microorganismos capaces de causar enfermedades y afectar la salud del consumidor.</p><p>Para que ocurra una ETA, existen factores adicionales a la presencia del agente etiológico o su(s) toxina(s) como:</p><ul><li>El alimento debe estar bajo características físicas (temperatura, humedad, tiempo) que favorezcan el crecimiento del microorganismo o la producción de su toxina.</li><li>El agente etiológico debe estar presente en cantidad suficiente, para causar la infección o la intoxicación.</li><li>Debe ingerirse una cantidad (porción) suficiente del alimento que contenga el microorganismo o agente etiológico, que sobrepase la barrera de protección de la persona.</li></ul><h4>Síntomas de una ETA</h4><p>Los síntomas dependerán del agente etiológico y del órgano que afecte a la persona.  La manifestación clínica más común de una enfermedad transmitida por los alimentos consiste en la aparición de síntomas gastrointestinales (náuseas, vómitos, calambres estomacales y diarrea), pero estas enfermedades también pueden dar lugar a síntomas neurológicos, ginecológicos, inmunológicos y de otro tipo.</p><h4>Enfermedades más comunes trasmitidas por alimentos</h4><ul><li><b>Salmonelosis:</b> Enfermedad causada por bacterias del género Salmonella, generalmente asociada al consumo de alimentos contaminados como carnes, huevos, pollo, leche o agua no potable. Puede causar diarrea, fiebre, vómito y dolor abdominal.</li><li><b>Escherichia coli (E. coli):</b> Enfermedad producida por ciertas cepas de la bacteria Escherichia coli, relacionada con alimentos contaminados, mala higiene o cocción insuficiente. Sus síntomas incluyen diarrea, dolor abdominal y vómito.</li><li>Listeriosis Infección causada por la bacteria Listeria monocytogenes, presente en alimentos contaminados o mal refrigerados. Puede afectar especialmente a mujeres embarazadas, adultos mayores y personas con defensas bajas.</li><li>Botulismo Enfermedad grave causada por toxinas producidas por la bacteria Clostridium botulinum, comúnmente asociada a alimentos mal conservados o enlatados de manera inadecuada.</li><li><b>Intoxicación por Staphylococcus aureus:</b> Intoxicación causada por toxinas producidas por la bacteria Staphylococcus aureus, la cual puede contaminar alimentos debido a una mala higiene del manipulador. Sus síntomas suelen aparecer rápidamente e incluyen vómito, diarrea y dolor abdominal.</li></ul><h4>Medidas de prevención para evitar ETA</h4><p>La prevención de las Enfermedades Transmitidas por Alimentos (ETA) depende de la aplicación adecuada de prácticas higiénicas durante la preparación, almacenamiento y manipulación de los alimentos. Entre las principales medidas preventivas se encuentran:</p><ul><li>El correcto lavado de manos</li><li>El uso de agua potable</li><li>La limpieza y desinfección de superficies, equipos y utensilios.</li><li>La adecuada higiene personal de los manipuladores.</li></ul><p>Además, es fundamental evitar la contaminación cruzada, cocinar completamente los alimentos, conservarlos a temperaturas seguras, almacenar adecuadamente las materias primas y mantener un adecuado control de plagas. La correcta aplicación de estas medidas contribuye a garantizar la inocuidad de los alimentos y proteger la salud del consumidor.</p>",
    "url_recurso": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    "id": 7,
    "titulo": "Módulo 7: Manipulación segura y conservación de alimentos",
    "descripcion": "Manipulación segura y conservación de alimentos Definición de manipulación segura La adecuada manipulación de los alimentos es fundamental p...",
    "orden": 7,
    "tipo_recurso": "imagen",
    "contenido": "<h3>Manipulación segura y conservación de alimentos</h3><h4>Definición de manipulación segura</h4><p>La adecuada manipulación de los alimentos es fundamental para prevenir Enfermedades Transmitidas por Alimentos (ETA), evitar la proliferación de microorganismos y proteger la salud del consumidor. La aplicación de buenas prácticas durante todos los procesos ayuda a mantener la calidad e inocuidad de los productos.</p><h4>Lavado de frutas y verduras</h4><p>Las frutas y verduras deben lavarse y desinfectarse adecuadamente antes de su preparación o consumo para eliminar suciedad, residuos y posibles microorganismos contaminantes.</p><h4>Separación de los alimentos</h4><p>Los alimentos crudos deben mantenerse separados de los alimentos listos para el consumo para evitar contaminación cruzada.</p><h4>Conservación de los alimentos</h4><p>La conservación de alimentos consiste en aplicar condiciones y procedimientos adecuados para mantener la inocuidad, calidad y vida útil de los productos alimenticios durante su almacenamiento y distribución.</p><h4>Importancia de la conservación de los alimentos</h4><p>Una adecuada conservación permite disminuir el crecimiento de microorganismos, evitar el deterioro de los alimentos y reducir riesgos de contaminación.</p><h4>Métodos de conservación</h4><p>Refrigeración: La refrigeración consiste en mantener los alimentos a bajas temperaturas para disminuir la proliferación de microorganismos y conservar su calidad.</p><p>Congelación: La congelación permite conservar los alimentos durante períodos más prolongados mediante temperaturas inferiores a cero grados, reduciendo la actividad microbiana.</p><h4>Almacenamiento seguro de los alimentos</h4><ul><li>Mantener alimentos protegidos y tapados.</li><li>Separar alimentos crudos de cocidos.</li><li>Aplicar el método PEPS (Primero en Entrar, Primero en Salir).</li><li>Almacenar productos sobre estibas o superficies limpias.</li><li>Verificar fechas de vencimiento y estado de los productos.</li><li>Mantener áreas limpias, secas y organizadas.</li></ul><h4>Cadena de frío</h4><p>La cadena de frío es el mantenimiento continuo de temperaturas adecuadas durante el almacenamiento, transporte y distribución de alimentos refrigerados o congelados, con el fin de conservar su inocuidad y calidad.</p><p>La interrupción de la cadena de frío puede favorecer la proliferación de microorganismos y aumentar el riesgo de contaminación.</p>",
    "url_recurso": "https://images.unsplash.com/photo-1762329924239-e204f101fca4?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 8,
    "titulo": "Módulo 8: Normatividad sanitaria",
    "descripcion": "Normatividad sanitaria Resolución 2674 del 2013 Es la norma colombiana que establece los requisitos sanitarios para la fabricación, procesam...",
    "orden": 8,
    "tipo_recurso": "texto",
    "contenido": "<h3>Normatividad sanitaria</h3><h4>Resolución 2674 del 2013</h4><p>Es la norma colombiana que establece los requisitos sanitarios para la fabricación, procesamiento, almacenamiento, transporte y comercialización de alimentos. Su objetivo es proteger la salud pública y garantizar la inocuidad de los productos en toda la cadena alimentaria.</p><h4>Resolución 0810 del 2021</h4><p>Tiene por objeto establecer el reglamento técnico sobre los requisitos de etiquetado nutricional y etiquetado frontal que deben cumplir los alimentos envasados o empacados para consumo humano que se comercialicen en Colombia.</p><h4>Decreto 1500 del 2007</h4><p>Tiene por objeto establecer el reglamento técnico mediante el cual se crea el Sistema Oficial de Inspección, Vigilancia y Control de la carne, productos cárnicos comestibles y derivados cárnicos destinados para el consumo humano, así como los requisitos sanitarios y de inocuidad que deben cumplirse a lo largo de todas las etapas de la cadena alimentaria.</p><h4>Ley 9 de 1979</h4><p>Tiene por objeto establecer medidas sanitarias orientadas a preservar, restaurar y mejorar las condiciones necesarias para proteger la salud humana y las condiciones sanitarias del ambiente.</p><h4>Resolución 5109 del 2005</h4><p>tiene por objeto establecer el reglamento técnico sobre los requisitos de rotulado o etiquetado que deben cumplir los alimentos envasados o empacados y las materias primas para consumo humano, con el fin de brindar al consumidor información clara, comprensible y que no induzca a error o confusión.</p>",
    "url_recurso": ""
  }
];

const seedQuestions = [
  {
    id: 1,
    pregunta: "¿Cuál es la temperatura mínima segura para cocinar pollo?",
    opciones: {
      "A": "60°C (140°F)",
      "B": "70°C (158°F)",
      "C": "74°C (165°F)",
      "D": "80°C (176°F)"
    },
    respuesta_correcta: "C"
  },
  {
    id: 2,
    pregunta: "¿Qué es la contaminación cruzada?",
    opciones: {
      "A": "Cuando un alimento se cocina demasiado",
      "B": "La transferencia de microorganismos de un alimento a otro",
      "C": "Cuando se mezclan diferentes ingredientes",
      "D": "El proceso de congelación de alimentos"
    },
    respuesta_correcta: "B"
  },
  {
    id: 3,
    pregunta: "¿Con qué frecuencia debe lavarse las manos un manipulador de alimentos?",
    opciones: {
      "A": "Solo al inicio del turno",
      "B": "Una vez por hora",
      "C": "Cada vez que cambie de tarea y después de tocar superficies contaminadas",
      "D": "Solamente antes de comer"
    },
    respuesta_correcta: "C"
  },
  {
    id: 4,
    pregunta: "¿Cuál es el rango de temperatura de la 'zona de peligro' para alimentos?",
    opciones: {
      "A": "0°C a 10°C",
      "B": "5°C a 60°C",
      "C": "10°C a 40°C",
      "D": "20°C a 50°C"
    },
    respuesta_correcta: "B"
  },
  {
    id: 5,
    pregunta: "¿Qué debe hacer si encuentra un alimento vencido en el almacén?",
    opciones: {
      "A": "Usarlo si no huele mal",
      "B": "Descartarlo inmediatamente y reportarlo",
      "C": "Mezclarlo con alimentos frescos",
      "D": "Guardarlo para revisión posterior"
    },
    respuesta_correcta: "B"
  },
  {
    id: 6,
    pregunta: "¿Cuál es la primera etapa del proceso de limpieza y desinfección?",
    opciones: {
      "A": "Aplicar desinfectante",
      "B": "Enjuagar con agua",
      "C": "Remover los residuos visibles",
      "D": "Secar las superficies"
    },
    respuesta_correcta: "C"
  },
  {
    id: 7,
    pregunta: "¿Qué característica NO debe tener un manipulador de alimentos?",
    opciones: {
      "A": "Uñas cortas y limpias",
      "B": "Joyas y accesorios en las manos",
      "C": "Ropa limpia y apropiada",
      "D": "Cabello recogido o cubierto"
    },
    respuesta_correcta: "B"
  },
  {
    id: 8,
    pregunta: "¿Cuánto tiempo máximo pueden permanecer alimentos perecederos a temperatura ambiente?",
    opciones: {
      "A": "30 minutos",
      "B": "1 hora",
      "C": "2 horas",
      "D": "4 horas"
    },
    respuesta_correcta: "C"
  }
];

// Database connection configuration with strict charset property.
// Note: While SQLite stores raw UTF-8 by default, we configure the connection 
// properties/metadata to strictly enforce 'utf8mb4' character set encoding
// for E2E consistency and complete UTF-8 compatibility.
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: dbFile,
    charset: 'utf8mb4'
  },
  useNullAsDefault: true
};

// Initialize DB Connections
function initDB() {
  return new Promise(async (resolve, reject) => {
    try {
      const sqlite3 = require('sqlite3').verbose();
      sqliteDB = new sqlite3.Database(dbFile, (err) => {
        if (err) {
          console.warn('Could not open SQLite database file, falling back to JSON storage.', err.message);
          dbType = 'json';
          setupJsonDB().then(resolve);
        } else {
          console.log('Connected to the SQLite database.');
          sqliteDB.run("PRAGMA encoding = 'UTF-8';");
          setupSqliteDB().then(resolve).catch((sqliteErr) => {
            console.error('Error setting up SQLite tables, falling back to JSON:', sqliteErr);
            dbType = 'json';
            setupJsonDB().then(resolve);
          });
        }
      });
    } catch (e) {
      console.warn('sqlite3 library not available or failed to load. Falling back to JSON database.');
      dbType = 'json';
      setupJsonDB().then(resolve);
    }
  });
}

// Setup SQLite Tables — Idempotent (safe to run on every startup, preserves existing data)
function setupSqliteDB() {
  return new Promise((resolve, reject) => {
    sqliteDB.serialize(() => {
      // Enable foreign key constraints
      sqliteDB.run(`PRAGMA foreign_keys = ON`, (err) => { if (err) console.warn('FK pragma warn:', err?.message); });

      // Create tables only if they don't exist — NO DROP TABLE to preserve production data
      sqliteDB.run(`CREATE TABLE IF NOT EXISTS usuarios (
          cedula TEXT PRIMARY KEY,
          nombre_completo TEXT,
          password_hash TEXT,
          rol TEXT DEFAULT 'estudiante',
          fecha_registro TEXT
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS cursos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT,
          descripcion TEXT,
          imagen_url TEXT,
          creado_en TEXT
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS matriculas (
          usuario_cedula TEXT,
          curso_id INTEGER,
          fecha_matricula TEXT,
          PRIMARY KEY (usuario_cedula, curso_id),
          FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS modulos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          curso_id INTEGER,
          titulo_modulo TEXT,
          orden INTEGER,
          tipo_contenido TEXT,
          data_contenido TEXT,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS preguntas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          curso_id INTEGER,
          pregunta TEXT,
          opcion_a TEXT,
          opcion_b TEXT,
          opcion_c TEXT,
          opcion_d TEXT,
          respuesta_correcta TEXT,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS progreso (
          usuario_cedula TEXT,
          modulo_id INTEGER,
          completado INTEGER DEFAULT 0,
          fecha_completado TEXT,
          PRIMARY KEY (usuario_cedula, modulo_id),
          FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
          FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS examenes (
          usuario_cedula TEXT,
          curso_id INTEGER DEFAULT 1,
          intentos INTEGER DEFAULT 0,
          puntaje_maximo REAL DEFAULT 0,
          aprobado INTEGER DEFAULT 0,
          fecha_ultimo_intento TEXT,
          PRIMARY KEY (usuario_cedula, curso_id),
          FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS certificados (
          codigo_verificacion TEXT PRIMARY KEY,
          usuario_cedula TEXT,
          curso_id INTEGER DEFAULT 1,
          fecha_emision TEXT,
          calificacion_obtenida REAL,
          numero_certificado TEXT UNIQUE,
          FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
        )`, (err) => { if (err) return reject(err); });

      // Seed Default Course — INSERT OR IGNORE preserves existing data
      sqliteDB.run(`INSERT OR IGNORE INTO cursos (id, titulo, descripcion, imagen_url, creado_en) VALUES (?, ?, ?, ?, ?)`,
        [1, 'Manipulación de Alimentos', 'Curso estándar de 3 horas lectivas para la manipulación higiénica de alimentos.', 'https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080', '2026-05-20'],
        (err) => {
          if (err) return reject(err);

          // Seed modules — INSERT OR IGNORE so existing module data is not overwritten
          const stmt = sqliteDB.prepare(`INSERT OR IGNORE INTO modulos (id, curso_id, titulo_modulo, orden, tipo_contenido, data_contenido) VALUES (?, ?, ?, ?, ?, ?)`);
          for (const m of seedModules) {
            const serializedData = JSON.stringify({
              url: m.url_recurso,
              text: m.contenido
            });
            stmt.run(m.id, 1, m.titulo, m.orden, m.tipo_recurso, serializedData);
          }
          stmt.finalize((errFinalize) => {
            if (errFinalize) return reject(errFinalize);

            // Seed questions — INSERT OR IGNORE to avoid duplicates on restart
            const stmtQuestions = sqliteDB.prepare(`INSERT OR IGNORE INTO preguntas (id, curso_id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            for (const q of seedQuestions) {
              stmtQuestions.run(q.id, 1, q.pregunta, q.opciones.A, q.opciones.B, q.opciones.C, q.opciones.D, q.respuesta_correcta);
            }
            stmtQuestions.finalize((errFinalizeQ) => {
              if (errFinalizeQ) return reject(errFinalizeQ);

              // Seed Default Student User (cedula: 123456789)
              const salt = bcrypt.genSaltSync(10);
              const hash = bcrypt.hashSync('password123', salt);
              sqliteDB.run(`INSERT OR IGNORE INTO usuarios (cedula, nombre_completo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
                ['123456789', 'Juan Pérez', hash, 'estudiante', '2026-05-20'],
                (errUser) => {
                  if (errUser) return reject(errUser);

                  // Seed Administrator
                  const adminHash = bcrypt.hashSync('adminpassword', salt);
                  sqliteDB.run(`INSERT OR IGNORE INTO usuarios (cedula, nombre_completo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
                    ['999999999', 'Administrador AlimSafe', adminHash, 'administrador', '2026-05-26'],
                    (errAdmin) => {
                      if (errAdmin) return reject(errAdmin);

                      // Enroll default student in course 1
                      sqliteDB.run(`INSERT OR IGNORE INTO matriculas (usuario_cedula, curso_id, fecha_matricula) VALUES (?, ?, ?)`,
                        ['123456789', 1, '2026-05-20'],
                        (errEnroll) => {
                          if (errEnroll) return reject(errEnroll);
                          resolve();
                        }
                      );
                    }
                  );
                }
              );
            });
          });
        }
      );
    });
  });
}

// Setup JSON DB
async function setupJsonDB() {
  loadJsonDb();

  // Reset collections with correct structure
  jsonDb.courses = [
    {
      id: 1,
      titulo: 'Manipulación de Alimentos',
      descripcion: 'Curso estándar de 3 horas lectivas para la manipulación higiénica de alimentos.',
      imagen_url: 'https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      creado_en: '2026-05-20'
    }
  ];

  jsonDb.modules = seedModules.map(m => ({
    id: m.id,
    curso_id: 1,
    titulo_modulo: m.titulo,
    orden: m.orden,
    tipo_contenido: m.tipo_recurso,
    data_contenido: JSON.stringify({ url: m.url_recurso, text: m.contenido })
  }));

  if (!jsonDb.matriculas) {
    jsonDb.matriculas = [];
  }

  // Seed default student user
  const studentExists = jsonDb.users.some(u => u.cedula === '123456789');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('password123', salt);
  if (!studentExists) {
    jsonDb.users.push({
      cedula: '123456789',
      nombre_completo: 'Juan Pérez',
      password_hash: hash,
      rol: 'estudiante',
      fecha_registro: '2026-05-20'
    });
  }

  // Seed default admin user
  const adminExists = jsonDb.users.some(u => u.cedula === '999999999');
  if (!adminExists) {
    const adminHash = bcrypt.hashSync('adminpassword', salt);
    jsonDb.users.push({
      cedula: '999999999',
      nombre_completo: 'Administrador AlimSafe',
      password_hash: adminHash,
      rol: 'administrador',
      fecha_registro: '2026-05-26'
    });
  }

  // Enroll default student in course 1
  const matriculaExists = jsonDb.matriculas.some(m => m.usuario_cedula === '123456789' && m.curso_id === 1);
  if (!matriculaExists) {
    jsonDb.matriculas.push({
      usuario_cedula: '123456789',
      curso_id: 1,
      fecha_matricula: '2026-05-20'
    });
  }

  // Seed questions
  jsonDb.questions = seedQuestions.map(q => ({
    id: q.id,
    curso_id: 1,
    pregunta: q.pregunta,
    opcion_a: q.opciones.A,
    opcion_b: q.opciones.B,
    opcion_c: q.opciones.C,
    opcion_d: q.opciones.D,
    respuesta_correcta: q.respuesta_correcta
  }));

  saveJsonDb();
  console.log('JSON database initialized and seeded successfully.');
}

// Windows-1252 Mojibake mapping table to translate to correct characters
const win1252ToByte = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
  '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
  '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
  '\u017E': 0x9E, '\u0178': 0x9F
};

function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (win1252ToByte[char] !== undefined) {
      bytes.push(win1252ToByte[char]);
    } else {
      bytes.push(char.charCodeAt(0) & 0xFF);
    }
  }
  return Buffer.from(bytes);
}

function sanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    try {
      const bytes = stringToBytes(obj);
      const utf8 = bytes.toString('utf8');
      if (utf8 !== obj && !utf8.includes('\uFFFD')) {
        return utf8;
      }
    } catch (e) {}
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitize(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Map Module DB schema to the frontend structure
function mapModuleToFrontend(m) {
  if (!m) return null;
  let url_recurso = '';
  let contenido = '';
  
  if (m.data_contenido && m.data_contenido.startsWith('{')) {
    try {
      const parsed = JSON.parse(m.data_contenido);
      url_recurso = parsed.url || '';
      contenido = parsed.text || '';
    } catch (e) {
      contenido = m.data_contenido;
    }
  } else {
    // If it's not a JSON string, check content type
    if (['video', 'audio', 'imagen', 'image'].includes(m.tipo_contenido?.toLowerCase())) {
      url_recurso = m.data_contenido || '';
      contenido = '';
    } else {
      url_recurso = '';
      contenido = m.data_contenido || '';
    }
  }

  return {
    id: m.id,
    curso_id: m.curso_id,
    titulo: m.titulo_modulo || m.titulo,
    descripcion: contenido ? contenido.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
    orden: m.orden,
    tipo_recurso: (m.tipo_contenido || 'texto').toLowerCase(),
    contenido: contenido,
    url_recurso: url_recurso
  };
}

// DB Core Helpers

// Users
function getUser(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM usuarios WHERE cedula = ?`, [cedula], (err, row) => {
        if (err) reject(err);
        else resolve(sanitize(row) || null);
      });
    } else {
      const user = jsonDb.users.find(u => u.cedula === cedula);
      resolve(sanitize(user) || null);
    }
  });
}

function createUser(cedula, nombre_completo, password, rol = 'estudiante', fecha_registro = null) {
  return new Promise((resolve, reject) => {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const date = fecha_registro || new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT INTO usuarios (cedula, nombre_completo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
        [cedula, nombre_completo, password_hash, rol, date],
        function (err) {
          if (err) reject(err);
          else resolve(sanitize({ cedula, nombre_completo, rol, fecha_registro: date }));
        }
      );
    } else {
      const exists = jsonDb.users.some(u => u.cedula === cedula);
      if (exists) {
        reject(new Error('User already exists'));
      } else {
        const newUser = { cedula, nombre_completo, password_hash, rol, fecha_registro: date };
        jsonDb.users.push(newUser);
        saveJsonDb();
        resolve(sanitize({ cedula, nombre_completo, rol, fecha_registro: date }));
      }
    }
  });
}

// Admin Panel Helpers
function getCourses() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM cursos ORDER BY id ASC`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(sanitize(rows));
      });
    } else {
      resolve(sanitize(jsonDb.courses || []));
    }
  });
}

function enrollUserInCourse(cedula, courseId) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO matriculas (usuario_cedula, curso_id, fecha_matricula) VALUES (?, ?, ?)`,
        [cedula, courseId, fecha],
        function (err) {
          if (err) reject(err);
          else resolve({ usuario_cedula: cedula, curso_id: courseId, fecha_matricula: fecha });
        }
      );
    } else {
      if (!jsonDb.matriculas) jsonDb.matriculas = [];
      const idx = jsonDb.matriculas.findIndex(m => m.usuario_cedula === cedula && m.curso_id === courseId);
      const entry = { usuario_cedula: cedula, curso_id: courseId, fecha_matricula: fecha };
      if (idx !== -1) {
        jsonDb.matriculas[idx] = entry;
      } else {
        jsonDb.matriculas.push(entry);
      }
      saveJsonDb();
      resolve(entry);
    }
  });
}

function getAdminMetrics() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      // 1. Total active student users
      sqliteDB.get(`SELECT COUNT(*) as total FROM usuarios WHERE rol = 'estudiante'`, [], (errUsers, rowUsers) => {
        if (errUsers) return reject(errUsers);
        const activeUsers = rowUsers.total || 0;

        // 2. Completed courses: Count unique approved exams
        sqliteDB.get(`SELECT COUNT(DISTINCT usuario_cedula || '-' || curso_id) as total FROM examenes WHERE aprobado = 1`, [], (errExams, rowExams) => {
          if (errExams) return reject(errExams);
          const completedCursos = rowExams.total || 0;

          // 3. Pending courses: Total active enrollments minus completed courses
          sqliteDB.get(`SELECT COUNT(*) as total FROM matriculas`, [], (errEnroll, rowEnroll) => {
            if (errEnroll) return reject(errEnroll);
            const totalEnrollments = rowEnroll.total || 0;
            const pendingCursos = Math.max(0, totalEnrollments - completedCursos);

            resolve({
              usuarios_activos: activeUsers,
              cursos_completados: completedCursos,
              cursos_pendientes: pendingCursos
            });
          });
        });
      });
    } else {
      const activeUsers = jsonDb.users.filter(u => u.rol === 'estudiante').length;
      const completedCursos = (jsonDb.exams || []).filter(e => e.aprobado === 1).length;
      const totalEnrollments = (jsonDb.matriculas || []).length;
      const pendingCursos = Math.max(0, totalEnrollments - completedCursos);

      resolve({
        usuarios_activos: activeUsers,
        cursos_completados: completedCursos,
        cursos_pendientes: pendingCursos
      });
    }
  });
}

function getAdminUsers(cedula = '') {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      let query = `
        SELECT 
          u.cedula, 
          u.nombre_completo, 
          u.rol, 
          u.fecha_registro,
          (
            SELECT COUNT(*) 
            FROM progreso p 
            JOIN modulos m ON p.modulo_id = m.id
            JOIN matriculas mat ON m.curso_id = mat.curso_id AND mat.usuario_cedula = u.cedula
            WHERE p.usuario_cedula = u.cedula AND p.completado = 1
          ) as completed_count,
          (
            SELECT COUNT(*) 
            FROM modulos m
            JOIN matriculas mat ON m.curso_id = mat.curso_id AND mat.usuario_cedula = u.cedula
          ) as total_count,
          (
            SELECT group_concat(curso_id)
            FROM matriculas
            WHERE usuario_cedula = u.cedula
          ) as enrolled_courses
        FROM usuarios u 
        WHERE u.rol = 'estudiante'
      `;
      const params = [];
      if (cedula) {
        query += ` AND u.cedula LIKE ?`;
        params.push(cedula + '%');
      }
      sqliteDB.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          const results = rows.map(r => {
            const completed = r.completed_count || 0;
            const total = r.total_count || 0;
            const progress_pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
              cedula: r.cedula,
              nombre_completo: sanitize(r.nombre_completo),
              rol: r.rol,
              fecha_registro: r.fecha_registro || '2026-05-26',
              progreso_porcentaje: progress_pct,
              enrolled_courses: r.enrolled_courses ? r.enrolled_courses.split(',').map(Number) : []
            };
          });
          resolve(results);
        }
      });
    } else {
      const results = jsonDb.users
        .filter(u => u.rol === 'estudiante' && (!cedula || u.cedula.startsWith(cedula)))
        .map(u => {
          const userMatriculas = (jsonDb.matriculas || []).filter(m => m.usuario_cedula === u.cedula);
          const courseIds = userMatriculas.map(m => m.curso_id);
          const courseModules = (jsonDb.modules || []).filter(m => courseIds.includes(m.curso_id));
          const courseModuleIds = courseModules.map(m => m.id);
          
          const completed = (jsonDb.progress || [])
            .filter(p => p.usuario_cedula === u.cedula && p.completado === 1 && courseModuleIds.includes(p.modulo_id)).length;
          
          const total = courseModules.length;
          const progress_pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            cedula: u.cedula,
            nombre_completo: sanitize(u.nombre_completo),
            rol: u.rol,
            fecha_registro: u.fecha_registro || '2026-05-26',
            progreso_porcentaje: progress_pct,
            enrolled_courses: courseIds
          };
        });
      resolve(results);
    }
  });
}

// Course Modules
function getModules(courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM modulos WHERE curso_id = ? ORDER BY orden ASC`, [courseId], (err, rows) => {
        if (err) reject(err);
        else resolve(sanitize(rows).map(mapModuleToFrontend));
      });
    } else {
      const filtered = (jsonDb.modules || []).filter(m => m.curso_id === courseId).sort((a, b) => a.orden - b.orden);
      resolve(sanitize(filtered).map(mapModuleToFrontend));
    }
  });
}

// Progress Tracking
function getUserProgress(cedula, courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      const query = `
        SELECT p.modulo_id 
        FROM progreso p 
        JOIN modulos m ON p.modulo_id = m.id 
        WHERE p.usuario_cedula = ? AND p.completado = 1 AND m.curso_id = ?
      `;
      sqliteDB.all(query, [cedula, courseId], (err, rows) => {
        if (err) return reject(err);
        const completedIds = rows.map(r => r.modulo_id);

        sqliteDB.get(`SELECT COUNT(*) as total FROM modulos WHERE curso_id = ?`, [courseId], (errCount, rowCount) => {
          if (errCount) return reject(errCount);
          const total = rowCount.total || 0;
          const pct = total > 0 ? Math.round((completedIds.length / total) * 1000) / 10 : 0;
          resolve({
            progreso_porcentaje: pct,
            modulos_completados: completedIds
          });
        });
      });
    } else {
      const courseModules = (jsonDb.modules || []).filter(m => m.curso_id === courseId);
      const courseModuleIds = courseModules.map(m => m.id);
      const completed = (jsonDb.progress || [])
        .filter(p => p.usuario_cedula === cedula && p.completado === 1 && courseModuleIds.includes(p.modulo_id))
        .map(p => p.modulo_id);
      const total = courseModules.length || 0;
      const pct = total > 0 ? Math.round((completed.length / total) * 1000) / 10 : 0;
      resolve({
        progreso_porcentaje: pct,
        modulos_completados: completed
      });
    }
  });
}

function saveProgress(cedula, modulo_id) {
  return new Promise(async (resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO progreso (usuario_cedula, modulo_id, completado, fecha_completado) VALUES (?, ?, ?, ?)`,
        [cedula, modulo_id, 1, fecha],
        async function (err) {
          if (err) return reject(err);
          try {
            // Find which course this module belongs to
            sqliteDB.get(`SELECT curso_id FROM modulos WHERE id = ?`, [modulo_id], async (errMod, rowMod) => {
              if (errMod) return reject(errMod);
              const courseId = rowMod ? rowMod.curso_id : 1;
              const prog = await getUserProgress(cedula, courseId);
              resolve(prog);
            });
          } catch (e) {
            reject(e);
          }
        }
      );
    } else {
      const idx = (jsonDb.progress || []).findIndex(p => p.usuario_cedula === cedula && p.modulo_id === modulo_id);
      if (idx !== -1) {
        jsonDb.progress[idx].completado = 1;
        jsonDb.progress[idx].fecha_completado = fecha;
      } else {
        if (!jsonDb.progress) jsonDb.progress = [];
        jsonDb.progress.push({
          usuario_cedula: cedula,
          modulo_id,
          completado: 1,
          fecha_completado: fecha
        });
      }
      saveJsonDb();
      const mod = (jsonDb.modules || []).find(m => m.id === modulo_id);
      const courseId = mod ? mod.curso_id : 1;
      const prog = await getUserProgress(cedula, courseId);
      resolve(prog);
    }
  });
}

// Exam & Evaluation
function submitExam(cedula, score, approved, courseId = 1) {
  return new Promise((resolve, reject) => {
    const isApproved = approved ? 1 : 0;
    const now = new Date().toISOString();
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT intentos FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`, [cedula, courseId], (err, row) => {
        if (err) return reject(err);
        const nextAttempts = (row ? row.intentos : 0) + 1;

        sqliteDB.run(
          `INSERT OR REPLACE INTO examenes (usuario_cedula, curso_id, intentos, puntaje_maximo, aprobado, fecha_ultimo_intento) 
           VALUES (?, ?, ?, MAX(?, COALESCE((SELECT puntaje_maximo FROM examenes WHERE usuario_cedula = ? AND curso_id = ?), 0)), MAX(?, COALESCE((SELECT aprobado FROM examenes WHERE usuario_cedula = ? AND curso_id = ?), 0)), ?)`,
          [cedula, courseId, nextAttempts, score, cedula, courseId, isApproved, cedula, courseId, now],
          function (errInsert) {
            if (errInsert) return reject(errInsert);
            resolve({
              puntaje: score,
              aprobado: approved,
              intentos: nextAttempts,
              fecha_ultimo_intento: now
            });
          }
        );
      });
    } else {
      if (!jsonDb.exams) jsonDb.exams = [];
      let record = jsonDb.exams.find(e => e.usuario_cedula === cedula && e.curso_id === courseId);
      if (!record) {
        record = {
          usuario_cedula: cedula,
          curso_id: courseId,
          intentos: 0,
          puntaje_maximo: 0,
          aprobado: 0,
          fecha_ultimo_intento: null
        };
        jsonDb.exams.push(record);
      }
      record.intentos += 1;
      record.puntaje_maximo = Math.max(record.puntaje_maximo, score);
      record.aprobado = Math.max(record.aprobado, isApproved);
      record.fecha_ultimo_intento = now;
      saveJsonDb();
      resolve({
        puntaje: score,
        aprobado: record.aprobado === 1,
        intentos: record.intentos,
        fecha_ultimo_intento: now
      });
    }
  });
}

function getExamStatus(cedula, courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`, [cedula, courseId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? { intentos: row.intentos, puntaje_maximo: row.puntaje_maximo, aprobado: row.aprobado === 1, fecha_ultimo_intento: row.fecha_ultimo_intento } : null);
      });
    } else {
      const record = (jsonDb.exams || []).find(e => e.usuario_cedula === cedula && e.curso_id === courseId);
      resolve(record ? { intentos: record.intentos, puntaje_maximo: record.puntaje_maximo, aprobado: record.aprobado === 1, fecha_ultimo_intento: record.fecha_ultimo_intento } : null);
    }
  });
}

function getExamQuestions(courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d FROM preguntas WHERE curso_id = ?`, [courseId], (err, rows) => {
        if (err) reject(err);
        else {
          const formatted = rows.map(r => ({
            id: r.id,
            pregunta: r.pregunta,
            opciones: {
              A: r.opcion_a,
              B: r.opcion_b,
              C: r.opcion_c,
              D: r.opcion_d
            }
          }));
          resolve(sanitize(formatted));
        }
      });
    } else {
      const questions = (jsonDb.questions || []).filter(q => q.curso_id === courseId);
      const formatted = questions.map(q => ({
        id: q.id,
        pregunta: q.pregunta,
        opciones: {
          A: q.opcion_a,
          B: q.opcion_b,
          C: q.opcion_c,
          D: q.opcion_d
        }
      }));
      resolve(sanitize(formatted));
    }
  });
}

function getExamQuestionsWithAnswers(courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM preguntas WHERE curso_id = ?`, [courseId], (err, rows) => {
        if (err) reject(err);
        else {
          const formatted = rows.map(r => ({
            id: r.id,
            pregunta: r.pregunta,
            opciones: {
              A: r.opcion_a,
              B: r.opcion_b,
              C: r.opcion_c,
              D: r.opcion_d
            },
            respuesta_correcta: r.respuesta_correcta
          }));
          resolve(sanitize(formatted));
        }
      });
    } else {
      const questions = (jsonDb.questions || []).filter(q => q.curso_id === courseId);
      const formatted = questions.map(q => ({
        id: q.id,
        pregunta: q.pregunta,
        opciones: {
          A: q.opcion_a,
          B: q.opcion_b,
          C: q.opcion_c,
          D: q.opcion_d
        },
        respuesta_correcta: q.respuesta_correcta
      }));
      resolve(sanitize(formatted));
    }
  });
}

// Certificates
function createCertificate(cedula, verificationCode, calificacion_obtenida, numero_certificado, courseId = 1) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO certificados (codigo_verificacion, usuario_cedula, curso_id, fecha_emision, calificacion_obtenida, numero_certificado) VALUES (?, ?, ?, ?, ?, ?)`,
        [verificationCode, cedula, courseId, fecha, calificacion_obtenida, numero_certificado],
        function (err) {
          if (err) reject(err);
          else resolve(sanitize({ codigo_verificacion: verificationCode, usuario_cedula: cedula, curso_id: courseId, fecha_emision: fecha, calificacion_obtenida, numero_certificado }));
        }
      );
    } else {
      if (!jsonDb.certificates) jsonDb.certificates = [];
      const idx = jsonDb.certificates.findIndex(c => c.usuario_cedula === cedula && c.curso_id === courseId);
      const newCert = { codigo_verificacion: verificationCode, usuario_cedula: cedula, curso_id: courseId, fecha_emision: fecha, calificacion_obtenida, numero_certificado };
      if (idx !== -1) {
        jsonDb.certificates[idx] = newCert;
      } else {
        jsonDb.certificates.push(newCert);
      }
      saveJsonDb();
      resolve(sanitize(newCert));
    }
  });
}

function getCertificate(verificationCode) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(
        `SELECT c.*, u.nombre_completo, u.cedula, cur.titulo as curso_titulo 
         FROM certificados c 
         JOIN usuarios u ON c.usuario_cedula = u.cedula 
         LEFT JOIN cursos cur ON c.curso_id = cur.id
         WHERE c.codigo_verificacion = ?`,
        [verificationCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(sanitize(row) || null);
        }
      );
    } else {
      const cert = (jsonDb.certificates || []).find(c => c.codigo_verificacion === verificationCode);
      if (cert) {
        const user = jsonDb.users.find(u => u.cedula === cert.usuario_cedula);
        const course = jsonDb.courses.find(cur => cur.id === cert.curso_id);
        resolve(sanitize({
          codigo_verificacion: cert.codigo_verificacion,
          usuario_cedula: cert.usuario_cedula,
          curso_id: cert.curso_id,
          fecha_emision: cert.fecha_emision,
          calificacion_obtenida: cert.calificacion_obtenida,
          numero_certificado: cert.numero_certificado,
          nombre_completo: user ? user.nombre_completo : 'Unknown User',
          cedula: cert.usuario_cedula,
          curso_titulo: course ? course.titulo : 'Manipulación de Alimentos'
        }));
      } else {
        resolve(null);
      }
    }
  });
}

function getCertificateByCedula(cedula, courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM certificados WHERE usuario_cedula = ? AND curso_id = ?`, [cedula, courseId], (err, row) => {
        if (err) reject(err);
        else resolve(sanitize(row) || null);
      });
    } else {
      const cert = (jsonDb.certificates || []).find(c => c.usuario_cedula === cedula && c.curso_id === courseId);
      resolve(sanitize(cert) || null);
    }
  });
}

function getCertificatesCount() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT COUNT(*) as total FROM certificados`, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total : 0);
      });
    } else {
      resolve((jsonDb.certificates || []).length);
    }
  });
}

// Student Enrolled Courses Helper
function getStudentCourses(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      const query = `
        SELECT c.*, m.fecha_matricula
        FROM matriculas m
        JOIN cursos c ON m.curso_id = c.id
        WHERE m.usuario_cedula = ?
      `;
      sqliteDB.all(query, [cedula], async (err, rows) => {
        if (err) return reject(err);
        try {
          const coursesWithProgress = [];
          for (const row of rows) {
            const progress = await getUserProgress(cedula, row.id);
            coursesWithProgress.push({
              ...sanitize(row),
              progreso_porcentaje: progress.progreso_porcentaje
            });
          }
          resolve(coursesWithProgress);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      const userMatriculas = (jsonDb.matriculas || []).filter(m => m.usuario_cedula === cedula);
      const coursesWithProgress = [];
      
      const computeAll = async () => {
        for (const m of userMatriculas) {
          const course = jsonDb.courses.find(c => c.id === m.curso_id);
          if (course) {
            const progress = await getUserProgress(cedula, course.id);
            coursesWithProgress.push({
              ...sanitize(course),
              fecha_matricula: m.fecha_matricula,
              progreso_porcentaje: progress.progreso_porcentaje
            });
          }
        }
        return coursesWithProgress;
      };

      computeAll().then(resolve).catch(reject);
    }
  });
}

// Create course and its modules atomically
function createCourse(courseData) {
  const { titulo, descripcion, imagen_url, modulos } = courseData;
  const creado_en = new Date().toISOString().split('T')[0];

  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.serialize(() => {
        sqliteDB.run('BEGIN TRANSACTION', (errBegin) => {
          if (errBegin) return reject(errBegin);

          sqliteDB.run(
            `INSERT INTO cursos (titulo, descripcion, imagen_url, creado_en) VALUES (?, ?, ?, ?)`,
            [titulo, descripcion, imagen_url, creado_en],
            function (errCourse) {
              if (errCourse) {
                return sqliteDB.run('ROLLBACK', () => reject(errCourse));
              }
              const courseId = this.lastID;

              if (!modulos || modulos.length === 0) {
                sqliteDB.run('COMMIT', (errCommit) => {
                  if (errCommit) return sqliteDB.run('ROLLBACK', () => reject(errCommit));
                  resolve({ id: courseId, titulo, descripcion, imagen_url, creado_en, modulos: [] });
                });
                return;
              }

              const stmt = sqliteDB.prepare(
                `INSERT INTO modulos (curso_id, titulo_modulo, orden, tipo_contenido, data_contenido) VALUES (?, ?, ?, ?, ?)`
              );

              let hasError = false;
              let errObj = null;

              modulos.forEach((mod, idx) => {
                if (hasError) return;
                const orden = idx + 1;
                stmt.run(
                  [courseId, mod.titulo_modulo, orden, mod.tipo_contenido, mod.data_contenido],
                  (errMod) => {
                    if (errMod) {
                      hasError = true;
                      errObj = errMod;
                    }
                  }
                );
              });

              stmt.finalize((errFinalize) => {
                if (hasError || errFinalize) {
                  return sqliteDB.run('ROLLBACK', () => reject(errObj || errFinalize));
                }
                sqliteDB.run('COMMIT', (errCommit) => {
                  if (errCommit) return sqliteDB.run('ROLLBACK', () => reject(errCommit));
                  resolve({
                    id: courseId,
                    titulo,
                    descripcion,
                    imagen_url,
                    creado_en,
                    modulos
                  });
                });
              });
            }
          );
        });
      });
    } else {
      // JSON DB fallback
      try {
        const courseId = jsonDb.courses.length > 0 ? Math.max(...jsonDb.courses.map(c => c.id)) + 1 : 1;
        const newCourse = { id: courseId, titulo, descripcion, imagen_url, creado_en };
        jsonDb.courses.push(newCourse);

        const newModules = [];
        const nextModId = jsonDb.modules.length > 0 ? Math.max(...jsonDb.modules.map(m => m.id)) + 1 : 1;
        (modulos || []).forEach((mod, idx) => {
          newModules.push({
            id: nextModId + idx,
            curso_id: courseId,
            titulo_modulo: mod.titulo_modulo,
            orden: idx + 1,
            tipo_contenido: mod.tipo_contenido,
            data_contenido: mod.data_contenido
          });
        });

        jsonDb.modules.push(...newModules);
        saveJsonDb();

        resolve({
          id: courseId,
          titulo,
          descripcion,
          imagen_url,
          creado_en,
          modulos: newModules
        });
      } catch (e) {
        reject(e);
      }
    }
  });
}

function updateUserCourses(cedula, courseIds) {
  return new Promise(async (resolve, reject) => {
    const date = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.serialize(() => {
        sqliteDB.all(`SELECT curso_id FROM matriculas WHERE usuario_cedula = ?`, [cedula], (err, rows) => {
          if (err) return reject(err);
          const currentCourseIds = rows.map(r => r.curso_id);

          const added = courseIds.filter(id => !currentCourseIds.includes(id));
          const removed = currentCourseIds.filter(id => !courseIds.includes(id));

          sqliteDB.run('BEGIN TRANSACTION', (errBegin) => {
            if (errBegin) return reject(errBegin);

            try {
              const insertStmt = sqliteDB.prepare(
                `INSERT OR IGNORE INTO matriculas (usuario_cedula, curso_id, fecha_matricula) VALUES (?, ?, ?)`
              );
              added.forEach(courseId => {
                insertStmt.run([cedula, courseId, date]);
              });
              insertStmt.finalize();

              added.forEach(courseId => {
                sqliteDB.run(
                  `DELETE FROM progreso WHERE usuario_cedula = ? AND modulo_id IN (SELECT id FROM modulos WHERE curso_id = ?)`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM certificados WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
              });

              removed.forEach(courseId => {
                sqliteDB.run(
                  `DELETE FROM matriculas WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM progreso WHERE usuario_cedula = ? AND modulo_id IN (SELECT id FROM modulos WHERE curso_id = ?)`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM certificados WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
              });

              sqliteDB.run('COMMIT', (errCommit) => {
                if (errCommit) {
                  sqliteDB.run('ROLLBACK');
                  return reject(errCommit);
                }
                resolve({ success: true });
              });
            } catch (transErr) {
              sqliteDB.run('ROLLBACK');
              reject(transErr);
            }
          });
        });
      });
    } else {
      try {
        if (!jsonDb.matriculas) jsonDb.matriculas = [];
        if (!jsonDb.progress) jsonDb.progress = [];
        if (!jsonDb.exams) jsonDb.exams = [];
        if (!jsonDb.certificates) jsonDb.certificates = [];

        const currentCourseIds = jsonDb.matriculas
          .filter(m => m.usuario_cedula === cedula)
          .map(m => m.curso_id);

        const added = courseIds.filter(id => !currentCourseIds.includes(id));
        const removed = currentCourseIds.filter(id => !courseIds.includes(id));

        added.forEach(courseId => {
          jsonDb.matriculas.push({
            usuario_cedula: cedula,
            curso_id: courseId,
            fecha_matricula: date
          });
          const moduleIds = (jsonDb.modules || []).filter(m => m.curso_id === courseId).map(m => m.id);
          jsonDb.progress = jsonDb.progress.filter(p => !(p.usuario_cedula === cedula && moduleIds.includes(p.modulo_id)));
          jsonDb.exams = jsonDb.exams.filter(e => !(e.usuario_cedula === cedula && e.curso_id === courseId));
          jsonDb.certificates = jsonDb.certificates.filter(c => !(c.usuario_cedula === cedula && c.curso_id === courseId));
        });

        removed.forEach(courseId => {
          jsonDb.matriculas = jsonDb.matriculas.filter(m => !(m.usuario_cedula === cedula && m.curso_id === courseId));
          const moduleIds = (jsonDb.modules || []).filter(m => m.curso_id === courseId).map(m => m.id);
          jsonDb.progress = jsonDb.progress.filter(p => !(p.usuario_cedula === cedula && moduleIds.includes(p.modulo_id)));
          jsonDb.exams = jsonDb.exams.filter(e => !(e.usuario_cedula === cedula && e.curso_id === courseId));
          jsonDb.certificates = jsonDb.certificates.filter(c => !(c.usuario_cedula === cedula && c.curso_id === courseId));
        });

        saveJsonDb();
        resolve({ success: true });
      } catch (e) {
        reject(e);
      }
    }
  });
}

module.exports = {
  initDB,
  getUser,
  createUser,
  getModules,
  getUserProgress,
  saveProgress,
  submitExam,
  getExamStatus,
  createCertificate,
  getCertificate,
  getCertificateByCedula,
  getCertificatesCount,
  seedQuestions, // Exported for the exam grading script
  getExamQuestions,
  getExamQuestionsWithAnswers,
  getCourses,
  enrollUserInCourse,
  getAdminMetrics,
  getAdminUsers,
  getStudentCourses,
  createCourse,
  updateUserCourses
};
