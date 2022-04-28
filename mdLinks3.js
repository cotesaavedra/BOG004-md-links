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
        } else if (!options === undefined) {
            // resolve(routeExistence(route))
            resolve('hola')
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
                    reject('Route does not exist') //ruta no existe en el sistema de archivos
                }
            })
    })
}
//-----FUNCION PARA IDENTIFICAR SI ES UN ARCHIVO O UN DIRECTORIO-----------
const identify = (route) => {
    return new Promise((resolve, reject) => {
        fs.lstat(route, (err, inf) => { //fs.lstat Es asincrona ya que consultamos la información de la ruta
            if (err) {
                reject('Path-is-not-a-directory/file')
            }
            if (inf.isFile()) { //inf.isFile devuelve un true/false
                resolve(extName(route))
            }
            if (inf.isDirectory()) {
                let directories = directory2(route);
                let arrayFilesStatus = directories.map(function (file) {
                    if (file.type === '.md') {
                        searchURL(file.file)
                            .then((objectForRoute) => {
                                const object = objectForRoute
                                console.log(objectForRoute)
                                arrayFilesStatus.push(...object)
                            })
                    }
                })
                
                // console.log('arrayFilesStatus', arrayFilesStatus)
                //resolve(directories)
                // resolve(directory(route))
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
    return new Promise((resolve, reject) => {
        let arrayLinks = []
        let arrayPromises = []
        links.forEach(function (link) {
            arrayPromises.push(axios.get(link))
        })

        Promise.allSettled(arrayPromises).then(responses => {
            responses.forEach(function (response) {
                // console.log(response.status)
                if (response.status === 'rejected') {
                    arrayLinks.push({
                        href: response.reason.config.url,
                        //text: data.match(/\[([^()]*[^()]*)\]/)[0],
                        // file: routeFile,
                        Status: response.reason.response.status,
                        //StatusText: response.value.statusText,
                        okFail: 'fail',
                    })
                } else if (response.status === 'fulfilled') {
                    // console.log('correcto')
                    // console.log(response.value.config.url)
                    // console.log(response.value.status)
                    arrayLinks.push({
                        href: response.value.config.url,
                        //text: data.match(/\[([^()]*[^()]*)\]/)[0],
                        // file: routeFile,
                        Status: response.value.status,
                        //StatusText: response.value.statusText,
                        okFail: 'ok',
                    })
                }
            });
            arrayLinks.forEach(function (file) {
                file.text = data.match(/\[([^()]*[^()]*)\]/)[0]
                file.file = routeFile
            })
            resolve(arrayLinks)
        }).catch((error) => {
            console.log('entramos error', error)
        })
    });
    //   console.log('arrayLinks', arrayLinks)
    // console.log('arraylinks', arrayLinks)
}

//------FUNCIÓN PARA BUSCAR URLs EN UN ARCHIVO .MD--------
const searchURL = (route) => {
    return new Promise((resolve, reject) => {
        readFile(route)
            .then((data) => {
                // console.log('data', data)
                const { links } = markdownLinkExtractor(data);
                // console.log(links)
                if (links.length >= 1) {
                    // const objectForRoute = fileRound(links, route, data);
                    // console.log('objectForRoute', objectForRoute)
                    // resolve(objectForRoute)
                    fileRound(links, route, data).then((resFile) => {
                        // console.log('resFile', resFile)
                        resolve(resFile)
                    })
                    // resolve(fileRound(links, route, data))
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
                                    console.log('resolve object---', objectForRoute);
                                    resolve(objectForRoute)
                                })
                            break
                        }
                        case '': {
                            console.log('resolve directory---');
                            resolve(directory(`${route}/${file}`));
                            break
                        }
                    }
                })
            }
        })
    })
}

const directory2 = (route) => {
    let objetos = []

    fileObjs = fs.readdirSync(route, { withFileTypes: true });
    fileObjs.forEach(file => {
        // console.log('***********', file.name);
        switch (path.extname(file.name)) {
            case '.md': {
                let ruta = `${route}/${file.name}`
                // console.log('ruta archivo', ruta)
                objetos.push({
                    'file': `${route}/${file.name}`,
                    'type': '.md'
                })
                break
            }
            case '': {
                let ruta = `${route}/${file.name}`
                // console.log('ruta directory', ruta)
                objetos.push({
                    'file': `${route}/${file.name}`,
                    'type': 'folder'
                })
                let respuesta = directory2(`${route}/${file.name}`)
                if (respuesta.length > 0) {
                    objetos.push(...respuesta)
                }
                break
            }
        }
    });
    return objetos
}

mdLinks(route, options).then((data) => {
    console.log('data', data)
}).catch((error) => {
    console.log('Error: ', error)
})