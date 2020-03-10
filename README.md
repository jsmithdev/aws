# AWS

## Salesforce LWC for AWS

- Allow other components to use AWS cleanly; Example: want to use S3 as a storage provider for files

## API

todo

## Deploy

Covert with SFDX; This creates a folder called `deploy`

```bash
sfdx force:source:convert -r force-app -d deploy
```

Now you can deploy from the new `deploy` directory

```bash
sfdx force:mdapi:deploy -d deploy -w -1 --verbose
```

📌  Append `-u user@domain.com` or `-u alias` to above to deploy somewhere other than the default org for the project

📌  Append `-l RunSpecifiedTests -r AWS_S3Test` to deploy w/ test run; Required for Production

---

Results should more or less mirror below

```bash

jamie@The-Brain:~/repo/aws$ sfdx force:mdapi:deploy -d deploy -w -1 --verbose -l RunSpecifiedTests -r AWS_S3Test
Using specified username dubya.jay.smith@gmail.com

Job ID | 0Af4N00001GnHXWSA3
MDAPI PROGRESS | ████████████████████████████████████████ | 14/14 Files

TYPE                      FILE                                           NAME                            ID
────────────────────────  ─────────────────────────────────────────────  ──────────────────────────────  ──────────────────
                          deploy/package.xml                             package.xml
ApexClass                 deploy/classes/AWS_S3.cls                      AWS_S3                          01p4N000008rWgqQAE
ApexClass                 deploy/classes/AWS_S3Test.cls                  AWS_S3Test                      01p4N000008rWgrQAE
CspTrustedSite            deploy/cspTrustedSites/AWS_COG.cspTrustedSite  AWS_COG                         08y4N000000GmhFQAS
CspTrustedSite            deploy/cspTrustedSites/AWS_S3.cspTrustedSite   AWS_S3                          08y4N000000GmhGQAS
CustomField               deploy/objects/AWS_S3__mdt.object              AWS_S3__mdt.AccessKeyId__c      00N4N00000InjOsUAJ
CustomField               deploy/objects/AWS_S3__mdt.object              AWS_S3__mdt.Bucket__c           00N4N00000InjOtUAJ
CustomField               deploy/objects/AWS_S3__mdt.object              AWS_S3__mdt.IdentityPoolId__c   00N4N00000InjOuUAJ
CustomField               deploy/objects/AWS_S3__mdt.object              AWS_S3__mdt.Region__c           00N4N00000InjOvUAJ
CustomField               deploy/objects/AWS_S3__mdt.object              AWS_S3__mdt.SecretAccessKey__c  00N4N00000InjOwUAJ
CustomMetadata            deploy/customMetadata/AWS_S3.jsmithdev.md      AWS_S3.jsmithdev                m004N0000004SChQAM
CustomObject              deploy/objects/AWS_S3__mdt.object              AWS_S3__mdt                     01I4N000001ZonEUAS
LightningComponentBundle  deploy/lwc/aws                                 aws                             0Rb4N000000PBsTSAW
StaticResource            deploy/staticresources/AWS_MIN.resource        AWS_MIN                         0814N000000B1C6QAK

=== Test Success [1]
NAME        METHOD
──────────  ───────────
AWS_S3Test  AWS_S3Test1

=== Apex Code Coverage
NAME    % COVERED  UNCOVERED LINES
──────  ─────────  ───────────────
AWS_S3  100%

Total Test Time:  124.0


```

---

Coded with 💝 by [Jamie Smith](https://jsmith.dev)