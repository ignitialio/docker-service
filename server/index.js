const fs = require('fs')
const path = require('path')
const tar = require('tar')
const _ = require('lodash')

const Service = require('@ignitial/iio-services').Service
const config = require('./config')

const DockerConnector = require('./dockerode').DockerConnector

class Docker extends Service {
  constructor(options) {
    super(options)
  }

  _init() {
    new DockerConnector(this, this._options.docker)
    return super._init()
  }

  buildFromRawDataArchive(buildInfo, grants) {
    /* @_POST_ */
    return new Promise(async (resolve, reject) => {
      try {
        if (buildInfo.data && buildInfo.name) {
          let staticPath = path.join(process.cwd(), this._options.server.path)
          let archivePath = path.join(staticPath, './dist', buildInfo.name + '.tar')
          console.log(archivePath)
          fs.writeFileSync(archivePath, buildInfo.data, 'binary')

          let imageName = this._options.docker.registry + '/' + buildInfo.name
          let url = 'http://' + this._options.server.host + ':' +
            this._options.server.port + '/dist/' + buildInfo.name + '.tar'

          this.buildImage(null, {
            remote: url,
            t:  imageName
          }, grants)
            .then(() => {
              try {
                fs.unlinkSync(archivePath)
                resolve(imageName)
              } catch (err) {
                fs.unlinkSync(archivePath)
                reject(err)
              }
            })
            .catch(err => {
              console.log(err)
              reject(err)
            })
        } else {
          reject(new Error('info missing'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  pushImageByName(name, grants) {
    /* @_POST_ */
    return new Promise((resolve, reject) => {
      this.getImage(name, grants)
        .then(image => {
          image.push().then(() => {
            resolve()
          }).catch(err => reject())
        }).catch(err => reject(err))
    })
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
