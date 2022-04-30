var grades = [{
    href: 'https://www.bbc.com/mundo/vert-earth-39273283',
    file: 'files/marine-animals/whale.md',
    text: '[LA BALLENA MÁS GRANDE DE LA HISTORIA]',
    okFail: 'ok'
},
{
    href: 'www.bbc.com/mundo/vert-earth-39273282',
    file: 'files/marine-animals/whale.md',
    text: '[LA BALLENA MÁS GRANDE DE LA HISTORIA]',
    okFail: 'Fail'
},
{
    href: 'www.bbc.com/mundo/vert-earth-39273282',
    file: 'files/marine-animals/whale.md',
    text: '[LA BALLENA MÁS GRANDE DE LA HISTORIA]',
    okFail: 'Fail'
}
]

//ELIMINA LOS LINKS REPETIDOS

const unique = (data) => {
    let arrayLinks = []
    data.forEach(function (objectLink) {
        // console.log('objectLink', objectLink)
        let hrefs = Object.values(objectLink);
        // console.log('hrefs', hrefs)
        for (let i = 0; i < hrefs.length; i++) {
            let clave = hrefs[i];
            if ((clave).match(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})|(www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})+$/)) {
                arrayLinks.push(clave);
            }
        }
    })
    arrayLinks = [...new Set(arrayLinks)].length
    console.log('unicos', arrayLinks)
}

//LINKS ROTOS
let array2 = [];
grades.forEach(function (grade) {
    let status = Object.keys(grade);
    for (let i = 0; i < status.length; i++) {
        let clave = status[i];

        if ((grade[clave]) === 'Fail') {
            array2.push(grade[clave]);
        }
    }
})

// console.log('array2', array2.length)ç
unique(grades)
