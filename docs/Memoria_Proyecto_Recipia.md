# MEMORIA DEL PROYECTO --- RECIPIA

## 1. Descripción del proyecto

Recipia es una aplicación web para gestionar y consultar recetas de
cocina, organizar sus ingredientes y generar listas de la compra a
partir de diferentes recetas.

El objetivo es disponer de una aplicación que permita almacenar recetas,
clasificarlas por categorías, controlar quién puede consultarlas y
facilitar la preparación de comidas mediante listas de la compra con
cantidades adaptadas al número de comensales.

El proyecto se desarrollará inicialmente como un backend que
proporcionará una API REST para gestionar toda la información de la
aplicación.

### 1.1. Tecnologías

  Tecnología   Utilización
  ------------ -----------------------------------------
  Node.js      Entorno de ejecución de JavaScript.
  Express      Framework para desarrollar la API REST.
  MongoDB      Base de datos NoSQL.
  Mongoose     Modelado de datos y validaciones.
  bcrypt       Cifrado de contraseñas.
  JWT          Autenticación mediante tokens.
  Jest         Pruebas unitarias.

El proyecto utilizará módulos ES de JavaScript.

------------------------------------------------------------------------

# 2. Usuarios y permisos

La aplicación tendrá dos roles de usuario: `user` y `admin`.

## 2.1. Usuario (`user`)

El usuario registrado podrá:

-   Consultar recetas públicas.
-   Consultar recetas con visibilidad `friends` cuando esté incluido en
    la lista de usuarios autorizados.
-   Consultar las reseñas de las recetas a las que tenga acceso.
-   Publicar reseñas en las recetas que pueda consultar.

No podrá:

-   Crear, modificar ni eliminar recetas.
-   Crear, modificar ni eliminar categorías.
-   Gestionar usuarios autorizados para consultar recetas.
-   Crear ni gestionar listas de la compra.
-   Modificar o eliminar sus propias reseñas.

## 2.2. Administrador (`admin`)

El administrador podrá:

-   Crear, consultar, modificar y eliminar recetas.
-   Consultar todas las recetas, independientemente de su visibilidad.
-   Gestionar las categorías.
-   Gestionar los usuarios autorizados para consultar recetas.
-   Eliminar cualquier reseña.
-   Crear, consultar, modificar y eliminar listas de la compra.
-   Añadir, modificar y eliminar ingredientes de las listas.
-   Marcar ingredientes como comprados.

## 2.3. Registro y autenticación

La aplicación dispondrá de un sistema de registro e inicio de sesión.

Características:

-   Las contraseñas se almacenarán cifradas mediante bcrypt.
-   La autenticación se realizará mediante JWT.
-   El registro público asignará siempre el rol `user`.
-   No se permitirá que un usuario se asigne el rol `admin` durante el
    registro.
-   Las rutas protegidas comprobarán que el usuario está autenticado.
-   Las operaciones administrativas comprobarán que el usuario tiene el
    rol `admin`.

------------------------------------------------------------------------

# 3. Gestión de recetas

Las recetas serán gestionadas exclusivamente por el administrador.

## 3.1. Datos generales de una receta

  -----------------------------------------------------------------------
  Campo                   Tipo                    Descripción
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Identificador de la
                                                  receta.

  `name`                  String                  Nombre de la receta.
                                                  Obligatorio.

  `description`           String                  Descripción de la
                                                  receta. Opcional.

  `origin`                String                  Procedencia de la
                                                  receta. Opcional.

  `url`                   String                  URL de origen, cuando
                                                  proceda de Internet.

  `category`              ObjectId                Referencia a la
                                                  categoría. Obligatorio.

  `difficulty`            String                  Dificultad: `easy`,
                                                  `medium` o `hard`.

  `preparationTime`       Number                  Tiempo de preparación
                                                  en minutos.

  `cookingTime`           Number                  Tiempo de cocción en
                                                  minutos.

  `servings`              Number                  Número de comensales.

  `notes`                 String                  Observaciones
                                                  adicionales.

  `visibility`            String                  Nivel de visibilidad de
                                                  la receta.

  `authorizedUsers`       Array de ObjectId       Usuarios autorizados
                                                  para consultar la
                                                  receta.

  `createdAt`             Date                    Fecha de creación.

  `updatedAt`             Date                    Fecha de última
                                                  modificación.
  -----------------------------------------------------------------------

