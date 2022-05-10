const { fileExtension, identify, searchLinks, routeExistence, directory, mdLinks } = require('../index');
const chalk = require('chalk');

describe('Promesas reutilizables - Reject', () => {
  it('Ruta no existe en el sistema de archivos', () => {
    const route = 'files/sloth.md';
    return routeExistence(route).catch(data => {
      expect(data).toBe(chalk.bgRed('Route doesn\'t exist'));
    })
  });

  it('No es un archivo .md', () => {
    const route = 'files/insects.txt';
    return fileExtension(route).catch(data => {
      expect(data).toEqual('Path-is-not-a-file-.md');
    })
  });

  it('No se puede leer el archivo', () => {
    const route = './.editorconfig';
    return identify(route).catch(data => {
      expect(data).toBe('Path-is-not-a-file-.md');
    })
  });
});

describe('Promesas reutilizables - Resolve', () => {
  it('Retorna un array por url', () => {
    const route = 'files/marine-animals/whale.md';
    const result = [
      {
        href: 'https://www.bbc.com/mundo/vert-earth-39273283',
        file: 'files/marine-animals/whale.md',
        text: 'LA BALLENA MÁS GRANDE DE LA HISTORIA'
      }
    ]
    return searchLinks(route).then(data => {
      expect(data).toEqual(result);
    })
  });
  it('Funcion recursiva - para directorio', () => {
    const route = 'files';
    const result = [
      "files/marine-animals/readme.md",
      "files/marine-animals/whale.md",
      "files/panda-bear.md",
      "files/snail.md"
    ]
    expect(directory(route)).toEqual(result);
  });
})

describe('Testeando función md-Links', () => {
  test('Retorna un array de objetos - validate false', () => {
    const route = 'files/marine-animals/whale.md';
    const result = [
      {
        href: 'https://www.bbc.com/mundo/vert-earth-39273283',
        file: 'files/marine-animals/whale.md',
        text: 'LA BALLENA MÁS GRANDE DE LA HISTORIA'
      }
    ]
    return expect(mdLinks(route)).resolves.toEqual(result);
  });
  test('Retorna un array de objetos - validate true', () => {
    jest.setTimeout(100000);
    const route = 'files/marine-animals/whale.md';
    const options = '--validate'
    const result = [
      {
        href: 'https://www.bbc.com/mundo/vert-earth-39273283',
        file: 'files/marine-animals/whale.md',
        text: 'LA BALLENA MÁS GRANDE DE LA HISTORIA',
        status: 200,
        okFail: 'OK'
      }
    ]
    return expect(mdLinks(route, options)).resolves.toEqual(result);
  });
  test('Retorna un array de objetos para Status-error', () => {
    jest.setTimeout(100000);
    const route = 'files/panda-bear.md';
    const options = '--validate'
    const result = [
      {
        href: 'https://github.com/Laboratoria/BOG004-md',
        file: 'files/panda-bear.md',
        text: 'CARACOLES-LINK ROTO',
        status: 404,
        'ok/Fail': 'Fail'
      }
    ]
    return expect(mdLinks(route, options)).resolves.toEqual(result);
  });
})

