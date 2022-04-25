const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const { promisify } = require('util');

const route = "./bird";

//-----------VALIDANDO SI ES UNA RUTA EXISTENTE O NO EN EL SISTEMA DE ARCHIVOS--------------
const exists = promisify(fs.exists);
exists(route)
    .then((exist) => {
        if (exist) {
            console.log('Route exists')
            identify(route);
            //llamar a la función de ¿Es un directorio?
        } else {
            //ruta no existe en el sistema de archivos
            console.log('Route does not exist')
        }
    })

//-----FUNCION PARA IDENTIFICAR SI ES UN ARCHIVO O UN DIRECTORIO-----------
const identify = (route) => {
    fs.lstat(route, (err, inf) => {
        if (err)
            return console.log(err); //Handle error
        if (inf.isFile()) {
            console.log(`¿Is file?: ${inf.isFile()}`);
            extName(route);
            // console.log(`extentions: ${path.extname(route)}`)
        } else {
            console.log(`¿Is directory?: ${inf.isDirectory()}`);
            directory(route);
            
            
        }
    });
}

//-----------------------------------------FILE----------------------------------------
//-----FUNCION PARA IDENTIFICAR SI ES UN ARCHIVO .MD-------
const extName = (route) => {
    if (path.extname(route) === '.md') {
        //leer el archivo md y buscar las url
        console.log('It is a .md archive')
        searchURL(route);
    } else {
        //no es un archivo .md, no se puede leer
    }
}
//------FUNCIÓN PARA BUSCAR URLs EN UN ARCHIVO .MD--------
const searchURL = (route) => {
    fs.readFile(route, 'utf8', (err, data) => {
        if (err) throw err;
        const { links } = markdownLinkExtractor(data);
        if (links.length === 0) {
            console.log(`En ${route} se encontraron ${links.length} URLs`)
            //No se encontraron URL
            //  console.log('No se encontraron URLs')
        } else {
            console.log(`En ${route} se encontraron: `)
            console.log(links)
            // links.forEach(link => console.log(link));
        }
    });
}

//--------FUNCION PARA RECORRER UN ARRAY DE URLs Y HACER PETICIONES----------
//-----------------------------------DIRECTORY-------------------------------

//------leer un directorio------
// let files = fs.readdirSync(directory);
const directory = (route) => {
    let dirBuf = Buffer.from(route);
    fs.readdir(dirBuf, (err, files) => {
        console.log(`El directorio ${dirBuf} tiene ${files.length} archivo(s)`);
        if (err) {
            const err = err.message;
        } else {
            files.forEach(function (file) {
                if (file.isFile() == true) {
                    searchURL(`${route}/${file}`);
                } else if (file.isDirectory()) {
                    directory(`${route}/${file}`);
                }
            })
        }
    })
}