### Procedencia de las recetas

El campo `origin` permitirá indicar libremente de dónde procede una
receta. Algunos ejemplos son:

-   Mi madre.
-   Curso de cocina.
-   Internet.
-   Prima Cruci.

El campo `url` permitirá registrar la dirección web original cuando la
receta proceda de Internet.

No se gestionarán fotografías individuales de las recetas. Se utilizarán
ilustraciones genéricas asociadas a sus categorías.

## 3.2. Visibilidad de las recetas

Cada receta tendrá uno de estos tres niveles de visibilidad:

  -----------------------------------------------------------------------
  Valor                               Descripción
  ----------------------------------- -----------------------------------
  `public`                            Cualquier persona puede consultar
                                      la receta, incluso sin iniciar
                                      sesión.

  `friends`                           Solo los usuarios registrados
                                      incluidos en la lista de usuarios
                                      autorizados pueden consultar la
                                      receta.

  `private`                           Exclusivamente los administradores
                                      pueden consultar la receta.
  -----------------------------------------------------------------------

El administrador podrá consultar todas las recetas, independientemente
de su visibilidad.

### Usuarios autorizados

El campo `authorizedUsers` almacenará los identificadores de los
usuarios que pueden consultar una receta con visibilidad `friends`.

El administrador será el encargado de gestionar esta lista.

No existirá un sistema de amistades, seguidores ni solicitudes de
amistad. El valor `friends` representa únicamente una lista explícita de
usuarios autorizados.

## 3.3. Ingredientes de las recetas

Los ingredientes estarán almacenados como subdocumentos dentro de cada
receta. No se creará una colección independiente para los ingredientes.

Cada ingrediente tendrá:

  -----------------------------------------------------------------------
  Campo                   Tipo                    Descripción
  ----------------------- ----------------------- -----------------------
  `name`                  String                  Nombre del ingrediente.
                                                  Obligatorio.

  `quantity`              Number                  Cantidad. Obligatoria y
                                                  admite decimales.

  `unit`                  String                  Unidad de medida.
                                                  Obligatoria.

  `section`               String                  Sección del
                                                  supermercado. Opcional.

  `observations`          String                  Observaciones.
                                                  Opcional.

  `optional`              Boolean                 Indica si el
                                                  ingrediente es
                                                  opcional. Obligatorio.
  -----------------------------------------------------------------------

### Unidades de medida

Se utilizará un conjunto cerrado de unidades:

  Código    Significado
  --------- --------------
  `g`       Gramos
  `kg`      Kilogramos
  `ml`      Mililitros
  `l`       Litros
  `unit`    Unidades
  `tbsp`    Cucharadas
  `tsp`     Cucharaditas
  `pinch`   Pizcas

### Identificación de ingredientes

Los ingredientes se considerarán diferentes cuando sus nombres sean
diferentes.

Por ejemplo:

-   Tomate.
-   Tomate natural.
-   Tomate triturado.
-   Tomate cherry.

No se agruparán automáticamente aunque puedan parecer ingredientes
similares.

El campo `section` permitirá clasificar los ingredientes por secciones
del supermercado, como fruta y verdura, carnicería, pescadería, lácteos
o despensa.

## 3.4. Pasos de elaboración

Los pasos de elaboración estarán almacenados como subdocumentos dentro
de cada receta.

