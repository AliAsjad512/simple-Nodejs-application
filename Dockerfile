FROM node:18
RUN apt-get udpate && \ apt install npm
COPY ./my-node-app .
WORKDIR /
EXPOSE 3000
CMD["node","server.js","npm start"]