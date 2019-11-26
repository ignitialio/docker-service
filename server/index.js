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
    this._dc = new DockerConnector(this, this._options.docker)
    return super._init()
  }

  buildFromRemote(options) {
    /* @_POST_ */
    return new Promise(async (resolve, reject) => {
      if (options.t && options.remote) {
        try {
          await this._dc._docker.buildImage(null, {
            remote: options.remote,
            t:  options.t
          })

          console.log('++++build done', options.t)
          resolve(options.imageName)
        } catch (err) {
          console.log('ERROR++++reject', err)
          reject(err)
        }
      } else {
        reject(new Error('info missing'))
      }
    })
  }

  buildFromRawDataArchive(buildInfo) {
    /* @_POST_ */
    return new Promise(async (resolve, reject) => {
      if (buildInfo.data && buildInfo.name) {
        let staticPath = path.join(process.cwd(), this._options.server.path)
        let archivePath = path.join(staticPath, './dist', buildInfo.name + '.tar')

        fs.writeFileSync(archivePath, buildInfo.data, 'binary')

        let imageName = this._options.docker.registry + '/' + buildInfo.name
        let url = 'http://' + this._options.server.host + ':' +
          this._options.server.port + '/dist/' + buildInfo.name + '.tar'

        try {
          await this._dc._docker.buildImage(null, {
            remote: url,
            t:  imageName
          })

          fs.unlinkSync(archivePath)
          resolve(imageName)
        } catch (err) {
          fs.unlinkSync(archivePath)
          reject(err)
        }
      } else {
        reject(new Error('info missing'))
      }
    })
  }

  pushImageByName(name) {
    /* @_POST_ */
    return new Promise((resolve, reject) => {
      let image = this._dc._docker.getImage(name)
      image.push(undefined, err => {
        if (err) {
          reject(err)
          console.log(err, name)
        } else {
          resolve()
        }
      }, { authconfig: {} })
    })
  }

  isImageAvailable(name) {
    /* @_POST_ */
    return new Promise((resolve, reject) => {
      let image = this._dc._docker.getImage(name)
      image.inspect().then(result => {
        resolve()
      }).catch(err => reject(err))
    })
  }

  runService(imageName, options) {
    /* @_POST_ */
    return new Promise((resolve, reject) => {
      this._dc._docker.createContainer({
        Image: imageName,
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
        ...options
      }).then(container => {
        console.log('running', container.id)
        container.start().then(() => {
          resolve(container.id)
        }).catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }

  stopContainer(id, remove) {
    /* @_POST_ */
    return new Promise(async (resolve, reject) => {
      console.log('stop container', id, remove)
      try {
        let container = this._dc._docker.getContainer(id)
        await container.stop()
        if (remove) {
          container.remove()
        }

        resolve()
      } catch (err) {
        console.log(err)
        reject(err)
      }
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
