const mdLinks = require('./index.js')

const route = 'files'
const options = '--validate'
const prueba = (route, options) => {
    mdLinks(route, options).then((data) => {
        console.log('respuesta: ', data)
    }).catch((error) => {
        console.log('Error: ', error)
    })
}

// const prueba2 = (route, options) => {
//     if (options === '--stats') {
//         // ESTADISTICAS TOTAL Y UNICOS
//     } else if (options === || options === '--validate --stats') {
//         // ESTADISTICAS TOTAL, UNICOS Y ROTOS
//     }
// }
prueba(route, options)