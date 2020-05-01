FROM node:latest

WORKDIR /opt/api

# Dependencies
COPY ./api/package.json /opt/api/
RUN npm install
RUN npm install -g nodemon

# Application
# Using volumes for development
# COPY ./api /opt/api/

# Expected port
EXPOSE 3000

# Run
CMD ["npm", "run", "start"]
