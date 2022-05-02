#!/usr/bin/env node
const arg = require('arg');
const mdLinks = require('./index');

// const route = process.argv[2];
const [, , , ...options] = process.argv
let route = process.argv[2]

const optionsCli = () => {
    const args = arg({
        '--validate': Boolean,
        '--stats': Boolean,
    });
    return {
        validate: args['--validate'] || false,
        stats: args['--stats'] || false,
    };
}

//FUNCION QUE FILTRA UN OBJETO
Object.filter = function (objectOptions, filterFunction) {
    return Object.keys(objectOptions)
        .filter(function (ObjectKey) {
            return filterFunction(objectOptions[ObjectKey])
        })
        .reduce(function (result, ObjectKey) {
            result[ObjectKey] = objectOptions[ObjectKey];
            return result;
        }, {});
}
let optionsValidate = Object.filter(options, (option) => option == '--validate');
optionsValidate = Object.values(optionsValidate).toString();
//FUNCION QUE FILTRA EL OBJETO DE OPTIONS Y TRANSFORMA EL OPTIONS VALIDATE
//A STRING PARA LLAMAR A MDLINKS

//ELIMINA LOS LINKS REPETIDOS
const unique = (data) => {
    let arrayLinks = []
    data.forEach(function (objectLink) {
        // console.log('objectLink', objectLink)
        let hrefs = Object.values(objectLink);
        // console.log('hrefs', hrefs)
        for (let i = 0; i < hrefs.length; i++) {
            let clave = hrefs[i];
            const regExr = {
                href: /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})|(www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})+$/,
              };
              if (regExr.href.test(clave)){
                arrayLinks.push(clave);
            }
        }
    })
    arrayLinks = [...new Set(arrayLinks)].length
    console.log('Unique', arrayLinks)
}

//LINKS ROTOS
const failed = (data) => {
    let failesLinksArray = [];
    data.forEach(function (objectLink) {
        let status = Object.keys(objectLink);
        for (let i = 0; i < status.length; i++) {
            let clave = status[i];

            if ((objectLink[clave]) === 'Fail') {
                failesLinksArray.push(objectLink[clave]);
            }
        }
    })

    console.log('Broken', failesLinksArray.length)
}

const filterForCli = (route, options) => {
    // console.log('route:', route)
    // console.log('options:', options);
    if (options.validate) {
        if (options.stats) {
            //AMBAS
            mdLinks(route, optionsValidate).then((data) => {
                let total = data.length
                console.log('Total', total )  //TOTAL
                unique(data);//UNICOS
                failed(data) //ROTOS
            }).catch((error) => {
                console.log('Error: ', error)
            })
        } else {
            //SOLO VALIDATE
            mdLinks(route, optionsValidate).then((data) => {
                console.log('respuesta: ', data)
            }).catch((error) => {
                console.log('Error: ', error)
            })
        }
    } else if (options.stats) {
        if (options.validate) {
            //AMBAS
            mdLinks(route, optionsValidate).then((data) => {
                let total = data.length
                console.log('total', total )  //TOTAL
                unique(data);//UNICOS
                failed(data) //ROTOS
            }).catch((error) => {
                console.log('Error: ', error)
            })
        } else {
            //SOLO STATS
            mdLinks(route, optionsValidate).then((data) => {
                let total = data.length
                console.log('total', total )  //TOTAL
                unique(data);//UNICOS
            }).catch((error) => {
                console.log('Error: ', error)
            })
        }
    } else {
        //NINGUNA - VALIDATE TRUE
        mdLinks(route, optionsValidate).then((data) => {
            console.log(data)
        }).catch((error) => {
            console.log('Error: ', error)
        })
    }
}

const cli = (route, options) => {
    let objectCli = optionsCli(route, options); //Un objeto validate y stats
    objectCli = filterForCli(route, objectCli)
}
cli(route, options)

