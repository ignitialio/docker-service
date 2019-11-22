<template>
  <div :id="id" class="docker-layout">
    {{ $t('Insert here your own UI components') }}
  </div>
</template>

<script>
export default {
  props: [ ],
  data: () => {
    return {
      id: 'docker_' + Math.random().toString(36).slice(2)
    }
  },
  computed: {

  },
  methods: {
  },
  mounted() {
    // dev
    // refresh service UI on hot reload
    this.$services.once('service:up', service => {
      if (service.name === 'docker') {
        localStorage.setItem('HR_PATH', '/service-docker')
        window.location.reload()
      }
    })
  },
  beforeDestroy() {

  }
}
</script>

<style>
  .docker-layout {
    width: 100%;
    height: calc(100% - 0px);
  }
</style>
