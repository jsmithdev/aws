public class AWS_S3 {
    
    @AuraEnabled
    public static AWS_S3__mdt getCreds(){
        return [
            SELECT Id, Bucket__c, Region__c, IdentityPoolId__c, AccessKeyId__c, SecretAccessKey__c
            FROM AWS_S3__mdt
            LIMIT 1
        ];/* if more than one set name=>   WHERE Name = 'jsmithdev' */
    }
}
