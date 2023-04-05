import * as sharp from "sharp";
import * as fs from "fs";
import * as path from "path";


const emotesFolder = './emotes/';

const out = "./output/";
const assetsOutput = "./output/static/";

if (!fs.existsSync(out)){
    fs.mkdirSync(out);
}

if (!fs.existsSync(assetsOutput)){
    fs.mkdirSync(assetsOutput);
}

fs.readdirSync(emotesFolder).forEach(async file => {
    const pathfile:string = emotesFolder + file;
    const ext:string = path.extname(pathfile);
    const name:string = path.basename(pathfile,ext);
    const image = await sharp(pathfile)
    //const imageInfo = await image.metadata();

    await ResizeImages(image,name,assetsOutput);

});

copyAllFilesToDestination('./assets/',"./output/static/");
copyAllFilesToDestination('./root/','./output/');


async function ResizeImages(image, name, outputFolder){
    await image.resize({height: 28}).toFile(outputFolder + name + "_28.webp" )
    await image.resize({height: 56}).toFile(outputFolder + name + "_56.webp" )
    await image.resize({height: 112}).toFile(outputFolder + name + "_112.webp" )
    
    await image.resize({height: 28}).toFile(outputFolder + name + "_1X.webp" )
    await image.resize({height: 56}).toFile(outputFolder + name + "_2X.webp" )
    await image.resize({height: 112}).toFile(outputFolder + name + "_3X.webp" )
}
function copyAllFilesToDestination(sourceFolder, destinationFolder){
    fs.readdirSync(sourceFolder).forEach(async file => {
        const pathfile:string = sourceFolder + file;
        const filename:string = path.basename(pathfile);
        fs.copyFile(pathfile, destinationFolder + filename, (err) => {});
    });
}