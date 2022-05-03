const fs = require('fs');
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');
const axios = require('axios');
const chalk = require('chalk');
const mdLinks = (route, options) => {
  return new Promise((resolve, reject) => {
    routeExistence(route)
      .then(objects => {
        if (options === '--validate') {
          let arrayPromises = [];
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
                      object['okFail'] = response.value.statusText;
                    }
                  })
                } else if (response.status === 'rejected') {
                  objects.forEach(function (object) {
                    if (response.reason.config.url === object.href) {
                      if (response.reason.code == 'ERR_BAD_REQUEST') {
                        object['status'] = response.reason.response.status;
                        object['ok/Fail'] = 'Fail';
                      } else if (response.reason.code != 'ERR_BAD_REQUEST') {
                        object['status'] = response.reason.code;
                        object['okFail'] = 'Fail';
                      }
                    }
                  })
                }
              })
              resolve(objects);
            })
        } else if (!options) {
          resolve(routeExistence(route)); //devuelve un array de objetos por links
        }
      })
      .catch(err => {
        reject(err);
      })
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
          resolve(identify(route)); //RETORNA UN OBJETO PROVENIENTE DE SEARCHURL
        } else {
          reject(chalk.bgRed('Route doesn\'t exist')) //ruta no existe en el sistema de archivos
        }
      })
  })
}
//-----FUNCION PARA IDENTIFICAR SI ES UN ARCHIVO O UN DIRECTORIO-----------
const identify = (route) => {
  return new Promise((resolve, reject) => {
    fs.lstat(route, (err, inf) => {
      if (err) {
        reject('Path-is-not-a-directory/file');
      } else if (inf.isFile() === true) {
        resolve(fileExtension(route)) //Array de objetos por cada url encontrada
      } else if (inf.isDirectory() === true) {
        let arrayMds = directory(route); //retorna un array de todos los archivos md
        let arrayLinks = [];
        arrayMds.forEach(function (md) {
          arrayLinks.push(searchLinks(md)) //FUNCION QUE LEE EL MD E IDENTIFICA LINKS Y DEVUELVE ARRAY OBJETOS DE LINKS
        })
        Promise.allSettled(arrayLinks).then(responses => {
          let arrayLinksMd = []; //arreglo con todos los objetos que tienen href, file y text
          responses.forEach(function (response) {
            if (response.status === 'fulfilled') {
              // tres puntito mezcla arreglos
              arrayLinksMd.push(...response.value); //response.value devuelve un array de objetos (links-propiedades)
            }
          })
          resolve(arrayLinksMd);
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
          resolve(objectMd);
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
        reject('File-could-not-be-read');
      } else {
        const { links } = markdownLinkExtractor(data); //Array de urls
        const regExr = {
          href: /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})|(www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})+$/,
        };
        //Recorrer el array de todos los links y preguntar a cada uno si cumple con el
        //redgex y si cumple guardarlo en el array vacio
        //
        let arrayText = data.match(/\[.*?\]\(/g);
        // arrayText.map(text => text != '')
        // console.log(arrayText)
        links.forEach(function (link, x) {
          if (regExr.href.test(link)) {
            array.push({
              href: link,
              file: route,
              text: arrayText[x].replace(/[\[\]\(]/g,''),
            })
          }
        })
        resolve(array);
      }
    })
  })
  return arrayLinks
}

//-----------------------------------DIRECTORY-------------------------------
//---------FUNCION QUE LEE UN DIRECTORIO / FUNCION RECURSIVA--------
const directory = (route) => {
  let objectAllMd = [];
  fileObjs = fs.readdirSync(route, { withFileTypes: true });
  fileObjs.forEach(file => {
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

module.exports = {
  mdLinks,
  identify,
  fileExtension,
  routeExistence,
  searchLinks,
  directory
}