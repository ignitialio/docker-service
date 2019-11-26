const Docker = require('dockerode')
const fs = require('fs-extra')
const path = require('path')

const utils = require('@ignitial/iio-services').utils
const getAllMethods = utils.getMethods

class DockerConnector {
  constructor(service, options) {
    this._service = service
    console.log('docker client will target: ', options)

    if (!options.socketPath) {
      this._docker = new Docker({
        host: options.host,
        port: options.port,
        protocol: options.protocol,
        socketPath: null
      })
    } else {
      this._docker = new Docker({ socketPath: options.socketPath })
    }

    this._api = getAllMethods(this._docker)

    for (let m of this._api) {
      let docker = this._docker
      service[m] = function() {
        let args = Array.from(arguments)
        // remove grants info
        args = args.splice(0, args.length - 1)
        console.log('----', m, args)
        return docker[m].apply(docker, args)
      }
    }
  }
}

exports.DockerConnector = DockerConnector
