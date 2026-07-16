const Jimp = require('jimp');

async function createStamp() {
    try {
        const image = await Jimp.read('C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\public\\logo.png');
        console.log(`Original logo has transparency: ${image.hasAlpha()}`);
        
        // We will make a stamp copy
        const stamp = await Jimp.read('C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\public\\logo.png');
        
        // Let's create a transparent version if it's not already transparent?
        // Actually, if it has a white background, we might want to make white transparent
        // or just apply a stamp effect (opacity 0.8)
        stamp.opacity(0.85); // make it slightly transparent so text under it shows
        
        // You can also adjust contrast/brightness or color to make it look more like a stamp
        
        await stamp.writeAsync('C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\public\\stamp.png');
        console.log('Stamp created at public/stamp.png');
    } catch (err) {
        console.error('Error creating stamp:', err);
    }
}

createStamp();
