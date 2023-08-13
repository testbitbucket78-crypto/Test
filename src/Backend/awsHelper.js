const AWS = require('aws-sdk');
const fs = require("fs");
const val = require('./Authentication/constant');
const { Readable } = require('stream');
const path = require("path");
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
                        console.log(data);
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

async function uploadToAws(awspath, stream) {
    return new Promise((resolve, reject) => {
        // Create S3 client
        // console.log(val.awsaccessKeyId);
        // console.log(val.awssecretAccessKey);
        // console.log(val.awsregion);
        // console.log(awspath);
        var buf = Buffer.from(stream.replace(/^data:image\/\w+;base64,/, ""),'base64')
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

        var s3Bucket = new AWS.S3( params );
        s3Bucket.putObject(data, function(err, data){
            if (err) {
                        console.error('Error uploading file:', err);
                    } else {
                        console.log('File uploaded successfully!');
                        console.log(data);
                        data.Location = "https://"+val.awsbucket+".s3."+val.awsregion+".amazonaws.com/"+awspath;
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

///use when no authentication is required and only need to upload a file present or uploaded to server
async function uploadFileToAws(destinationPath, sourcePath) {
    fs.readFile(sourcePath, async function (err, data) {
        if (err) {
            console.log(err)
        }
        // return uploadStreamToAws(destinationPath, data);
        let value = await uploadStreamToAws(destinationPath, data)
        return value;
    })
}

async function uploadStreamToAws(destinationPath, streamdata) {

    let value = await uploadToAws(destinationPath, streamdata);

    console.log("value")
    console.log(value)
    return value;


}

module.exports = { uploadWhatsAppImageToAws, uploadFileToAws, uploadStreamToAws, uploadimageFromUrlToAws };