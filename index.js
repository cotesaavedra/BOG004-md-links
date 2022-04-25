// module.exports = () => {
//   // ...
// };
const fs = require('fs')
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');
const recursive = require("recursive-readdir");


fs.readFile('./files/marine-animals/whale.md', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('-----------Leyendo un archivo .md y extrayendo links------')
  const { links } = markdownLinkExtractor(data);
  links.forEach(link => console.log(link));
  console.log(data)
});
// const markdown = fs.readFile('./files/snail.md', 'utf8')
// console.log(markdown)
// const { enlaces } = markdownLinkExtractor(markdown);
// enlaces.forEach(enlace => consola.log('enlace', enlace));


//OR
// const data = fs.readFile('./file/snail.md','utf8');
// console.log(data);

//------leer un directorio------
// console.log("inspeccionando directorio...................")
// const directory = "files";
// // let files = fs.readdirSync(directory);
// let dirBuf = Buffer.from(directory);

// fs.readdir(dirBuf, (err, files) => {
//   console.log('---------------leyendo los archivos-----------------')
//   console.log('directorio: ', files);
//   console.log('largo del directorio principal: ', files.length);
//   if (err) {
//     console.log(err.message);
//   } else {
//     files.forEach(function (file) {
//       switch (path.extname(file)) {
//         case '.md': {
//           console.log(`${file} es un ${path.extname(file)} | type: ${typeof file}`);
//           // fs.readFile(`${file}`,'utf8', (err, data) => {
//           //   if (err) throw err;
//           //   console.log(data);
//           // });
//           break
//         }
//         case '': {
//           console.log(` ${file} no es un md, es un directorio`);
//           break
//         }
//         default:
//           console.log(` ${file} no es un md, es un ${path.extname(file)}`);
//       }
//     })
//   }
// });


// // Function to get current filenames
// // in directory
// // filenames = fs.readdirSync(directory);
// // console.log("nombre de los archivos actuales del directorio:");
// // filenames.forEach((file) => {
// //   console.log(file);
// // });

// // Open the directory
// // fs.opendir(directory, (err, dir) => {
// //   console.log('---------------leyendo el directorio-----------------')
// //   if (err) console.log("Error:", err);
// //   else {
// //     // imprime la ruta del directorio
// //     console.log("ruta del directorio:", dir.path);

// //     // Leer los archivos en el directorio como objetos fs.Dirent.
// //     console.log("ruta del directorio:", directory)

// //     console.log(dir.readSync());
// //     console.log(dir.readSync());
// //     console.log(dir.readSync());
// //     console.log(dir.readSync());
// //     console.log(dir.readSync());
// //   }
// // }
// // );

// //Extraer todas las rutas absolutas de un directorio
// // function crawl(dir){
// //     console.log('[+]', dir);
// //     let files = fs.readdirSync(dir);
// //     for(let x in files){
// //       if (fs.lstatSync(next).isDirectory()==true){
// //         crawl(next);
// //       } else {
// //         console.log('\t', next);
// //       }
// //     }
// //   }
// //   crawl(path)

//   recursive("./files", function (err, files) {
//     if (err) console.log("Error:", err);
//     // `files` is an array of file paths
//     console.log(files, 'tipo:', typeof [0]);
//   });
  