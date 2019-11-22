const Docker = require('dockerode')
const fs = require('fs-extra')
const path = require('path')

const utils = require('@ignitial/iio-services').utils
const getAllMethods = utils.getMethods

class DockerConnector {
  constructor(service) {
    this._service = service

    this._docker = new Docker({socketPath: '/var/run/docker.sock'});

    this._api = getAllMethods(this._docker)

    for (let m of this._api) {
      this[m] = () => {
        let args = Array.from(arguments)
        // remove userId
        args = args.shift()
        return this._service[m].apply(this._docker[m], args)
      }
    }
  }

  buildFromRawDataArchive(buildInfo) {
    return new Promise((resolve, reject) => {
      try {
        if (buildInfo.archive && buildInfo.name) {
          let archivePath = path.join(__dirname, './dist')
          fs.writeFileSync(archivePath, buildInfo.archive)
          this.buildImage(archivePath, { t: buildInfo.name })
            .then(response => {
              try {
                fs.unlinkSync(archivePath)
                resolve(response)
              } catch (err) {
                reject(err)
              }
            })
            .catch(err => reject(err))
        } else {
          reject(new Error('info missing'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  pushImageByName(name) {
    return new Promise((resolve, reject) => {
      this.getImage(name)
        .then(image => {
          image.push().then(() => {
            resolve()
          }).catch(err => reject())
        }).catch(err => reject(err))
    })
  }
}

exports.DockerConnector = DockerConnector
