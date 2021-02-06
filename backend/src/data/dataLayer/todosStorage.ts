import * as AWS from 'aws-sdk'

export class TodosStorage {
    constructor(
        private readonly s3: AWS.S3 = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly signedUrlExpireSeconds = process.env.SIGNED_URL_EXPIRATION_TIME
    ) { }

    /**
     * Generate attachment presigned Get-Url 
     * @param todoId ToDo id
     */
    async getTodoAttachmentUrl(todoId: string): Promise<string> {
        try {
            await this.s3.headObject({
                Bucket: process.env.IMAGES_BUCKET,
                Key: `${todoId}.png`
            }).promise();

            return this.s3.getSignedUrl('getObject', {
                Bucket: process.env.IMAGES_BUCKET,
                Key: `${todoId}.png`,
                Expires: parseInt(this.signedUrlExpireSeconds)
            });
        } catch (err) {
            console.log(err)
        }
        return null
    }

    /**
     * Generate attachment presigned Put-Url
     * @param todoId ToDo Id
     */
    getPresignedUrl(todoId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.IMAGES_BUCKET,
            Key: `${todoId}.png`,
            Expires: parseInt(this.signedUrlExpireSeconds)
        }) as string;
    }
}