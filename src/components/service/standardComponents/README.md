# SingularityNET Standard UI Components

Here's the documentation for SNET's standard components:

Summary:
- [Image Upload Component](#image-upload-component);

___

## Image Upload Component

This repository contains the official [Material UI](https://material-ui.com/) based image upload component for SingularityNET services.

### General Functionality

This component is composed of a tool bar (at the top) and a main tab below it. The top bar consists of:
 
- The image name (that can be set by "imageName" parameter);
- A tab chooser composed of:
    - Upload: a dropzone that allows the user to upload an image from their computer by clicking or dragging and dropping a file. Will display a "file rejected" message if the user tries to drop a file that exceeds "maxImageSize" or an image type that is not listed under "allowedInputTypes";
    - URL: allows users to select images using their URL;
    - Gallery: an optional tab that can be used if the service provider would like to suggest example images. Will be rendered if the "imageGallery" parameter (a list of image URLs) is provided. 
- An optional info tip that will be rendered if the "infoTip" parameter is not empty. It is an "Info" icon that displays a tooltip with the specified string when hovered upon.
- A reset button that is rendered after the user uploads an image that allows them to choose another image.

The service provider may choose to any combination of the three main tabs (Upload, Url and Gallery) by combining the parameters `disableUploadTab`, `disableUrlTab` and `imageGallery`. 

After the user chooses an image file or its URL, a loading state will be displayed as a "CircularProgress" component in the center of the main tab while the image data is being downloaded or generated.

Once that is complete, the chosen image will be displayed on the main tab and the parent component will be provided its `base64` or `Uint8Array` encoded version via the provided function (`imageDataFunc`) parameter.

If the user types an invalid image URL or if the chosen image server blocks the request due to CORS policy, and error message is displayed at the bottom of the component. It can be dismissed by simply clicking away or waiting 5 seconds.

### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| width | string | "400px" | Component width to be set in number of pixels or percentage width of parent div (e.g.: "500px", "60%"). Minimum: "400px". |
| tabHeight | number (no units) | 300 | Component's tab height (does not include top bar) to be set as a number (e.g.: 300). Minimum: 160. |
| **imageDataFunc** | function, required |  - | A function that receives the uploaded image. |
| imageName | string | "Input Image" | Image name that will be displayed on top of the component.|
| disableUploadTab | bool | false | If `true`, does not render *Upload* tab. |
| disableUrlTab | bool | false | If `true`, does not render *Url* tab. |
| returnByteArray | bool | `false` | If `true` returns Uint8Array encoded image data to `imageDataFunc()` instead of base64. |
| allowedInputTypes | string or array | "image/*" | Specifies allowed file types for "Upload" component. Accepts a file type-string or an array of types (e.g.: "image/jpeg", \["image/jpg", "image/jpeg"]). |
| maxImageSize | number | 10000000 | Maximum image file size for Upload tab in bytes. Default: 10mb. |
| displayProportionalImage | bool | `true` | Whether to keep uploaded image proportions when displaying it or to ajust to it to tab's height and width. |
| imageGallery | list | - | Optional list of image URLs that will be rendered in a Gallery tab. This should be used if the service provider would like to suggest images for the user. If this argument is empty, the Gallery tab will not be rendered. |
| allowURL | bool | `false` | Allows sending image URLs for "URL" and "Gallery" tabs. Mainly used to avoid CORS error. |
| galleryCols | number | 3 | Number of image columns to be displayed in gallery mode. |
| infoTip | string | "" | An optional string to provide a tip or explanation for the service user. If not empty, will render an "Info" icon in the top bar that will display a tooltip when hovered upon. |
| mainColor | object | blue | A material ui color object that will be the main color of the component.|

### Example Usage

This is an example of the most basic usage of the component. The only required parameter is "imageDataFunc" so that the parent component receives the encoded image data.
 
```javascript
import SNETImageUpload from "./standardComponents/SNETImageUpload";

export default class App extends Component {
    
    getData(imageData){
        console.log(imageData)
    }
    
    render() {
        return (
            <div>
                <SNETImageUpload imageDataFunc={this.getData} />
            </div>
        );
    }
}
```

For a service that takes only image URLs, for example, the service provider could set the parameters `disableUploadTab={true}` and `allowURL={true}`. That way the users could upload their images and see them rendered on the screen but the service would only receive its URL.

Taking only user uploaded, byte-array encoded image files would mean setting `disableUrlTab={true}` and `returnByteArray={true}`.

### Known Issues

- Dropping an image on top of an already uploaded image triggers browser's default dropping behavior: loading the image file;
- "maxImageSize" and "allowedInputTypes" parameters are only valid for "Upload" mode;
- Output image format ("outputFormat") parameter does not work;
- Component's heights need more attention;

### Future Improvements

- Set minimum width according to what components will be rendered in the top tab

___