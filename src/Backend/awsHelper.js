const AWS = require('aws-sdk');
const fs = require("fs");
const val = require('./Authentication/constant');
const { Readable } = require('stream');
const path = require("path");
const { config } = require('process');
axios = require("axios").default

async function uploadimageFromUrlToAws(awspath, fileUrl, fileAccessToken) {
    return new Promise((resolve, reject) => {

        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${fileAccessToken}`,
            },
            responseType: 'stream',
        };

        // Create S3 client
        console.log(val.awsaccessKeyId);
        console.log(val.awssecretAccessKey);
        console.log(val.awsregion);
        const s3 = new AWS.S3({
            accessKeyId: val.awsaccessKeyId,
            secretAccessKey: val.awssecretAccessKey,
            region: val.awsregion
        });

        axios.get(fileUrl, axiosConfig)
            .then(response => {
                const readStream = new Readable().wrap(response.data);
                const filekey = awspath;
                const params = {
                    Bucket: val.awsbucket,
                    Key: filekey,
                    Body: readStream,
                };

                s3.upload(params, (err, data) => {
                    console.log(data);
                    if (err) {
                        console.error('Error uploading file:', err);
                    } else {
                        console.log('File uploaded successfully!');
                        // console.log(data);
                        resolve({ code: 0, value: data });
                        // return data;//SAVE DETAILS TO DB from calling function so that it can be used in future to access.
                    }
                });


            })
            .catch(error => {
                console.error('Error downloading file:', error);
            })
    })
}

async function uploadToAws(awspath, stream, type) {
    console.log("uploadToAws")
    return new Promise((resolve, reject) => {
        // Create S3 client
        // console.log(val.awsaccessKeyId);
        // console.log(val.awssecretAccessKey);
        // console.log(val.awsregion);
        // console.log(awspath);
        // var buf = Buffer.from(stream.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        let buf;
        if (type === 'file') {
            buf = stream;

        } else {
            buf = Buffer.from(stream.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        }
        var data = {
            Key: awspath,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/png',
            Bucket: val.awsbucket,

        };
        const params = {
            Bucket: val.awsbucket,
            Key: awspath,
            accessKeyId: val.awsaccessKeyId,
            secretAccessKey: val.awssecretAccessKey,
            region: val.awsregion
        };

        var s3Bucket = new AWS.S3(params);
        s3Bucket.putObject(data, function (err, data) {
            if (err) {
                console.error('Error uploading file:', err);
            } else {
                console.log('File uploaded successfully!');
                console.log(data);
                data.Location = "https://" + val.awsbucket + ".s3." + val.awsregion + ".amazonaws.com/" + awspath;
                resolve({ code: 0, value: data });//SAVE DETAILS TO DB from calling function so that it can be used in future to access.
            }
        });
    })
}

async function uploadWhatsAppImageToAws(spid, imageid, fileUrl, fileAccessToken) {
    let awspath = spid + "/whatsappMessage/" + imageid + ".jpg"
    console.log(awspath)
    // return uploadimageFromUrlToAws(awspath, fileUrl, fileAccessToken);
    let res = await uploadimageFromUrlToAws(awspath, fileUrl, fileAccessToken)
    return res;
}


const util = require('util');
const readFile = util.promisify(fs.readFile);
///use when no authentication is required and only need to upload a file present or uploaded to server
async function uploadFileToAws(destinationPath, sourcePath) {
    // fs.readFile(sourcePath, async function (err, data) {
    //     if (err) {
    //         console.log(err)
    //     }
    //   //   return uploadStreamToAws(destinationPath, data);
    //     let value = await uploadStreamToAws(destinationPath, data)
    //   console.log(value)
    //   return value;

    // })
    let type = 'file'
    try {
        const data = await readFile(sourcePath);
        const value = await uploadStreamToAws(destinationPath, data, type);
        return value;
    } catch (err) {
        console.error(" uploadFileToAws err");
        console.log(err)

    }
}

async function uploadStreamToAws(destinationPath, streamdata, type) {
  
    let value = await uploadToAws(destinationPath, streamdata, type);

    console.log("value")
    console.log(value)
    return value;


}

async function uploadVideoToAws(awspath, videoData) {
    // Example usage:
    const awsConfig = {
        awsaccessKeyId: val.awsaccessKeyId,
        awssecretAccessKey: val.awssecretAccessKey,
        awsregion: val.awsregion,
        awsbucket: val.awsbucket
    };
    return new Promise((resolve, reject) => {

        console.log("uploadVideoToAws")
        // Configure AWS SDK
        AWS.config.update({
            accessKeyId: awsConfig.awsaccessKeyId,
            secretAccessKey: awsConfig.awssecretAccessKey,
            region: awsConfig.awsregion
        });

        const s3 = new AWS.S3();

        // Convert videoData to a Buffer
        const videoBuffer = Buffer.from(videoData, 'base64');

        // Specify the content type for your video (e.g., 'video/mp4')
        const contentType = 'video/mp4';

        const params = {
            Bucket: awsConfig.awsbucket,
            Key: awspath,
            Body: videoBuffer,
            ContentEncoding: 'base64',
            ContentType: contentType,

        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading video:', err);
                reject(err);
            } else {
                console.log('Video uploaded successfully!');
                console.log(data);
                const videoUrl = `https://${awsConfig.awsbucket}.s3.${awsConfig.awsregion}.amazonaws.com/${awspath}`;
                resolve({ code: 0, value: data });
                // You can save the videoUrl to your database for future use.
            }
        });
    });
}



