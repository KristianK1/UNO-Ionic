import { Injectable } from '@angular/core';


import { AngularFireStorage, } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FireStorageService {
  fireFolderName: string = "accsProfilePics";

  constructor(private angularFirestore: AngularFirestore, private angularFireStorage: AngularFireStorage) { }

  async uploadImage(fileName: string, base64: string){
    let storageRef = this.angularFireStorage.storage.ref().child(this.fireFolderName + "/" + fileName);
    await storageRef.putString(base64, 'base64', {contentType:'image/jpg'});
    let link = await storageRef.getDownloadURL();
    console.log("link");
    console.log(link);
    return link;
  }
  async deleteImage(url:string){
    let pictureRef = this.angularFireStorage.storage.refFromURL(url);
    //2.
    try{
      await pictureRef.delete();
      console.log("uspjesno obrisano");
      
    } catch(e){
      console.log("failed");
    }
  }
}
 