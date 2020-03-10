import { api, LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import AWS_SDK from '@salesforce/resourceUrl/AWS_MIN';

import getCreds from '@salesforce/apex/AWS_S3.getCreds'
import userId from '@salesforce/user/Id';

//import fileWrap from './wrapper'


export default class Aws extends LightningElement {

    @api record;

    @track data;
    @track error;
    @track progress;

    _int = 0

    @api
    get file () { return '' }
    set file (file){

        if(!file){ return }        
        this.handleFiles( file )
    }

    async handleFiles(files){

        try {
            
            for(let i = 0; i < files.length; i++){
                
                // eslint-disable-next-line no-await-in-loop
                await this.uploadFile( files[i] )

                if(i+1 === files.length){
                    
                    const opts = { 
                        title: `Success`,
                        message: `${files.length} uploaded, refreshing...`,
                        variant: 'success'
                    }

                    this.dispatchEvent( new ShowToastEvent(opts) )

                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => this.refreshFiles(), 1000)
                }
            }
        }
        catch(error){
            // eslint-disable-next-line no-console
            console.error( error )
        }
    }


    async uploadFile(data){

        // Upload file, use record Id else user Id
        const Key = `${this.record ? this.record : userId}/${data.name}`
            , params = {
                Key,
                ContentType: data.type,
                Body: data,
                ACL: 'public-read' // set based on AWS S3
            }
            , opts = {
                queueSize: 1,
                partSize: 1024 * 1024 * 10
            }
        ;

        const bucket = new this.AWS.S3({ params: this.params })

        return new Promise((resolve, reject) => {

            try {
                bucket.putObject(params, opts,  (error) => {
                    
                    if(error){
                        // eslint-disable-next-line no-console
                        console.error(error)
                    }
                })
                .on('httpUploadProgress', num => {
    
                    this.progress = Math.round(num.loaded / num.total * 100)
    
                    if(this.progress === 100){

                        this.progress = 0
                        resolve(this.progress)
                    }
                })
            }
            catch(error){
                // eslint-disable-next-line no-console
                console.error( error )
                reject( error )
            }
        })
    }

    @api
    get removefile () { return '' }
    set removefile (file){
        if(!file){ return }

        const Key = file.path
            , Bucket = this.Bucket
            , params = {
                Key,
                Bucket
            }
        ;

        const bucket = new this.AWS.S3({ params })
        
        bucket.deleteObject(params, (error) => {
            if(error){
                // eslint-disable-next-line no-console
                console.error(error)
            }
            this.refreshFiles()
        })
    }

    renderedCallback() { // invoke the method when component rendered or loaded
        
        Promise.all([
            loadScript(this, AWS_SDK + '/AWS_MIN.js'),
        ])
        .then(() => { 
            this.error = undefined; // scripts loaded successfully
           
            // eslint-disable-next-line no-undef
            this.AWS = AWS

            this.initializeAWS();
        })
        .catch(error => this.handleError(error))
    }
    
    async initializeAWS(){

        try {
                
            const creds = await getCreds()
            // eslint-disable-next-line no-console
            console.log(`Using ${this.record ? 'record' : 'user'}`)

            const Prefix = this.record ? this.record : userId //0031U00000JajaxQAB

            this.Region = creds.Region__c
            this.Bucket = creds.Bucket__c
            
            this.AWS.config.httpOptions = { timeout: 6000000 }

            this.AWS.config.region = this.Region
            
            // If chose to use API key instead of IdentityPoolId
            this.AWS.config.credentials = new this.AWS.Credentials(creds.AccessKeyId__c, creds.SecretAccessKey__c)
            
            // If choose to use IdentityPoolId instead of API key
            //this.AWS.config.credentials = new this.AWS.CognitoIdentityCredentials({ IdentityPoolId: creds.IdentityPoolId__c })

            // eslint-disable-next-line no-confusing-arrow, no-console
            const test = await this.AWS.config.credentials.getPromise()
            console.log('this.AWS.config.credentials')
            console.log(this.AWS.config.credentials)

            this.params = { Bucket: this.Bucket, Prefix }

            this.refreshFiles()

        } catch (error) {
            console.error( error )
        }
    }

    refreshFiles() {

        const region = this.Region
        const bucketName = this.Bucket

        const bucket = new this.AWS.S3({ params: this.params })
        
        
        bucket.listObjects(this.params, (error, response) => {


            if(!response){ return }
            // eslint-disable-next-line no-console
            if(error){ console.error(error); return }
            
            const files = response.Contents
                .map(x => { x.region = region; x.bucket = bucketName; return x; })
                .filter(x => x.Size)
                .map(x => new fileWrap(x))

            this.dispatchEvent(new CustomEvent('files', { detail: files } ))
        })
    }
}


function fileWrap(file) {

    const k = file.Key
    
    return {

        region: file.region,
        bucket: file.bucket,

        path: k,
        ext: k.substring(k.lastIndexOf('.') +1, k.length),
        name: k.substring(k.lastIndexOf('/')+1, k.lastIndexOf('.')),

        salesforceId: file.recordId,
        
        uid: file.ETag,
        moddate: file.LastModified,
        owner: file.Owner,
        size: file.Size,

        get url () {
            return `https://s3.${this.region}.amazonaws.com/${this.bucket}/${k}`
        },

        get type () {
            
            return ['WEBM', 'MPG', 'MP2','MPEG', 'MPE', 'MP4', 'M4V', 'M4P', 'OGG', 'MPV', 'MKV', 'FLV'].includes(this.ext.toUpperCase())
                ? 'video'
                : ['JPEG', 'JPG', 'GIF', 'PNG', 'APNG', 'BMP'].includes(this.ext.toUpperCase())
                    ? 'image'
                    : 'file'
        }
    }
}

/*
Coming
    ETag: ""4b41a3475132bd861b30a878e30aa56a""
    Key: "0031U00000JajaxQAB/view2.pdf"
    LastModified: Wed May 15 2019 02:40:55 GMT-0400 (Eastern Daylight Time) {}
    Owner: {ID: "ed790e5914202d7acf19e8019798273ef1768e8ed3fde438f82aed1fa0a91351"}
    Size: 3028
    StorageClass: "STANDARD"

    <== Map =>
Going
    uid: ETag
    name: end of key
    salesforceId: uid
    path: key
    moddate: LastModified
    owner: Owner
    size: Size
*/