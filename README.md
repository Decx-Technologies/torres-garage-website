# Torres Garage 1.0.0

Web cliente y administrador para catálogo de vehículos. Release local del 22 de noviembre de 2026.

## Iniciar

1. Instala Node.js 24 LTS. Esta versión se verificó con Node.js 24.22.3.
2. Extrae el ZIP en una carpeta propia. No requiere instalar paquetes adicionales.
3. En Windows, abre INICIAR.cmd. También puedes ejecutar `node server.mjs` desde la carpeta del programa.
4. Abre http://127.0.0.1:5173/ para el cliente o http://127.0.0.1:5173/admin para administrar.
5. En una instalación nueva, crea tu contraseña de administrador, de al menos 12 caracteres. No hay contraseña predeterminada.

## Funciones

Catálogo con fotografías, precios BOB/USD, ofertas y videos; ruleta configurable de hasta cinco vehículos; temas claro/oscuro y Garage Run. El administrador gestiona vehículos, vendidos, acuerdos privados, cierres y comisiones con cobros en distintas monedas.

Las listas técnicas consultan fuentes gratuitas, con compatibilidad según la configuración disponible. La cobertura depende de cada fuente. Confirma la documentación de cada unidad.

El botón de precio de referencia consulta una IA gratuita y devuelve venta rápida, precio justo y venta lenta. No necesita cuenta, clave ni copiar respuestas. Requiere internet; puede haber límites temporales o indisponibilidad. Los importes son estimaciones de IA, no anuncios verificados ni ventas cerradas.

Torres 360 utiliza fotos exteriores ordenadas y panorámicas interiores esféricas 2:1. Incluye guía de captura, puntos de navegación, zoom y vista ampliada. La demo fotográfica tiene un interior real; su exterior está pendiente. No es un vehículo en venta y no se inventan fotografías faltantes. Las atribuciones están en la ficha y en los archivos de los recursos.

## Datos y actualizaciones

El programa crea `data/` para guardar inventario, fotografías subidas, acceso y datos privados. El ZIP no contiene los datos de la instalación del propietario.

Para actualizar una instalación existente: detén el programa, conserva una copia de su carpeta `data/`, reemplaza los archivos del programa por los de este release y conserva `data/` en su ubicación original. Reinicia desde la carpeta del programa. No ejecutes dos instancias sobre la misma carpeta de datos.

Los acuerdos y comisiones no se entregan en el catálogo público. Resguarda las copias de `data/`, porque sí contienen información privada.

La aplicación escucha solo en la computadora local (127.0.0.1). No está preparada ni publicada aquí como un servicio de internet. El contacto comercial requiere configurar su canal de envío.

## Verificación

Las 18 pruebas del release aprobaron. Para repetirlas, ejecuta `node --test` desde la carpeta extraída. El archivo `MANIFEST.sha256` permite verificar la integridad de los archivos distribuidos. Las limitaciones y novedades completas están en CHANGELOG.md.