Cada paso tendrá:

  Campo           Tipo     Descripción
  --------------- -------- ---------------------------------------------
  `order`         Number   Orden del paso. Obligatorio.
  `description`   String   Descripción de la elaboración. Obligatorio.

Los pasos se mostrarán siguiendo el orden establecido.

## 3.5. Reseñas de las recetas

Las reseñas estarán almacenadas dentro de cada receta.

Cada reseña tendrá exactamente tres campos:

  -----------------------------------------------------------------------
  Campo                   Tipo                    Descripción
  ----------------------- ----------------------- -----------------------
  `userId`                ObjectId                Identificador del
                                                  usuario que publica la
                                                  reseña.

  `text`                  String                  Texto de la reseña.

  `createdAt`             Date                    Fecha de publicación.
  -----------------------------------------------------------------------

No se almacenará el nombre ni el correo electrónico del usuario en la
reseña. Para mostrar el autor se recuperará su información mediante la
referencia `userId`.

### Reglas de funcionamiento

-   Los usuarios registrados con acceso a una receta podrán publicar
    reseñas.
-   Un usuario podrá publicar tantas reseñas como quiera en una misma
    receta.
-   Cada publicación generará una nueva reseña.
-   Los usuarios no podrán modificar ni eliminar sus propias reseñas.
-   El administrador podrá eliminar cualquier reseña.
-   Las reseñas heredarán la visibilidad de la receta a la que
    pertenecen.
-   No se contempla que el administrador publique reseñas.

------------------------------------------------------------------------

# 4. Gestión de categorías

Las categorías tendrán una colección independiente denominada
`categories`.

Cada categoría tendrá:

  -----------------------------------------------------------------------
  Campo                   Tipo                    Descripción
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Identificador de la
                                                  categoría.

  `name`                  String                  Nombre de la categoría.
                                                  Obligatorio y único.

  `description`           String                  Descripción de la
                                                  categoría. Opcional.

  `illustration`          String                  Identificador de la
                                                  ilustración genérica.
                                                  Obligatorio.

  `isActive`              Boolean                 Indica si la categoría
                                                  está activa. Por
                                                  defecto `true`.

  `createdAt`             Date                    Fecha de creación.

  `updatedAt`             Date                    Fecha de modificación.
  -----------------------------------------------------------------------

Ejemplos de categorías:

-   Entrantes.
-   Ensaladas.
-   Carnes.
-   Pescados.
-   Pasta.
-   Postres.
-   Bebidas.

El administrador podrá crear, consultar, modificar y eliminar
categorías.

El campo `isActive` permitirá desactivar una categoría sin necesidad de
eliminarla físicamente.

Las recetas utilizarán ilustraciones genéricas asociadas a su categoría.
No se gestionarán fotografías individuales.

------------------------------------------------------------------------

# 5. Gestión de listas de la compra

Las listas de la compra serán una funcionalidad exclusiva del
administrador. Los usuarios normales no podrán consultar ni gestionar
listas.

## 5.1. Creación de listas

El administrador podrá seleccionar varias recetas para generar una lista
de la compra conjunta.

El funcionamiento será:

1.  El administrador selecciona las recetas que quiere incluir.
2.  Cada receta utilizará inicialmente su número original de comensales.
3.  Si lo desea, el administrador podrá indicar un número diferente de
    comensales para cada receta.
4.  La aplicación calculará las cantidades correspondientes.
5.  Se consolidarán los ingredientes compatibles.
6.  Se generará una lista agrupada por secciones del supermercado.
7.  La lista se guardará en MongoDB.

## 5.2. Adaptación de cantidades

Las cantidades de los ingredientes se calcularán proporcionalmente al
número de comensales.

Por ejemplo, una receta para 4 personas que utiliza 200 gramos de harina
necesitará 300 gramos para 6 personas:

`200 × (6 / 4) = 300 gramos`.

Por defecto se utilizará el número original de comensales de cada
receta. Solo será necesario indicar otro número cuando se quiera
modificar.