const awsConfig = {
    awsaccessKeyId: val.awsaccessKeyId,
    awssecretAccessKey: val.awssecretAccessKey,
    awsregion: val.awsregion,
    awsbucket: val.awsbucket
};
// Configure AWS SDK
AWS.config.update({
    accessKeyId: awsConfig.awsaccessKeyId,
    secretAccessKey: awsConfig.awssecretAccessKey,
    region: awsConfig.awsregion
});

const s3 = new AWS.S3();



// Define a function to get storage utilization
async function getStorageUtilization(spid, days) {

    let totalSize = 0;
    let mediaCount = 0;


    const params = {
        Bucket: awsConfig.awsbucket,
        Prefix: spid.toString(), // Objects that start with "2" //  here Prefix is SP_ID
    };
    const cutoffDate = new Date();

    if (days != '-1') {
        console.log("-0")
        cutoffDate.setDate(cutoffDate.getDate() - days);
    }

    const getObjectSize = async (key) => {
        const objectParams = {
            Bucket: awsConfig.awsbucket,
            Key: key
        };
        const object = await s3.headObject(objectParams).promise();
        return object.ContentLength;
    };

    const listObjects = async (params) => {
        const data = await s3.listObjectsV2(params).promise();

        for (const item of data.Contents) {
            //   console.log(item.Key)
            totalSize += await getObjectSize(item.Key);
            console.log(item.LastModified < cutoffDate);
            console.log(cutoffDate)
            if (item.LastModified < cutoffDate && days != '-1') {
                mediaCount = mediaCount + 1;
            }
        }
        if (data.IsTruncated) {
            const nextParams = {
                ...params,
                ContinuationToken: data.NextContinuationToken
            };
            await listObjects(nextParams);
        }
    };



    return new Promise((resolve, reject) => {
        listObjects(params)
            .then(() => {
                // Resolve the promise with the totalSize value
                resolve({ totalSize, mediaCount });
            })
            .catch((err) => {
                // Reject the promise with the error
                reject(err);
            });
    });

}



// Define a function to delete the object from the S3 bucket
async function deleteObjectFromBucket(days, spid) {
    console.log("deleteObjectFromBucket ...............")

    let deletedMedia = 0;
    const params = {
        Bucket: awsConfig.awsbucket,
        Prefix: spid.toString(), //: spid,
    };


    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    try {

        const listObjectsResponse = await s3.listObjectsV2(params).promise();

        for (const object of listObjectsResponse.Contents) {
            const objectLastModified = object.LastModified;

            if (objectLastModified < cutoffDate) {
                await s3.deleteObject({ Bucket: awsConfig.awsbucket, Key: object.Key }).promise();
                deletedMedia = deletedMedia + 1;
                console.log(`Deleted object: ${object.Key}`);

            }
        }
        return deletedMedia;

    } catch (error) {
        console.error('Error:' + error);
        return error;
    }
}






module.exports = { uploadWhatsAppImageToAws, uploadFileToAws, uploadStreamToAws, uploadimageFromUrlToAws, uploadVideoToAws, getStorageUtilization, deleteObjectFromBucket };