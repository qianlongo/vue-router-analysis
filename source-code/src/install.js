import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  // 确保同样的Vue中只安装一次
  if (install.installed && _Vue === Vue) return
  // 添加已安装的标志
  install.installed = true
  // 用内部变量保存Vue
  _Vue = Vue
  // 非undefined
  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      // 是否有router 根节点有
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        // 定义响应式的_route, 即current变化了 对应的view也会更新
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 非根节点取其父节点
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
  // 注入$router
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })
  // 注入$route
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
  // 注册全局组件
  Vue.component('router-view', View)
  Vue.component('router-link', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