Se permitirán cantidades decimales y no se realizará ningún redondeo
automático.

## 5.3. Consolidación de ingredientes

Los ingredientes se agruparán cuando coincidan sus nombres y sus
unidades sean compatibles.

Ejemplo:

-   Receta 1: 200 g de harina.
-   Receta 2: 300 g de harina.
-   Resultado: 500 g de harina.

No se agruparán ingredientes con nombres diferentes. La consolidación
tendrá en cuenta también las unidades de medida.

## 5.4. Conversión de unidades

Para poder consolidar ingredientes, se convertirán las unidades
compatibles a una unidad común.

Las conversiones automáticas permitidas serán exclusivamente:

  Conversión   Equivalencia
  ------------ ----------------
  kg a g       1 kg = 1.000 g
  g a kg       1.000 g = 1 kg
  l a ml       1 l = 1.000 ml
  ml a l       1.000 ml = 1 l

No se realizarán conversiones entre:

-   Cucharadas y cucharaditas.
-   Cucharadas y gramos.
-   Cucharaditas y mililitros.
-   Pizcas y otras unidades.
-   Unidades y medidas de peso o volumen.

Cuando se consoliden cantidades compatibles, el resultado se mostrará
utilizando una unidad cómoda. No se aplicarán redondeos automáticos.

## 5.5. Datos de una lista de la compra

Las listas tendrán una colección independiente denominada
`shoppingLists`.

Cada lista tendrá:

  -----------------------------------------------------------------------
  Campo                   Tipo                    Descripción
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Identificador de la
                                                  lista.

  `userId`                ObjectId                Referencia al
                                                  administrador que crea
                                                  la lista.

  `name`                  String                  Nombre de la lista.

  `recipes`               Array de ObjectId       Identificadores de las
                                                  recetas seleccionadas.

  `items`                 Array de subdocumentos  Ingredientes
                                                  consolidados de la
                                                  lista.

  `createdAt`             Date                    Fecha de creación.

  `updatedAt`             Date                    Fecha de modificación.
  -----------------------------------------------------------------------

### Relación con las recetas

Se almacenarán los identificadores de las recetas seleccionadas para
conservar la referencia a su origen.

No se guardará una copia completa de las recetas originales ni un
historial de sus modificaciones.

Los ingredientes y las cantidades calculados se almacenarán directamente
en la lista.

Por tanto, una vez generada, la lista será independiente de las recetas
originales. Si posteriormente se modifica una receta, las listas ya
creadas no se actualizarán automáticamente.

## 5.6. Ingredientes de las listas

Cada elemento de `items` tendrá:

  Campo            Tipo      Descripción
  ---------------- --------- -------------------------------------------
  `name`           String    Nombre del ingrediente. Obligatorio.
  `quantity`       Number    Cantidad. Opcional.
  `unit`           String    Unidad de medida. Opcional.
  `section`        String    Sección del supermercado. Opcional.
  `observations`   String    Observaciones. Opcional.
  `purchased`      Boolean   Indica si ya se ha comprado. Obligatorio.

La cantidad y la unidad podrán estar vacías cuando se añada manualmente
un ingrediente sin esos datos.

## 5.7. Gestión de listas

El administrador podrá:

-   Crear listas a partir de varias recetas.
-   Consultar las listas guardadas.
-   Modificar el nombre de una lista.
-   Añadir ingredientes manualmente.
-   Modificar ingredientes.
-   Modificar cantidades y unidades.
-   Eliminar ingredientes.
-   Marcar ingredientes como comprados.
-   Eliminar listas.

Las listas se gestionarán dentro de la aplicación. La exportación a TXT
queda pospuesta para una fase posterior.

------------------------------------------------------------------------

# 6. Modelo de datos MongoDB

