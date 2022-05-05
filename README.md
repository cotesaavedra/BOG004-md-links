# Markdown Links

## Índice

* [1. ¿Qué es md-links?](#1-¿Qué-es-md-links?)
* [2. Instalación](#2-Instalación)
* [3. Comandos](#3-Comandos)
* [4. Retornos](#4-Retornos)


***

## 1. ¿Qué es md-links?
Md-links es una librería que le permitirá obtener información de los links que están presentes en sus archivos Markdown (.md). Es una librería que lee archivos md, busca los links y muestra información como la ruta en la que fué encontrado el link, su status http, entre otros.


## 2. Instalación

Para instalar la librería deberá escribir el siguiente comando en la terminal: 
`npm i md-links-cotesaavedra`

Una vez instalada ya puede comenzar a utilizarla.

## Comandos

Para utilizar la librería deberá escribir la siguiente línea de comandos: 

`md-links <path-to-file> --validate --stats`

Donde:
`md-links`: Hace referencia a la llamada de la librería
`<path-to-file>`: Hace referencia a la ruta a un archivo o directorio de la que quiere obtener los links. (El archivo debe ser un .md, al no serlo no podrá ser leido).
`--validate`: Un booleano. Este argumento puede estar presente (true) o no (false), nos proporciona información detallada de la url, como: status Http, ruta de la que proviene, entre otros. 
`--stats`: Un booleano. Este argumento puede estar presente (true) o no (false), nos proporciona estadísticas generales de todo el archivo/directorio leito, como número total de URLs encontradas, o links rotos.

### Retornos

##### `--validate`

Con `validate:false` :

* `href`: URL encontrada.
* `text`: Texto que aparecía dentro del link (`<a>`).
* `file`: Ruta del archivo donde se encontró el link.

Con `validate:true` :

* `href`: URL encontrada.
* `text`: Texto que aparecía dentro del link (`<a>`).
* `file`: Ruta del archivo donde se encontró el link.
* `status`: Código de respuesta HTTP.
* `ok`: Mensaje `fail` en caso de fallo u `ok` en caso de éxito.

#### Ejemplo (resultados como comentarios)

```js
mdLinks ./some/example.md
    // => [{ href, text, file }, ...]


mdLinks ./some/example.md --validate
    // => [{ href, text, file, status, ok }, ...]

mdLinks ./some/dir
    // => [{ href, text, file }, ...]

```

##### `--stats`

Si pasa la opción `--stats` el output (salida) será un texto con estadísticas básicas sobre los links.

```sh
$ md-links ./some/example.md --stats
Total: 3
Unique: 3
```

También puede combinar `--stats` y `--validate` para obtener estadísticas que necesiten de los resultados de la validación.

```sh
$ md-links ./some/example.md --stats --validate
Total: 3
Unique: 3
Broken: 1
```