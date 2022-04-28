const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');
const axios = require('axios');
const { resolveCaa } = require('dns');

// let URL = 'https://google.com';
// let route = 'files';
// let data = 'hola [este es un text]';
// let options = true;
const route = process.argv[2];
const options = process.argv[3];

const mdLinks = (route, options) => {
    return new Promise((resolve, reject) => {
        if (options === '--validate') {
            resolve(initialFunction(route))
        } else if (!options || options != '--validate') {
            resolve(initialFunction(route))
        } else if (options === '--stats') {
            // ESTADISTICAS TOTAL Y UNICOS
        } else if (options === '--stats --validate' || options === '--validate --stats') {
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
const initialFunction = (route) => {
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
                resolve(fileExtension(route))
            }
            if (inf.isDirectory()) {
                resolve(directory(route))
            }
        })
    })
}


//FUNCION QUE ME IDENTIFICA SI ES MD O NO, Y SI ES MD ENTONCES BUSCA SUS URLs
const fileExtension = (route) => {
    return new Promise((resolve, reject) => {
        const extName = path.extname(route);
        if (extName != '.md') {
            reject('Path-is-not-a-file-.md');//no es un archivo .md, no se puede leer
        } else if ((extName == '.md')) {
            searchLinks(route)
                .then((links) => {
                    linkRound(links, route)
                        .then((response) => {
                            resolve(response)
                        })

                })
        }
    })
}
//FUNCION QUE LEE EL MD E IDENTIFICA LINKS Y DEVUELVE ARRAY DE LINKS
const searchLinks = (route) => {
    //readFile lee el contenido de la ruta, se asume que la ruta es a un archivo .md
    let arrayLinks = new Promise((resolve, reject) => {
        fs.readFile(route, 'utf8', (err, data) => {
            if (err) {
                reject('File-could-not-be-read')
            } else {
                const { links } = markdownLinkExtractor(data);
                resolve(links)
            }
        })
    })
    return arrayLinks
}
//MUESTRA UN OBJETO POR LINK DEPENDIENDO DEL OPTIONS
const ObjectForLink = (link, route) => {
    new Promise((resolve, reject) => {
        axios.get(link)
          .then((response) => {
            let objectValidate = propietiesLink(link, route);
            objectValidate['status'] = response.status;
            objectValidate['okFail'] = response.statusText;
            resolve(objectValidate)
          })
          .catch((err) => {
            let objectValidate = propietiesLink(link, route);
            objectValidate['status'] = err.response.status;
            objectValidate['okFail'] = err.response.statusText;
            resolve(objectValidate)
          })
        })
    
    // let objectPromise = '';
    // fs.readFile(route, 'utf8', (err, data) => {
    //     if (err) {
    //         reject('File-could-not-be-read')
    //     }
    //     objectPromise = new Promise((resolve, reject) => {
    //         axios.get(link)
    //             .then((response) => {
    //                 let objectValidate = propietiesLink(link, route, data);
    //                 objectValidate['status'] = response.status;
    //                 objectValidate['okFail'] = response.statusText;
    //                 resolve(objectValidate)
    //             })
    //             .catch((err) => {
    //                 let objectValidate = propietiesLink(link, route, data);
    //                 objectValidate['status'] = err.response.status;
    //                 objectValidate['okFail'] = err.response.statusText;
    //                 resolve(objectValidate)
    //             })
    //     })
    // })

    // return 'hola', objectPromise

}
//CREA UN OBJETO POR LINK CUANDO VALIDATE ES FALSE
const propietiesLink = (link, route) => {
    return URLFile = {
        href: link,
        file: route,
        // text: data.match(/\[([^()]*[^()]*)\]/)[0],
    }
}
//FUNCION QUE ME RECORRE LOS LINKS Y CREA UN OBJETO POR CADA LINK
const linkRound = (links, route) => {
    let linkRoundPromise = new Promise((resolve, reject) => {
        links.map(function (link) {
            ObjectForLink(link, route)
                .then((objectLinkvalidate) => {
                    console.log(objectLinkvalidate)
                    console.log('-------FIN------')
                    resolve(objectLinkvalidate)
                })
        })
    })
    return linkRoundPromise
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
                            searchLinks(`${route}/${file}`)
                                .then((links) => {
                                    linkRound(links, route)
                                        .then((response) => {
                                            resolve(response)
                                        })
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
// ObjectForLink(URL, route, data)
//   .then((objectLinkvalidate) => {
//     console.log(objectLinkvalidate)
//     console.log('-------FIN------')
//   })
// searchLinks(route)
//   .then((links) => {
//     console.log(links);
//     console.log('---FIN---')
//   })
// linkRound(['https://github.com/Laboratoria/BOG004-md','https://google.com'], route, data, options)

// searchLinks(route)
//   .then((links) => {
//     //link son los array de links
//     linkRound(links, route, data, options)
//   })
// fileExtension(route)
// .then((links) => {
//   linkRound(links, route, data, options)
// })
// directory(route)
// .then((response) => {
//   console.log(response)
// })
// identify(route)
//   .then((response) => {
//     console.log(response)
//   })
// mdLinks(route, options).then((data) => {
//   console.log('data', data)
// }).catch((error) => {
//   console.log('Error: ', error)
// })
mdLinks(route, options).then((data) => {
    console.log('data', data)
}).catch((error) => {
    console.log('Error: ', error)
})