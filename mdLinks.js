const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');
const axios = require('axios');

const route = "files";

// export const mdLinks = (route) => {
const mdLinks = (route, options) => {
    return new Promise((resolve, reject) => {
        // if (options == 'true') {
        //     const properties = routeExistence(route)

        // }

        resolve(routeExistence(route))
        //¿LA RUTA ES VALIDA?
        //IDENTIFICAR ARCHIVOS MD
        //LEER AQUELLOS ARCHIVOS MD Y BUSCAR URL
        // CREAR UN ARRAY DE OBJETOS, CADA OBJETO ES UNA URL CON HREF FILE TEXT STATUS Y OK/FAIL
        //POR CADA ARCHIVO MD QUE CONTENGA URL GUARDAR EN UN ARRAY DE OBJETOS
        // ARRAY DE OBJETOS FINAL
        // Y CUANDP YA ESTÉ RESUELTO... FINALIZA CON RESOLVE QUE CONTIENE UN ARRAY DE OBJETOS
        //CUANDO OPTIONS ES FALSE EL ARRAY DE OBJETOS SOLO DEVUELVE HREF, FILE Y TEXT, CUANDO ES TRUE AGREGA STATUS Y OK
        // CUANDO OPTIONS ES -STATS DEVUELVE TOTAL DE URLs Y URLs UNICAS
        // CUANDO OPTIONS ES AMBOS DEVUELVE TOTAL DE URLs, URLs UNICAS Y URLs ROTAS
        // resolve()
        ///...
        //...
        reject(err)
    });
}
//---FUNCION PARA IDENTIFICAR SI LA RUTA EXISTE O NO EN EL SISTEMA DE ARCHIVOS---
const routeExistence = (route) => {
    const exists = promisify(fs.exists);
    exists(route)
        .then((exist) => {
            if (exist) {
                console.log('Route exists')
                //¿ES UN DIRECTORIO O UN ARCHIVO? - RECURSIVIDAD
                identify(route) //RETORNA UN OBJETO PROVENIENTE DE SEARCHURL

                //llamar a la función de ¿Es un directorio?
            } else {
                //ruta no existe en el sistema de archivos
                console.log('Route does not exist')
            }
        })
}
//-----FUNCION PARA IDENTIFICAR SI ES UN ARCHIVO O UN DIRECTORIO-----------
const identify = (route) => {
    return new Promise((resolve, reject) => {
        fs.lstat(route, (err, inf) => {
            if (err) {
                reject('Path-is-not-a-directory/file')
            }
            if (inf.isFile()) {
                console.log(`¿Is file?: ${inf.isFile()}`);
                resolve(extName(route))
            }
            if (inf.isDirectory()) {
                console.log(`¿Is directory?: ${inf.isDirectory()}`);
                resolve(directory(route))
            }
        })
    })
}
//-----------------------------------------FILE----------------------------------------
//-----FUNCION PARA IDENTIFICAR SI ES UN ARCHIVO .MD-------
const extName = (route) => {
    return new Promise((resolve, reject) => {
        const extName = path.extname(route);
        if (extName != '.md') {
            //no es un archivo .md, no se puede leer
            reject('Path-is-not-a-file-.md');
        } else if ((extName == '.md')) {
            //leer el archivo md y buscar las url
            console.log('It is a .md archive')
            resolve(searchURL(route));
        }
    })
}
//------------FUNCION PARA OBTENER EL CONTENIDO DEL ARCHIVO .MD --------------
const readFile = (route) => {
    return new Promise((resolve, reject) => {
        fs.readFile(route, 'utf8', (err, data) => {
            if (err) {
                reject('File-could-not-be-read')
            } else {
                resolve(data)
            }
        })
    })
}

//--FUNCION QUE RECORRE TODO EL MD Y POR CADA LINK CREA UN OBJETO CON SUS PROPIEDADES
const fileRound = (links, routeFile, data) => {
    links.forEach(function (link) {
        axios.get(link)
            .then(function (response) {
                const URLFile = {
                    href: link,
                    text: data.match(/\[([^()]*[^()]*)\]/)[0],
                    file: routeFile,
                    Status: response.status,
                    StatusText: response.statusText,
                    okFail: 'ok',
                }
                console.log(URLFile)
                return URLFile
            })
            .catch(err => {
                if (err.response) {
                    const URLFile = {
                        href: link,
                        text: data.match(/\[([^()]*[^()]*)\]/)[0],
                        file: routeFile,
                        Status: err.response.status,
                        StatusText: err.response.statusText,
                        okFail: 'fail',
                    }
                    console.log(URLFile)
                    return URLFile
                }
            });
    })
}
//------FUNCIÓN PARA BUSCAR URLs EN UN ARCHIVO .MD--------
const searchURL = (route) => {
    return new Promise((resolve, reject) => {
        readFile(route)
            .then((data) => {
                const { links } = markdownLinkExtractor(data);
                if (links.length >= 1) {

                    const objectForRoute = fileRound(links, route, data);
                    //    console.log(objectForRoute);
                    resolve(objectForRoute)
                }
            })
            .catch((err) => {
                reject(err)
            })
    })
}

//-----------------------------------DIRECTORY-------------------------------
//---------FUNCION QUE LEE UN DIRECTORIO / FUNCION RECURSIVA--------
const directory = (route) => {
    return new Promise((resolve, reject) => {
        let dirBuf = Buffer.from(route);
        fs.readdir(dirBuf, (err, files) => {
            if (err) {
                reject('Could-not-read-directory');
            } else {
                files.forEach(function (file) {
                    switch (path.extname(file)) {
                        case '.md': {
                            resolve(searchURL(`${route}/${file}`));
                            break
                        }
                        case '': {
                            resolve(directory(`${route}/${file}`));
                            break
                        }
                    }
                })
            }
        })
    })
}

mdLinks(route);