La base de datos tendrá cuatro colecciones principales:

  Colección         Responsabilidad
  ----------------- --------------------------------------------------
  `users`           Usuarios, credenciales y roles.
  `categories`      Categorías de las recetas.
  `recipes`         Recetas, ingredientes, pasos y reseñas.
  `shoppingLists`   Listas de la compra e ingredientes consolidados.

## 6.1. Relaciones entre colecciones

Se utilizarán referencias mediante ObjectId:

  Colección y campo             Colección relacionada
  ----------------------------- -----------------------
  `recipes.category`            `categories`
  `recipes.authorizedUsers[]`   `users`
  `recipes.reviews[].userId`    `users`
  `shoppingLists.userId`        `users`
  `shoppingLists.recipes[]`     `recipes`

## 6.2. Subdocumentos

Se utilizarán subdocumentos embebidos para:

-   `recipes.ingredients[]`
-   `recipes.steps[]`
-   `recipes.reviews[]`
-   `shoppingLists.items[]`

No se crearán colecciones independientes para ingredientes, pasos ni
reseñas.

------------------------------------------------------------------------

# 7. API REST

El backend expondrá una API REST para gestionar los recursos de la
aplicación.

Las rutas estarán organizadas separando responsabilidades entre rutas,
controladores y modelos.

## 7.1. Autenticación

La API permitirá:

-   Registrar usuarios.
-   Iniciar sesión.
-   Obtener la información del usuario autenticado cuando sea necesario.

## 7.2. Usuarios

Permitirá:

-   Consultar usuarios para su gestión administrativa.
-   Gestionar los usuarios autorizados para consultar recetas.

## 7.3. Categorías

Permitirá:

-   Crear categorías.
-   Consultar categorías.
-   Consultar una categoría concreta.
-   Modificar categorías.
-   Eliminar categorías.

## 7.4. Recetas

Permitirá:

-   Crear recetas.
-   Consultar recetas.
-   Consultar una receta por su identificador.
-   Modificar recetas.
-   Eliminar recetas.
-   Consultar recetas según su visibilidad y los permisos del usuario.

## 7.5. Reseñas

Permitirá:

-   Publicar reseñas.
-   Consultar reseñas.
-   Eliminar reseñas mediante permisos de administrador.

## 7.6. Listas de la compra

Permitirá:

-   Crear listas a partir de recetas.
-   Consultar listas.
-   Consultar una lista concreta.
-   Modificar listas.
-   Añadir ingredientes.
-   Modificar ingredientes.
-   Eliminar ingredientes.
-   Marcar ingredientes como comprados.
-   Eliminar listas.

------------------------------------------------------------------------

# 8. Seguridad y control de permisos

La API comprobará los permisos necesarios antes de ejecutar las
operaciones.

Se aplicarán las siguientes reglas:

-   Las rutas privadas exigirán autenticación mediante JWT.
-   Las operaciones administrativas exigirán el rol `admin`.
-   Las recetas públicas podrán consultarse sin autenticación.
-   Los usuarios registrados solo podrán consultar las recetas `friends`
    para las que estén autorizados.
-   Las recetas `private` solo podrán consultarlas los administradores.
-   Los usuarios no podrán crear, modificar ni eliminar recetas.
-   Los usuarios no podrán gestionar categorías.
-   Los usuarios solo podrán publicar reseñas en recetas a las que
    tengan acceso.
-   Los usuarios no podrán modificar ni eliminar sus propias reseñas.
-   El administrador podrá eliminar cualquier reseña.
-   Las listas de la compra serán accesibles exclusivamente para
    administradores.

------------------------------------------------------------------------

# 9. Validaciones y gestión de errores

Los esquemas Mongoose incluirán validaciones para garantizar la
integridad de los datos.

Se utilizarán, según corresponda:

-   `required`: campos obligatorios.
-   `enum`: valores permitidos.
-   `min` y `max`: límites numéricos.
-   `unique`: valores únicos.
-   Valores por defecto.
-   Validaciones de formatos y referencias.

