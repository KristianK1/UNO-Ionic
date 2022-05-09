import { Injectable } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }


  async takePhoto(): Promise<string> {
    let photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      saveToGallery: false,
      width: 1000,
      height: 1000,
      preserveAspectRatio: true,
      correctOrientation: true,
      presentationStyle: 'popover',
    });
    console.log(photo.base64String);
    return photo.base64String;
  }

}
