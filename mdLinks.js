const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');
const axios = require('axios');

const route = process.argv[2];
const options = process.argv[3];
// export const mdLinks = (route) => {
const mdLinks = (route, options) => {
    return new Promise((resolve, reject) => {
        if (options === '--validate') {
            resolve(routeExistence(route))
        } else if (!options || options != '--validate') {
            resolve(routeExistence(route))
        } else if (options === '--stats') {
            // ESTADISTICAS TOTAL Y UNICOS
        } else if (options === '--stats --validate' || options === '--validate --stats'){
             // ESTADISTICAS TOTAL, UNICOS Y ROTOS
        }
        //     // ARRAY DE OBJETOS FINAL
        //     // Y CUANDP YA ESTÉ RESUELTO... FINALIZA CON RESOLVE QUE CONTIENE UN ARRAY DE OBJETOS
        //     //CUANDO OPTIONS ES FALSE EL ARRAY DE OBJETOS SOLO DEVUELVE HREF, FILE Y TEXT, CUANDO ES TRUE AGREGA STATUS Y OK
        //     // CUANDO OPTIONS ES -STATS DEVUELVE TOTAL DE URLs Y URLs UNICAS
        //     // CUANDO OPTIONS ES AMBOS DEVUELVE TOTAL DE URLs, URLs UNICAS Y URLs ROTAS
        reject(err)
    })
}

//---FUNCION PARA IDENTIFICAR SI LA RUTA EXISTE O NO EN EL SISTEMA DE ARCHIVOS---
const routeExistence = (route) => {
    return new Promise((resolve, reject) => {
        const exists = promisify(fs.exists);
        exists(route)
            .then((exist) => {
                if (exist) {
                    resolve(identify(route)) //RETORNA UN OBJETO PROVENIENTE DE SEARCHURL

                } else {
                    console.log('Route does not exist')
                    reject('Route does not exist') //ruta no existe en el sistema de archivos
                }
            })
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
                resolve(extName(route))
            }
            if (inf.isDirectory()) {
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
            reject('Path-is-not-a-file-.md');//no es un archivo .md, no se puede leer
        } else if ((extName == '.md')) {
            console.log('It is a .md archive'); //leer el archivo md y buscar las url
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
                            searchURL(`${route}/${file}`)
                                .then((objectForRoute) => {
                                    const object = objectForRoute
                                    resolve(object)
                                })
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

mdLinks(route, options);