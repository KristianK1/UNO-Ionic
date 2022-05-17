import { Injectable } from '@angular/core';


import { AngularFireStorage, } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class FireStorageService {
  fireFolderName: string = "accsProfilePics";
  basicImageUrl: string = 'https://firebasestorage.googleapis.com/v0/b/webprogprojekt.appspot.com/o/avatardefault_92824.png?alt=media&token=a3054da1-1d82-4490-80e7-85db058e8795';
  constructor(private angularFirestore: AngularFirestore, private angularFireStorage: AngularFireStorage) { }

  async uploadImage(fileName: string, base64?: string) {
    if (!base64) return this.basicImageUrl;

    let storageRef = this.angularFireStorage.storage.ref().child(this.fireFolderName + "/" + fileName);
    await storageRef.putString(base64, 'base64', { contentType: 'image/jpg' });
    let link = await storageRef.getDownloadURL();
    console.log("link");
    console.log(link);
    return link;
  }
  async deleteImage(url: string) {
    if (url === this.basicImageUrl) {
      return;
    }

    let pictureRef = this.angularFireStorage.storage.refFromURL(url);
    try {
      await pictureRef.delete();
      console.log("uspjesno obrisano");

    } catch (e) {
      console.log("failed");
    }
  }
}
