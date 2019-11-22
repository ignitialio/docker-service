import Docker from './components/Docker.vue'

// function to be called when service loaded into web app:
// naming rule: iios_<service_unique_name>
//
global.iios_docker = function(Vue) {
  // Warning: component name must be globally unique in your host app
  Vue.component('docker', Docker)

  let register = () => {
    // EXEAMPLE
    Vue.prototype.$services.emit('app:menu:add', [
      {
        path: '/service-docker',
        title: 'Docker Service view',
        svgIcon: '$$service(docker)/assets/docker.svg',
        section: 'Services',
        anonymousAccess: true,
        hideIfLogged: false,
        route: {
          name: 'Docker',
          path: '/service-docker',
          component: Docker
        }
      }
    ])

    let onServiceDestroy = () => {
      Vue.prototype.$services.emit('app:menu:remove', [{
        path: '/service-docker'
      }])

      Vue.prototype.$services.emit('service:destroy:docker:done')
    }

    Vue.prototype.$services.once('service:destroy:docker', onServiceDestroy)
  }

  if (Vue.prototype.$services.appReady) {
    register()
  } else {
    Vue.prototype.$services.once('app:ready', register)
  }
}
