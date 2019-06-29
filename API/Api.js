import { authHeaderOFF, getEditComment, userAgent } from '../../OFFAuth.js';

export async function getProduct(ean) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: authHeaderOFF,
                'Content-Type': 'application/json',
                UserAgent: userAgent
            }
        });
        const product = await response.json();
        if (product.status === 0) {
            return null;
        }
        return product;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function uploadProductToOFF(args) {
    const comment = await getEditComment();
    const url = `https://world.openfoodfacts.org/cgi/product_jqm2.pl?code=${args.ean}&product_name=${
        args.name
    }&add_brands=${args.brand}&add_labels=${args.labels}&add_categories=${args.categories}&comment=${comment}`;

    try {
        await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: authHeaderOFF,
                'Content-Type': 'application/json',
                UserAgent: userAgent
            }
        });
        if (args.wholePicture) {
            await addPictureToProduct(args.ean, args.wholePicture, 'front', 'imgupload_front_en', 'front_img.jpg');
        }
        if (args.ingredientsPicture) {
            await addPictureToProduct(
                args.ean,
                args.ingredientsPicture,
                'ingredients',
                'imgupload_ingredients',
                'ingredient_img.jpg'
            );
        }
        if (args.nutritionPicture) {
            await addPictureToProduct(
                args.ean,
                args.nutritionPicture,
                'nutrition',
                'imgupload_nutrition',
                'nutrition_img.jpg'
            );
        }
    } catch (error) {
        console.error(error);
    }
}

function addPictureToProduct(code, picture, fieldValue, imgUpload, imgTitle) {
    const url = 'https://world.openfoodfacts.org/cgi/product_image_upload.pl';

    const formData = new FormData();
    formData.append('code', code);
    formData.append('imagefield', fieldValue);
    formData.append(imgUpload, { uri: picture, type: 'image/jpg', name: imgTitle });

    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: authHeaderOFF,
            'Content-Type': 'multipart/form-data',
            UserAgent: userAgent
        },
        body: formData
    })
        .then(response => response.text())
        .then(text => console.log('uploaded picture: got response text: ', text))
        .catch(error => console.error(error));
}
