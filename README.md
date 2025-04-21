# README

This test app implements a NodeJS REST API for running in Lambda that can also be tested locally. It uses the express and serverless-http node packaged modules. This is based on the [excellent tutorial](https://www.freecodecamp.org/news/serverless-architecture-with-aws-lambda/).

## Create App Locally

* Create a folder (e.g. `lambda-express-rest-api`) and cd inside

* Create a `package.json` file: 

    ```json
    {
        "name": "lambda-express-rest-api",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {
            "express": "^4.18.2",
            "serverless-http": "^3.2.0"
        }
    }
    ```

* Install the dependencies. 
    `npm install`

* Create an `app.mjs` file that defines some simple routes/methods: 

    ```js
    import express from 'express';
    const app = express();

    app.use(express.json());

    app.get('/hello', (req, res) => {
        res.json({ message: 'Hello from Express on Lambda!' });
    });

    app.post("/echo", (req, res) => {
        res.setHeader('content-type', 'application/json');
        res.json({ youSent: req.body });
    });

    app.get('/async', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.json({ message: 'Async operation completed' });
    });

    export default app;
    ```

## Test Locally

* Create a `local.mjs` file

    ```js
    import app from './app.mjs';
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
    console.log(`Local server running on http://localhost:${port}`);
    });
    ```

* Run using
    `node local.mjs`

* Test Using Curl or Postman

    ```bash
    curl 'http://localhost:3000/hello'
    ```

    with response:

    ```json
    {
        "message": "Hello from Express on Lambda!"
    }
    ```

    ```bash
    curl --location 'http://localhost:3000/echo' \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "id": 1,
    "first_name": "Kellen",
    "last_name": "Tunder",
    "email": "ktunder0@nifty.com",
    "gender": "Female",
    "ip_address": "74.254.10.244"
    }'
    ```

    with response:

    ```json
    {
        "youSent": {
            "id": 1,
            "first_name": "Kellen",
            "last_name": "Tunder",
            "email": "ktunder0@nifty.com",
            "gender": "Female",
            "ip_address": "74.254.10.244"
        }
    }
    ```

    ```bash
    curl 'http://localhost:3000/async' --header 'Content-Type: application/json'
    ```

    with response:

    ```json
    {
        "message": "Async operation completed"
    }
    ```

* Create an index.mjs Lambda Handler file: 

    ```js
    import serverless from 'serverless-http';
    import app from './app.mjs';

    export const handler = serverless(app);
    ```

## Deploy to Lambda

* Create a zip archive of your files:
    `zip -r deployment.zip node_modules app.mjs index.mjs package.json`

* Create a Lambda function (e.g. `lambda-express-rest-api`) with Node.js 22 or later and upload the deployment.zip file
    ![Imgur](https://i.imgur.com/knMF18V.png)
    ![Imgur](https://i.imgur.com/GsvgmAD.png)
    ![Imgur](https://i.imgur.com/NjPnU40.png)
    ![Imgur](https://i.imgur.com/4OqMITz.png)
    ![Imgur](https://i.imgur.com/iwlvkxQ.png)
    ![Imgur](https://i.imgur.com/UbP2ys5.png)
    ![Imgur](https://i.imgur.com/AFimWTH.png)

## Test using Function URL

* Enable Function URL with Auth type `NONE` temporarily to test your APIs

    ![Imgur](https://i.imgur.com/VObC6Or.png)
    ![Imgur](https://i.imgur.com/h1daddL.png)
    ![Imgur](https://i.imgur.com/4SstGeJ.png)

* Use CURL to test your API's

    ```bash
    curl --location 'https://hrgxowogjitvuh4rxp24jouweu0svrhz.lambda-url.us-east-1.on.aws/hello'
    ```

    ```bash
    curl 'https://hrgxowogjitvuh4rxp24jouweu0svrhz.lambda-url.us-east-1.on.aws/echo' \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "id": 1,
    "first_name": "Kellen",
    "last_name": "Tunder",
    "email": "ktunder0@nifty.com",
    "gender": "Female",
    "ip_address": "74.254.10.244"
    }'
    ```

    ```bash
    curl 'https://hrgxowogjitvuh4rxp24jouweu0svrhz.lambda-url.us-east-1.on.aws/async' --header 'Content-Type: application/json'
    ```
    with response:
    ```json
    {
        "message": "Async operation completed"
    }
    ```

    with same responses as before

## Configure AWS API Gateway

* Create a REST API in the AWS API Gateway
* Create a resource (hello) and a method (GET) and link to your lambda function
    ![Imgur](https://i.imgur.com/2DeDNtR.png)
* Deploy to a stage
    ![Imgur](https://i.imgur.com/vI9k9Ke.png)
* Now, you can access your Express.js application through the API Gateway endpoint
    ```bash
    curl --location 'https://r86cp1oowh.execute-api.us-east-1.amazonaws.com/prod/hello'
    ```
* Add API Key authentication to secure your API
* You can delete the Function URL created above

## Use Docker and ECR

Instead of zipping the project and uploading to Lambda, you can create a docker image and upload it to AWS ECR and use the image when creating a lambda function.

You need the aws and docker cli's installed and working.

* Create a Dockerfile

    ```dockerfile
    FROM public.ecr.aws/lambda/nodejs:20

    # Set working directory
    WORKDIR /var/task

    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm install

    # Copy app code
    COPY . .

    # Specify the Lambda function handler
    CMD ["index.handler"]
    ```

* Use the Dockerfile to build a Docker image

```bash
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
docker buildx build --platform linux/amd64 -t lambda-express-rest-api-docker .
```

* Tag the image

ECR_URL=<aws_account_id>.dkr.ecr.<region>.amazonaws.com/<repository_name>

```bash
ECR_URL=411427429079.dkr.ecr.us-east-1.amazonaws.com/lambda-express-rest-api-docker
docker tag lambda-express-rest-api-docker:latest $ECR_URL:latest
```

* Create ECR Repo

```bash
aws ecr create-repository --repository-name lambda-express-rest-api-docker --region us-east-1
```

* Push to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URL
docker push $ECR_URL:latest
```

![Imgur](https://i.imgur.com/9ax5gBU.png)

* Create a lambda function and select Container image and select the image you just uploaded

![Imgur](https://i.imgur.com/r1CxQXz.png)
![Imgur](https://i.imgur.com/ecjBqvd.png)
![Imgur](https://i.imgur.com/rOXoJbM.png)
![Imgur](https://i.imgur.com/VbFM4wi.png)

* Enable Function URL as above and test your API's

* Configure AWS API Gateway as above and test your API's