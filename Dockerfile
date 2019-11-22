FROM ignitial/dockerode

RUN mkdir -p /opt && mkdir -p /opt/docker

ADD . /opt/docker

WORKDIR /opt/docker

# RUN npm install && npm run client:build
RUN npm install

CMD ["node", "./server/index.js"]
