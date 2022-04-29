const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');
const axios = require('axios');

const route = process.argv[2];
const options = process.argv[3];

const mdLinks = (route, options) => {
  return new Promise((resolve, reject) => {
    routeExistence(route)
      .then(objects => {
        if (options === '--validate') {
          let arrayPromises = []
          objects.forEach(objeto => {
            arrayPromises.push(axios.get(objeto.href))
          })
          Promise.allSettled(arrayPromises)
            .then(responses => {
              responses.forEach(function (response) {
                if (response.status === 'fulfilled') {
                  objects.forEach(function (object) {
                    if (response.value.config.url === object.href) {
                      object['status'] = response.value.status;
                      object['ok/Fail'] = response.value.statusText;
                    }
                  })
                } else if (response.status === 'rejected') {
                  objects.forEach(function (object) {
                    if (response.reason.config.url === object.href) {
                      object['status'] = response.reason.response.status;
                      object['ok/Fail'] = response.reason.response.statusText;
                    }

                  })
                }
              })
              resolve(objects)
            })
        } else if (!options === undefined) {
          resolve(routeExistence(route)) //devuelve un array de objetos por links
        }
      })
      .catch(err => {
        console.log(err)
      })
    //     // ARRAY DE OBJETOS FINAL
    //     // Y CUANDP YA ESTÉ RESUELTO... FINALIZA CON RESOLVE QUE CONTIENE UN ARRAY DE OBJETOS
    //     //CUANDO OPTIONS ES FALSE EL ARRAY DE OBJETOS SOLO DEVUELVE HREF, FILE Y TEXT, CUANDO ES TRUE AGREGA STATUS Y OK
    //     // CUANDO OPTIONS ES -STATS DEVUELVE TOTAL DE URLs Y URLs UNICAS
    //     // CUANDO OPTIONS ES AMBOS DEVUELVE TOTAL DE URLs, URLs UNICAS Y URLs ROTAS
  
  })
}

//---FUNCION PARA IDENTIFICAR SI LA RUTA EXISTE O NO EN EL SISTEMA DE ARCHIVOS---
const routeExistence = (route) => {
  return new Promise((resolve, reject) => {
    //VER SI SE PUEDE USAR FS.ACCESS()
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
      } else if (inf.isFile() === true) {
        resolve(fileExtension(route))
      } else if (inf.isDirectory() === true) {
        let arrayMds = directory(route);
        let arrayLinks = [];
        arrayMds.forEach(function (md) {
          arrayLinks.push(searchLinks(md)) //FUNCION QUE LEE EL MD E IDENTIFICA LINKS Y DEVUELVE ARRAY DE LINKS
        })
        Promise.allSettled(arrayLinks).then(responses => {
          let arrayLinksMd = []; //arreglo con todos los objetos que tienen href, file y text
          responses.forEach(function (response) {
            if (response.status === 'fulfilled') {
              // tres puntito mezcla arreglos
              arrayLinksMd.push(...response.value) //response.value devuelve un array de objetos (links-propiedades)
            }
          })
          resolve(arrayLinksMd)
        })
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
    } else if (extName == '.md') {
      searchLinks(route)
        .then((objectMd) => {
          //LLamar a la funcion de recorrer el objeto
          resolve(objectMd)
        })
    }
  })
}
//A ESTA FUNCION ENTRA LA RUTA Y CREA UN ARRAY DE OBJETOS POR URL INDIVIDUAL
//FUNCION QUE LEE EL MD E IDENTIFICA LINKS Y DEVUELVE ARRAY DE LINKS
const searchLinks = (route) => {
  //readFile lee el contenido de la ruta, se asume que la ruta es a un archivo .md
  let arrayLinks = new Promise((resolve, reject) => {
    let array = []
    fs.readFile(route, 'utf8', (err, data) => {
      if (err) {
        reject('File-could-not-be-read')
      } else {
        const { links } = markdownLinkExtractor(data);
        links.forEach(function (link) {
          array.push({
            href: link,
            file: route,
            text: data.match(/\[([^()]*[^()]*)\]/)[0],
          })
        })
        resolve(array)
      }
    })
  })
  return arrayLinks
}

//-----------------------------------DIRECTORY-------------------------------
//---------FUNCION QUE LEE UN DIRECTORIO / FUNCION RECURSIVA--------
const directory = (route) => {
  let objectAllMd = []

  fileObjs = fs.readdirSync(route, { withFileTypes: true });
  fileObjs.forEach(file => {
    // console.log('***********', file.name);
    switch (path.extname(file.name)) {
      case '.md': {
        objectAllMd.push(`${route}/${file.name}`)
        break
      }
      case '': {
        let recursive = directory(`${route}/${file.name}`)
        if (recursive.length > 0) {
          objectAllMd.push(...recursive)
        }
        break
      }
    }
  });
  return objectAllMd
}
// ObjectForLink('https://google.com', route)
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
// let array = [
//   'files/marine-animals/whale.md',
//   'files/panda-bear.md',
//   'files/snail.md'
// ]
// array.map(function(md) {
//   searchLinks(md)
//   .then((links) => {
//     console.log(links)
//     // linkRound(links, route, data, options)
//   })
// })
// searchLinks(route)
//   .then((links) => {
//     console.log(links)
//     // linkRound(links, route, data, options)
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
// routeExistence(route)
//   .then((response) => {
//     ObjectForLink(response)
//     .then(response => {
//       console.log(response)
//     })
//   })
// mdLinks(route, options).then((data) => {
//   console.log('respuesta: ', data)
// }).catch((error) => {
//   console.log('Error: ', error)
// })

module.exports = mdLinks; 
// let object = [
//   {
//     href: 'https://www.bbc.com/mundo/vert-earth-39273283',
//     file: 'files/marine-animals/whale.md',
//     text: '[LA BALLENA MÁS GRANDE DE LA HISTORIA]'
//   },
//   {
//     href: 'https://github.com/Laboratoria/BOG004-md',
//     file: 'files/snail.md',
//     text: '[CARACOLES-LINK ROTO]'
//   },
//   {
//     href: 'https://google.com',
//     file: 'files/snail.md',
//     text: '[CARACOLES-LINK ROTO]'
//   }
// ]

  // .then((response) => {
  //   console.log(response)
  // })