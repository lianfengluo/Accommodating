# Authors
Richard Luo

# Frontend
*Language:* Javascript\
*framework:* React

## Install npm
Follow the [instruction](https://www.npmjs.com/get-npm) to install npm.

<img src="https://img.shields.io/badge/react-16.9.0%2B-blue" alt="react 16.9.0"></img> 


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory (frontend), you can run:

### `npm install`
To install all the package in the `package.json` file.

### fill in the google api key

In the `frontend/.env` file.

```
REACT_APP_GMAIL_API_KEY="<Your google api key>"
```

### `npm start` (for developement)

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build` (for production)

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
### notes:
The `.env`, `.env.development` and `.env.production` will be used for the global variable settings.
<hr>

# Backend

*Language:* python\
*framework:* django (restful framework)\
<img src="https://img.shields.io/badge/python-3.6%2B-blue" alt="python 3.6+"></img> 
<img src="https://img.shields.io/badge/postgresql-9.5%2B-green" alt="postgres 9.5+"></img> 

## Development
### Setup secret in accommendating directory.
`cd Accommodating`
create secret.py in the direactory
secret.py format:
```
<!-- Email secret info -->
MY_EMAIL_SERVER = '<Your email server host>'
MY_EMAIL_SERVER_PORT = '<Your email server port>''
<!-- if your email server port is SSL then set it to ssl otherwise None -->
MY_EMAIL_SERVER_TYPE = 'SSL'
MY_EMAIL_USERNAME = '<Your email server username>'
MY_EMAIL_PASSWORD = '<email server password>'

<!-- database secret info -->
DATABAE_NAME = '<DATABAE_NAME>'
DATABAE_USERNAME = '<DATABAE_USERNAME>'
DATABASE_PASSWORD = '<DATABASE_PASSWORD>'
<!-- app secret key -->
<!-- By running the generate_secret.py or your custom way as long as complex enough -->
MY_SECRET_KEY = '<YOUR_SECRET_KEY>'
```

1. Install [Docker](https://store.docker.com/search?type=edition&offering=community) and [docker-compose](https://docs.docker.com/compose/install/#install-compose)
2. Change the database name, database username, database password correspondly in the `docker-compose.yml` file.
```
db:
  restart: always
  image: postgres:9.5
  ports:
    - "5432:5432"
  volumes:
    - ./database:/var/lib/postgresql/data
  environment:
    POSTGRES_PASSWORD: "<database password>"
    POSTGRES_USER: "<database username>"
    POSTGRES_DB: "<database name>"
```
3. From your terminal, run `docker-compose build` followed by `docker-compose up` in the root of the application directory, if you are in the development mode you will be setting DJANGO_DEBUG=true false otherwise.

## Production
1. In frontend run `npm build` before `docker-compose up`.
2. Change the debug mode (DJANGO_DEBUG) to "false" in the `docker-compose.yml` file.
```
  backend:
    restart: always
    build: ./backend
    environment:
      # The domain will run in production mode;
      # It will run http://localhost:9000 in development mode.
      # You can change it is the Accommodating.settings.py file
      - WEB_DOMAIN=https://0.0.0.0:443  
      - DJANGO_DEBUG=false
```
3. After that it almost the same as the development (run `docker-compose build` followed by `docker-compose up`) only different between these two is that production will hold on port 80 and the developement will hold on port 9000.\
In production both frontend code and backend code will run on the same server, whereas, the frontend code will run on http://localhost:3000 in development.\
You can export the 80 by using DDNS server or other proxy. \
Add your hostname in `Accommodating/settings.py`
```
ALLOWED_HOSTS = ["localhost", '127.0.0.1', '0.0.0.0']
``` 
### notes:
You can command out the `nginx` container setup code in `docker-compose.yml` when you doing the developement because the development mode is not rely on it.
<hr>

## Packages Used

### Frontend Dependencies

| Package Name     | License                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| React.js         | [MIT](https://github.com/facebook/react/blob/master/LICENSE)              |
| create-react-app | [MIT](https://github.com/facebook/create-react-app/blob/master/LICENSE)     |
| react-router     | [MIT](https://github.com/ReactTraining/react-router/blob/master/LICENSE)  |
| Ant Design       | [MIT](https://github.com/ant-design/ant-design/blob/master/LICENSE)       |
| moment           | [MIT](https://github.com/moment/moment/blob/develop/LICENSE)              |
| google-maps-react | [MIT](https://github.com/fullstackreact/google-maps-react/blob/master/LICENSE)|
| react-image-gallery | [MIT](https://github.com/xiaolin/react-image-gallery/blob/master/LICENSE)|
| react-places-autocomplete | [MIT](https://github.com/hibiken/react-places-autocomplete/blob/master/LICENSE.md)|



### Backend Dependencies

| Package Name                      | License                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Django                            | [BSD](https://github.com/django/django/blob/master/LICENSE)                                 |
| djangorestframework               | [BSD](https://github.com/encode/django-rest-framework/blob/master/LICENSE.md)               |
| django-cors-headers               | [LICENSE](https://github.com/ottoyiu/django-cors-headers/blob/master/LICENSE)               |
| psycopg2-binary |[LICENSE](https://github.com/psycopg/psycopg2/blob/master/LICENSE)|
| Pillow |[LICENSE](https://github.com/python-pillow/Pillow/blob/master/LICENSE)|
| django-extensions |[MIT](https://github.com/django-extensions/django-extensions/blob/master/LICENSE)|

