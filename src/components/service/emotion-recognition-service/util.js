export const getBase64 = file => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            return resolve(reader.result);
        };
        reader.onerror = error => reject(error);
    });
};
