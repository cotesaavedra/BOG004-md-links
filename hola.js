const fs = require('fs');
const markdownLinkExtractor = require('markdown-link-extractor');
const searchLinks = (route) => {
    //readFile lee el contenido de la ruta, se asume que la ruta es a un archivo .md
    let arrayLinks = new Promise((resolve, reject) => {
        let array = []
        fs.readFile(route, 'utf8', (err, data) => {
            if (err) {
                reject('File-could-not-be-read')
            } else {
                const { links } = markdownLinkExtractor(data);
                const regExr = {
                    href: /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})|(www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})+$/,
                    text: /\[([^()]*[^()]*)\]/g,
                };
                //Recorrer el array de todos los links y preguntar a cada uno si cumple con el
                //redgex y si cumple guardarlo en el array vacio
                //
                // const regex1 = /\[([^()]*[^()]*)\]/;
                    
                    links.forEach(function (link) {
                        const regexp = new RegExp(`\[([^()]*[^()]*)\]\(`, 'g')
                        console.log(regexp)
                        if (regExr.href.test(link)) {
                            array.push({
                                href: link,
                                file: route,
                                // text: data.match(regexp),
                                // text: array1
                            })
                        }
                    })
                

                resolve(array)
            }
        })
    })
    return arrayLinks
}
let route = 'files/snail.md'
searchLinks(route)
    .then(response => console.log(response))
// const regerx = /\[([^()]*[^()]*)\]/g,
// const regex1 = /\[([^()]*[^()]*)\]/;
// const str1 = 'table football, foosball[hola], jej [chao]';
// let array1;

// while ((array1 = regex1.exec(str1)) !== null) {
//     console.log(`Found ${array1[0]}. Next starts at ${regex1.lastIndex}.`);
//     // expected output: "Found foo. Next starts at 9."
//     // expected output: "Found foo. Next starts at 19."
// }