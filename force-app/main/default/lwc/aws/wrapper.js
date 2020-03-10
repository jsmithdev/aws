export default {
    
    fileWrap: file => {

        const key = file.Key
        
        return {

            region: file.region,
            bucket: file.bucket,

            path: key,
            ext: key.substring(key.lastIndexOf('.') +1, key.length),
            name: key.substring(key.lastIndexOf('/')+1, key.lastIndexOf('.')),

            salesforceId: file.recordId,
            
            uid: file.ETag,
            moddate: file.LastModified,
            owner: file.Owner,
            size: file.Size,

            get url () {
                return `https://s3.${this.region}.amazonaws.com/${this.bucket}/${key}`
            },

            get type () {
                
                return ['WEBM', 'MPG', 'MP2','MPEG', 'MPE', 'MP4', 'M4V', 'M4P', 'OGG', 'MPV'].includes(this.ext.toUpperCase())
                    ? 'video'
                    : ['JPEG', 'JPG', 'GIF', 'PNG', 'APNG', 'BMP'].includes(this.ext.toUpperCase())
                        ? 'image'
                        : 'file'
            }
        }
    }
}