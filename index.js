var { loadImage, createCanvas } = require('canvas');
const axios = require('axios');
const fsd = require('fs').promises
const fs = require('fs')
const path = require('path')
const nombre_carpeta = 'cosmetics'

fsd.readdir(nombre_carpeta)
  .then(files => {
    const unlinkPromises = files.map(file => { //genera un mapeo de todo el contenido que haya dentro de la carpeta
      const filePath = path.join(nombre_carpeta, file)
      return fsd.unlink(filePath) //elimina el contenido de la carpeta
    })
    console.log("Carpeta vaciada\n")

    return Promise.all(unlinkPromises)
  }).catch(err => {
    console.error(`Ha ocurrido un error borrando el contenido de: ${nombre_carpeta}`)
  })

class Cosmetic {
    constructor(data) {
        this.imagen = data.images.featured ? data.images.featured : data.images.icon;
        this.id = data.id;
        this.nombre = data.name;

        this.image = null;
    };

    async makeImage() {
        const canvas = createCanvas(512, 512); //definir las dimensiones de la imagen para crear un lienzo
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            await loadImage(this.imagen), 0, 0, 512, 512
        );//añadir imagen del item al lienzo

        this.image = canvas.toBuffer('image/png');

        fs.writeFileSync(process.cwd() + `/${nombre_carpeta}/${this.id}.png`, this.image);//guardar la imagen dentro de la carpeta

        console.log(`La imagen del cosmético "${this.nombre}" ha sido generada con éxito"`)//informar a usuario que fue creada con éxito

        return this;
    };
};

(async () => {
    //hace un response a la api
    let res = await axios.get('https://fortnite-api.com/v2/cosmetics/new');

    console.log(`Versión: ${res.data.data.build}`) //obtener versión actual del juego en base a la data
    console.log("Rescatando cosméticos de nuevos según Fortnite-api");

    let items = res.data.data.items.br; //define data de donde sacará los items

    items = items.map(v => new Cosmetic(v));
    await Promise.all(items.map(v => v.makeImage()));
})();
