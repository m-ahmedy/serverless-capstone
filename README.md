# Udacity ToDos Serverless capstone project

## Project Components
- Restful API (Lambda Functions, API Gateway and DynamoDB)
- Client (React)

## How to run the application
### Deploy Backend
To deploy an application run the following commands:

```bash
cd backend
npm install
sls deploy -v
````
### Update frontend configuration
```js
const apiId = ''
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  
  domain: '{DOMAIN}.auth0.com',            // Auth0 domain
  clientId: '{CLIENT_ID}',          // Auth0 client id
  callbackUrl: 'http://localhost:3000'
}
```
### Frontend
```bash
cd client
npm install
npm run start
```

## Current Deplyment details
API Endpoint
```
https://{API_ID}.execute-api.us-east-1.amazonaws.com/dev/todos
```
Postman Collection
```
Udacity Cloud developer capstone.postman_collection.json
```
