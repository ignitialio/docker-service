const Service = require('@ignitial/iio-services').Service
const config = require('./config')

const DockerConnector = require('./dockerode').DockerConnector

class Docker extends Service {
  constructor(options) {
    super(options)
  }

  _init() {
    new DockerConnector(this)
    return super._init()
  }
}

// instantiate service with its configuration
const docker = new Docker(config)

docker._init().then(() => {
  console.log('service [' + docker.name + '] initialization done with options ',
    docker._options)
}).catch(err => {
  console.error('initialization failed', err)
  process.exit(1)
})
