<template>
  <q-page padding>
    <q-table
      ref="table"
      :grid="grid_view || $q.screen.lt.sm"
      title="Nodes"
      class="rounded-xl"
      table-header-class="text-[#929289] font-bold"
      title-class="title-text"
      :rows="nodes"
      :columns="cols"
      row-key="name"
      :filter="filter"
      :pagination="{ rowsPerPage: 0 }"
      flat
      bordered
      hide-pagination
      binary-state-sort
    >
      <template v-slot:top-right v-if="$q.screen.gt.sm">
        <q-input
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search"
          color="white"
          class="q-mr-xl"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          @click="addNode"
          icon="add"
          label="New Node"
          color="primary"
          outline
        />
      </template>
      <template #top v-else>
        <div class="row justify-between full-width">
          <div class="title-text q-table__title">Nodes</div>
          <q-btn @click="addNode" icon="add" color="primary" outline dense />
        </div>
        <div class="row full-width q-pt-sm">
          <q-toggle
            v-model="online"
            @update:model-value="showOnlineOnly"
            dense
            :color="
              online === true ? 'positive' : online === false ? 'negative' : ''
            "
            toggle-indeterminate
            keep-color
          />
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Search"
            color="white"
            class="q-mx-md col"
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-btn icon="swap_vert" dense flat class="q-my-auto">
            <q-menu fit auto-close class="dialog-delete rounded-xl">
              <q-list class="min-w-150px">
                <q-item>
                  <q-item-section>Sort By</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="table?.sort('id')">
                  <q-item-section>id</q-item-section>
                </q-item>
                <q-item clickable @click="table?.sort('name')">
                  <q-item-section>name</q-item-section>
                </q-item>
                <q-item clickable @click="table?.sort('lastseen')">
                  <q-item-section>last seen</q-item-section>
                </q-item>
                <q-item clickable @click="table?.sort('ipv4')">
                  <q-item-section>IPv4</q-item-section>
                </q-item>
                <q-item clickable @click="table?.sort('ipv6')">
                  <q-item-section>IPv6</q-item-section>
                </q-item>
                <q-item clickable @click="table?.sort('user')">
                  <q-item-section>user</q-item-section>
                </q-item>
                <q-item clickable @click="table?.sort('tags')">
                  <q-item-section>forced tags</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </template>
      <template #header-cell-id="props">
        <q-th auto-width :props="props">
          <q-toggle
            v-model="online"
            @update:model-value="showOnlineOnly"
            dense
            class="q-mr-sm"
            :color="
              online === true ? 'positive' : online === false ? 'negative' : ''
            "
            size="xs"
            toggle-indeterminate
            keep-color
          />
          <span @click="props.sort">ID</span>
        </q-th>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td>
            <div class="row no-wrap items-center gap-10px">
              <animated-circle :is_positive="props.row.online" />
              {{ props.row.id }}
            </div>
          </q-td>
          <q-td>
            {{ props.row.name }}
            <q-btn
              icon="content_copy"
              size="xs"
              dense
              round
              flat
              color="primary"
              @click="copyName(props.row.name)"
            />
          </q-td>
          <q-td>{{ new Date(props.row.last_seen).toLocaleString() }}</q-td>
          <q-td>
            {{ props.row.ipv4 }}
            <q-btn
              icon="content_copy"
              size="xs"
              dense
              round
              flat
              color="primary"
              @click="copyToClipboard(props.row.ipv4)"
            />
          </q-td>
          <q-td>
            {{ props.row.ipv6 }}
            <q-btn
              icon="content_copy"
              size="xs"
              dense
              round
              flat
              color="primary"
              @click="copyToClipboard(props.row.ipv6)"
            />
          </q-td>
          <q-td>{{ props.row.user.name }}</q-td>
          <q-td
            ><template v-for="tag in props.row.forced_tags" :key="tag">
              <q-badge
                outline
                color="primary"
                :label="formatTag(tag)"
                class="q-mr-sm"
              /> </template
          ></q-td>
          <q-td key="actions" :props="props">
            <div class="row gap-3px justify-end">
              <q-btn
                icon="route"
                flat
                round
                color="green"
                dense
                v-if="props.row.routes > 0"
                @click="manageRoutes(props.row)"
              >
                <q-tooltip> Manage Routes </q-tooltip>
              </q-btn>
              <q-btn
                icon="edit"
                flat
                round
                color="secondary"
                dense
                @click="editNode(props.row, props.rowIndex)"
              >
                <q-tooltip> Edit Node </q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                color="warning"
                icon="timer_off"
                @click="expireNode(props.row)"
              >
                <q-tooltip> Expire Node </q-tooltip>
              </q-btn>
              <q-btn
                icon="delete"
                flat
                round
                color="negative"
                dense
                @click="removeNode(props.row, props.rowIndex)"
              >
                <q-tooltip> Delete Node </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
      <template #item="props">
        <q-card flat bordered class="rounded-xl">
          <q-card-section>
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-h6 col-grow row items-center">
                <div class="row items-center gap-6px">
                  <animated-circle :is_positive="props.row.online" />
                  <div>{{ props.row.name }}</div>
                </div>

                <template v-for="tag in props.row.forced_tags" :key="tag">
                  <q-badge
                    outline
                    color="primary"
                    :label="formatTag(tag)"
                    class="q-ml-xs"
                  />
                </template>
              </div>
              <q-btn icon="more_vert" dense round flat>
                <q-menu auto-close class="dialog-delete rounded-xl">
                  <q-list style="min-width: 100px">
                    <q-item
                      clickable
                      @click="editNode(props.row, props.rowIndex)"
                    >
                      <q-item-section avatar>
                        <q-icon color="secondary" name="edit" />
                      </q-item-section>
                      <q-item-section>Edit Node</q-item-section>
                    </q-item>

                    <q-item clickable @click="expireNode(props.row)">
                      <q-item-section avatar>
                        <q-icon color="warning" name="timer_off" />
                      </q-item-section>
                      <q-item-section>Expire Node</q-item-section>
                    </q-item>

                    <q-item
                      clickable
                      @click="removeNode(props.row, props.rowIndex)"
                    >
                      <q-item-section avatar>
                        <q-icon color="negative" name="delete" />
                      </q-item-section>
                      <q-item-section>Delete Node</q-item-section>
                    </q-item>

                    <q-separator v-if="props.row.routes > 0" />

                    <q-item
                      clickable
                      @click="manageRoutes(props.row)"
                      v-if="props.row.routes > 0"
                    >
                      <q-item-section avatar>
                        <q-icon color="positive" name="route" />
                      </q-item-section>
                      <q-item-section>Routes</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable @click="copyName(props.row.name)">
                      <q-item-section avatar>
                        <q-icon color="primary" name="content_copy" />
                      </q-item-section>
                      <q-item-section>FQDN</q-item-section>
                    </q-item>
                    <q-item clickable @click="copyToClipboard(props.row.ipv4)">
                      <q-item-section avatar>
                        <q-icon color="primary" name="content_copy" />
                      </q-item-section>
                      <q-item-section>IPv4</q-item-section>
                    </q-item>
                    <q-item clickable @click="copyToClipboard(props.row.ipv6)">
                      <q-item-section avatar>
                        <q-icon color="primary" name="content_copy" />
                      </q-item-section>
                      <q-item-section>IPv6</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div class="row justify-between">
              <div class="column gap-5px">
                <div>
                  <span class="text-weight-bold text-accent"> User: </span>
                  <span class="text-info">{{ props.row.user.name }} </span>
                </div>
                <div>
                  <span class="text-weight-bold text-accent"> IPv4: </span>
                  <span class="text-info">{{ props.row.ipv4 }} </span>
                </div>
              </div>
              <div class="column gap-5px">
                <div>
                  <span class="text-weight-bold text-accent">Last Seen: </span>
                  <span class="text-info">{{
                    new Date(props.row.last_seen).toLocaleString()
                  }}</span>
                </div>
                <div>
                  <span class="text-weight-bold text-accent"> IPv6: </span>
                  <span class="text-info">{{ props.row.ipv6 }} </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { extend, QTable, QTableColumn } from 'quasar'
