// aws.service.ts
import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';

@Injectable({
  providedIn: 'root',
})
export class AWSService {
  // ...

  uploadVideo(file: File, key: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: 'cip-engage',
      Key: '1GRtbJy2ZfwFDSNUZpESn4fOE1NtXattU1839phj', // The name/key under which you want to store the file in S3
      Body: file,
      ACL: 'public-read', // Adjust the ACL as needed
    };

    return this.s3.upload(params).promise();
  }
}