La API dispondrá de un sistema centralizado de gestión de errores.

Se contemplarán, como mínimo, los siguientes códigos HTTP:

  Código   Significado
  -------- -----------------------------------------------
  200      Operación realizada correctamente.
  201      Recurso creado correctamente.
  400      Datos incorrectos o petición no válida.
  401      Usuario no autenticado.
  403      Usuario autenticado sin permisos suficientes.
  404      Recurso no encontrado.

------------------------------------------------------------------------

# 10. Pruebas unitarias

Las pruebas unitarias se realizarán utilizando **Jest**.

La primera fase deberá incluir al menos cuatro pruebas unitarias sin
conexión a la base de datos.

Se probarán, entre otros:

-   Middleware de autenticación.
-   Middleware de comprobación del rol de administrador.
-   Funciones propias de validación.
-   Funciones de lógica de negocio.

Para las pruebas de middleware se utilizarán objetos simulados de
petición y respuesta (`req` y `res`).

------------------------------------------------------------------------

# 11. Estructura y organización del backend

El proyecto seguirá una arquitectura modular que permita separar las
distintas responsabilidades.

Se organizará diferenciando:

-   **Models:** definición de los esquemas Mongoose y los modelos de
    MongoDB.
-   **Routes:** definición de los endpoints de la API.
-   **Controllers:** gestión de las peticiones y respuestas HTTP.
-   **Middlewares:** autenticación, autorización y tratamiento de
    errores.
-   **Services:** lógica de negocio que requiera una separación
    específica.
-   **Utils:** funciones auxiliares reutilizables.
-   **Tests:** pruebas unitarias con Jest.

La organización definitiva de carpetas y archivos se concretará durante
el diseño técnico del backend.

------------------------------------------------------------------------

# 12. Funcionalidades fuera del alcance de la primera fase

Se dejan expresamente para una fase posterior las siguientes
funcionalidades:

### 12.1. Infografías de recetas

Generación de infografías visuales a partir de los datos de las recetas.

### 12.2. Documentos PDF

Generación de documentos PDF con la información de las recetas.

### 12.3. Exportación de listas de la compra a TXT

Exportación de las listas de la compra a archivos de texto para poder
utilizarlas, por ejemplo, con Google Keep.

Estas funcionalidades no se incluirán en los modelos ni en los endpoints
iniciales.

------------------------------------------------------------------------

# 13. Alcance final de la primera fase

La primera versión de CookBook incluirá:

1.  Registro e inicio de sesión de usuarios.
2.  Autenticación mediante JWT.
3.  Cifrado de contraseñas con bcrypt.
4.  Gestión de roles `user` y `admin`.
5.  Gestión de categorías.
6.  Creación, consulta, modificación y eliminación de recetas por parte
    del administrador.
7.  Gestión de ingredientes y pasos de elaboración dentro de las
    recetas.
8.  Control de visibilidad de recetas: `public`, `friends` y `private`.
9.  Gestión de usuarios autorizados para consultar recetas.
10. Publicación de reseñas por parte de usuarios registrados.
11. Eliminación de reseñas por parte del administrador.
12. Creación y gestión de listas de la compra.
13. Adaptación de cantidades según el número de comensales.
14. Consolidación de ingredientes compatibles.
15. Conversión de unidades de peso y volumen acordadas.
16. Agrupación de ingredientes por sección del supermercado.
17. Gestión manual de ingredientes de las listas.
18. Control de ingredientes comprados.
19. API REST con validaciones y control de permisos.
20. Gestión centralizada de errores.
21. Pruebas unitarias mediante Jest.

## Objetivo de la primera fase

Disponer de un backend funcional, organizado y seguro que permita
gestionar usuarios, categorías, recetas, reseñas y listas de la compra.

La arquitectura y los modelos de datos deberán permitir ampliar la
aplicación en futuras fases sin tener que replantear la estructura
principal del proyecto.