import AddNode from 'src/components/nodes/AddNode.vue'
import EditNode from 'src/components/nodes/EditNode.vue'
import RouteConfigurationComponent from 'src/components/nodes/RouteConfigurationComponent.vue'
import { QuasascaleAddNode, QuasascaleNode } from 'src/types/Database'
import { is, copyToClipboard } from 'quasar'
import { AxiosError } from 'axios'
import { api } from 'boot/axios'
import { Addr } from 'ip.js'
const { tailnetName } = storeToRefs(useDnsSettingsStore())
const { getDNSSettings } = useDnsSettingsStore()
const filter = ref('')
const { grid_view } = storeToRefs(useSettingsStore())
const {
  getNodes,
  renameNode,
  changeUser,
  updateTags,
  createNode,
  getNodeRoutes,
  updateIP,
} = useNodesStore()

const nodes = ref<QuasascaleNode[]>([])
const table = ref<QTable>()
const { users } = storeToRefs(useUsersStore())
const cols = ref<QTableColumn[]>([
  {
    name: 'id',
    required: true,
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
    sort: (a, b) => parseInt(a) - parseInt(b),
  },
  {
    name: 'name',
    required: true,
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'lastseen',
    required: true,
    label: 'Last Seen',
    field: 'node_last_seen',
    align: 'left',
    sortable: true,
  },
  {
    name: 'ipv4',
    required: true,
    label: 'IPv4',
    field: 'ipv4',
    align: 'left',
    sortable: true,
    sort: (a, b) => sortIP(a, b),
  },
  {
    name: 'ipv6',
    required: true,
    label: 'IPv6',
    field: 'ipv6',
    align: 'left',
    sortable: true,
    sort: (a, b) => sortIP(a, b),
  },
  {
    name: 'user',
    required: true,
    label: 'User',
    field: 'user',
    align: 'left',
    sortable: true,
    sort: (a, b) => a.name.localeCompare(b.name),
  },
  {
    name: 'tags',
    required: true,
    label: 'Forced Tags',
    field: 'forced_tags',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: '',
    align: 'right',
  },
])

