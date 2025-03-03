import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as service from "@pulumi/pulumiservice";

const settings = new service.DeploymentSettings("deploy-settings", {
    organization: "simonerebecca",
    project: "test-website",
    stack: "dev1",
    github: {
        deployCommits: true,
        previewPullRequests: false,
        pullRequestTemplate: false,
        repository: "simonerebecca/test"
    },
    sourceContext: {
        git:{
            repoUrl: "https://github.com/simonerebecca/test.git"
        }},
});

// Maak een S3 bucket aan voor statische website hosting
const myBucket = new aws.s3.Bucket("myBucket", {
    website: {
        indexDocument: "index.html",
    },
});



// CloudFront-distributie aanmaken voor de S3-bucket
const myDistribution = new aws.cloudfront.Distribution("myDistribution", {
    origins: [
        {
            domainName: myBucket.websiteEndpoint,
            originId: myBucket.arn,
            customOriginConfig: {
                originProtocolPolicy: "http-only",
                httpPort: 80,
                httpsPort: 443,
                originSslProtocols: ["TLSv1.2"],
            },
        },
    ],
    enabled: true,
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
        targetOriginId: myBucket.arn,
        viewerProtocolPolicy: "allow-all",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        forwardedValues: {
            queryString: false,
            cookies: { forward: "none" },
        },
    },
    restrictions: {
        geoRestriction: {
            restrictionType: "none", // Geen beperkingen op geolocatie
            locations: [],
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
});

// Exporteer de CloudFront URL
export const cloudfrontUrl = myDistribution.domainName;
