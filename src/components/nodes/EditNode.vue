<template>
  <q-card
    flat
    :bordered="$q.screen.gt.xs"
    class="rounded-xl! w-100% bg-stone-950"
  >
    <q-form @submit="saveChanges">
      <q-card-section class="q-py-sm">
        <div class="row justify-between items-center">
          <div class="items-center text-h6">Edit Node</div>
          <div>
            <q-btn flat round icon="close" v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-y-sm">
        <q-input
          outlined
          hide-bottom-space
          v-model="_node.name"
          label="Node Name"
          :rules="[(val) => !!val || 'Field required']"
        />
        <q-select
          outlined
          v-model="_node.user!.id"
          :options="users"
          placeholder="select a user"
          label="User"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          :rules="[(val) => !!val || 'Field is required']"
          hide-bottom-space
        />
        <q-input
          outlined
          hide-bottom-space
          v-model="_node.ipv4"
          label="IPv4"
          :rules="[
            (val) => !!val || 'Field required',
            (val) => validateIPv4(val) || 'Wrong ip format',
          ]"
        />
        <q-input
          outlined
          hide-bottom-space
          v-model="_node.ipv6"
          label="IPv6"
          :rules="[
            (val) => !!val || 'Field required',
            (val) => validateIPv6(val) || 'wrong ip format',
          ]"
        />
        <q-select
          label="Forced Tags"
          outlined
          v-model="forced_tags"
          use-input
          use-chips
          @new-value="addNewTag"
          multiple
          hide-dropdown-icon
          input-debounce="0"
          hint="Enter the tag and press enter"
          hide-hint
          hide-bottom-space
        />
      </q-card-section>
      <q-card-actions vertical>
        <q-btn
          label="Save"
          color="primary"
          icon="save"
          type="submit"
          rounded
          outline
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { extend } from 'quasar'
import { QuasascaleNode } from 'src/types/Database'
defineOptions({ name: 'edit-node-dialog' })
const props = defineProps<{
  onDialogOK: (payload: QuasascaleNode) => void
  componentProps: {
    node: QuasascaleNode
  }
}>()
const { validateIPv4, validateIPv6 } = useUtils()
const { users } = storeToRefs(useUsersStore())
const _node = ref<QuasascaleNode>(extend(true, {}, props.componentProps.node))

const forced_tags = ref(
  _node.value.forced_tags.map((tag) => {
    return tag.replace('tag:', '')
  }),
)
function saveChanges(): void {
  const user = users.value.find((user) => {
    return user.id === _node.value.user?.id
  })

  if (user) {
    _node.value.user = user
  }

  _node.value.forced_tags = forced_tags.value.map((tag) => 'tag:' + tag)

  props.onDialogOK(_node.value)
}

function addNewTag(
  tag: string,
  done: (
    item?: string,
    mode?: 'toggle' | 'add' | 'add-unique' | undefined,
  ) => void,
) {
  if (tag === '' || forced_tags.value.includes(tag)) {
    done()
    return
  }
  done(tag, 'add-unique')
}
</script>
