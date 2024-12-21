//create pinia store called useLogsStore
import { defineStore } from 'pinia'
import {
  IP,
  QuasascaleAddNode,
  QuasascaleNode,
  QuasascaleRoute,
} from 'src/types/Database'
import { api } from 'boot/axios'
import { HeadscaleRoute } from 'src/types/headscale-types'
import { AxiosError } from 'axios'

export const useNodesStore = defineStore('nodes', () => {
  const { has_config_changed } = storeToRefs(useSettingsStore())

  async function getNodes(): Promise<QuasascaleNode[]> {
    const resp = await api.get<QuasascaleNode[]>('/nodes')
    return resp.data
  }

  async function renameNode(node: QuasascaleNode): Promise<void> {
    try {
      await api.post(`/node/${node.id}/rename/${node.name}`)
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function updateTags(node: QuasascaleNode): Promise<void> {
    try {
      await api.post(`/node/${node.id}/tags`, {
        tags: node.forced_tags,
      })
      useNotify('Tags updated successfully', 'check')
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function changeUser(node: QuasascaleNode): Promise<void> {
    try {
      await api.post(`/node/${node.id}/user?user=${node.user?.name}`)
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function createNode(node: QuasascaleAddNode): Promise<void> {
    try {
      await api.post(
        `/node/register?user=${node.user?.name}&key=mkey:${node.machine_key}`,
      )
      await getNodes()
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function updateIP(nodeId: number, ips: IP) {
    try {
      const resp = await api.patch(`/ip/${nodeId}`, {
        ...ips,
      })
      has_config_changed.value = true
      useNotify(resp.data.message, 'check')
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function getNodeRoutes(node_id: number): Promise<QuasascaleRoute[]> {
    const resp = await api.get(`/node/${node_id}/routes`)
    const routes = resp.data.routes as HeadscaleRoute[]
    return routes.map((route) => {
      return {
        id: route.id,
        enabled: route.enabled,
        prefix: route.prefix,
        type:
          route.prefix === '0.0.0.0/0' || route.prefix === '::/0'
            ? 'Exit node'
            : 'Subnet',
      }
    })
  }

  async function disableRoute(route_id: string): Promise<void> {
    try {
      await api.post(`/routes/${route_id}/disable`)
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function enableRoute(route_id: string): Promise<void> {
    try {
      await api.post(`/routes/${route_id}/enable`)
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }

  async function removeRoute(route_id: string): Promise<void> {
    try {
      await api.delete(`/routes/${route_id}`)
    } catch (ex: unknown) {
      if (ex instanceof AxiosError) {
        useNotify(ex.response?.data.message, 'warning', 'negative')
        throw ex
      }
    }
  }
  return {
    getNodes,
    renameNode,
    updateTags,
    changeUser,

    createNode,
    getNodeRoutes,
    disableRoute,
    enableRoute,
    removeRoute,
    updateIP,
  }
})
