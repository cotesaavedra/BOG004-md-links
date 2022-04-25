const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');

const route = "file";

// export const mdLinks = (route) => {
const mdLinks = (route) => {
    // return new Promise((resolve, reject) => {
    //¿LA RUTA ES VALIDA?
    //-----------VALIDANDO SI ES UNA RUTA EXISTENTE O NO EN EL SISTEMA DE ARCHIVOS--------------
    const exists = promisify(fs.exists);
    exists(route)
        .then((exist) => {
            if (exist) {
                console.log('Route exists')
                //¿ES UN DIRECTORIO O UN ARCHIVO? - RECURSIVIDAD
                identify(route)
                    .then((typeRoute) => {
                        if (typeRoute === 'Directory') {
                            //LEER EL DIRECTORIO Y PREGUNTAR SI TIENE ARCHIVOS Y/O DIRECTORIOS
                            directory(route)
                        }
                        if (typeRoute === 'File') {
                            //IDENTIFICAR ARCHIVOS MD
                            extName(route)
                                .then((mdFile) => {
                                    if (mdFile == '.md') {
                                        searchURL(route)
                                    }
                                })
                        }
                    })
                //llamar a la función de ¿Es un directorio?
            } else {
                //ruta no existe en el sistema de archivos
                console.log('Route does not exist')
                console.log('ROUTE', route)
            }
        })
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
    // reject()
    // });
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
                // extName(route);
                resolve('File')
            }
            if (inf.isDirectory()) {
                console.log(`¿Is directory?: ${inf.isDirectory()}`);
                // directory(route);
                resolve('Directory')
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
        } else {
            //leer el archivo md y buscar las url
            console.log('It is a .md archive')
            resolve('.md');
            // searchURL(route);
        }
    })
}
//------------FUNCION PARA OBTENER EL CONTENIDO DEL ARCHIVO .MD --------------
const readFile = (route) => {
    return new Promise((resolve, reject) => {
        fs.readFile(route, 'utf8', (err, data) => {
            if(err){
                reject('File-could-not-be-read')
            } else {
                resolve(data)
            }
        })
    })
}
//------FUNCIÓN PARA BUSCAR URLs EN UN ARCHIVO .MD--------
const searchURL = (route) => {
    return new Promise((resolve, reject) => {
        readFile(route)
            .then((data) => {
                const { links } = markdownLinkExtractor(data);
                const fileObj = {
                    file: route,
                    numeroURLs: links.length,
                    URLs: links,
                    //text: data,
                }
                console.log('objeto del archivo', fileObj)
                console.log('************')
                resolve(fileObj)
                // if (links.length === 0) {
                //     console.log(`El archivo: ${route} no tiene URLs`)
                //     resolve(route, data, links)
                // } else {
                //     console.log(`Se encontraron ${links.length} URLs en ${route}`)
                //     resolve(route, links, data)
                // }
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