const online = ref(null)

function sortIP(a: string, b: string) {
  const ipa = new Addr(a)
  const ipb = new Addr(b)
  return ipa.compare2Ip(ipb)
}

function editNode(node: QuasascaleNode, index: number): void {
  useDialog()
    .show(EditNode, {
      node: node,
    })
    .onOk(async (updatedNode: QuasascaleNode) => {
      try {
        if (node.name !== updatedNode.name) await renameNode(updatedNode)
        if (!is.deepEqual(node.forced_tags, updatedNode.forced_tags))
          await updateTags(updatedNode)
        if (node.user?.id !== updatedNode.user?.id)
          await changeUser(updatedNode)
        if (node.ipv4 !== updatedNode.ipv4 && node.ipv6 !== updatedNode.ipv6)
          await updateIP(updatedNode.id, {
            IPv4: updatedNode.ipv4,
            IPv6: updatedNode.ipv6,
          })
        else if (node.ipv4 !== updatedNode.ipv4)
          await updateIP(updatedNode.id, { IPv4: updatedNode.ipv4 })
        else if (node.ipv6 !== updatedNode.ipv6)
          await updateIP(updatedNode.id, { IPv6: updatedNode.ipv6 })
        nodes.value[index] = updatedNode
      } catch {}
    })
}

function addNode(): void {
  if (users.value.length === 0) return
  useDialog()
    .show(AddNode)
    .onOk(async (node: QuasascaleAddNode) => {
      try {
        await createNode(node)
        useNotify('Node created successfully', 'check')
      } catch (error) {
        useNotify(
          'An error has occcured while adding the node',
          'warning',
          'negative',
        )
      }
    })
}

function removeNode(node: QuasascaleNode, index: number): void {
  useDialog()
    .del()
    .onOk(async () => {
      try {
        await api.delete(`/node/${node.id}`)
        nodes.value = nodes.value.splice(index, 1)
        useNotify('Node delete successfully', 'check')
      } catch (ex) {
        if (ex instanceof AxiosError) {
          useNotify(ex.response?.data.message, 'warning', 'negative')
        }
      }
    })
}

function expireNode(node: QuasascaleNode): void {
  useDialog()
    .del('Are you sure you want to expire this node?')
    .onOk(async () => {
      try {
        await api.post(`/node/${node.id}/expire`)
        useNotify('Node expired successfully', 'check')
      } catch (ex) {
        if (ex instanceof AxiosError) {
          useNotify(ex.response?.data.message, 'warning', 'negative')
        }
      }
    })
}

async function manageRoutes(node: QuasascaleNode): Promise<void> {
  try {
    const routes = await getNodeRoutes(node.id)
    if (routes.length === 0) {
      useNotify('Node has no routes', 'directions_off', 'negative')
      return
    }
    useDialog().show(RouteConfigurationComponent, {
      routes: routes,
      nodeId: node.id,
    })
  } catch (error) {
  } finally {
  }
}

function formatTag(tag: string) {
  return tag.replace('tag:', '')
}

onMounted(async () => {
  nodes.value = await getNodes()
  nodes.value.sort(
    (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
  )
  extend(true, initial_nodes, nodes.value)
})

const initial_nodes: QuasascaleNode[] = []
function showOnlineOnly(value: boolean) {
  if (value === true || value === false) {
    nodes.value = initial_nodes.filter((node) => node.online === value)
  } else {
    nodes.value = initial_nodes
  }
}

async function copyName(name: string) {
  if (tailnetName.value === null) {
    await getDNSSettings()
  }
  copyToClipboard(`${name}.${tailnetName.value}`)
}
</script>
<style lang="scss">
.q-toggle__inner--falsy {
  .q-toggle__thumb:after {
    background-color: $negative;
  }
}
</style>
