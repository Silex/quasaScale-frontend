<template>
  <q-card
    flat
    :bordered="$q.screen.gt.xs"
    class="rounded-xl! w-100% bg-stone-950"
  >
    <q-form @submit="saveChanges">
      <q-card-section class="q-py-sm">
        <div class="row justify-between items-center">
          <div class="items-center text-h6">Add Node</div>
          <div>
            <q-btn flat round icon="close" v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-y-sm">
        <q-select
          outlined
          v-model="user"
          :options="users"
          placeholder="select a user"
          label="User"
          option-label="name"
          map-options
          :rules="[(val) => !!val || 'Field is required']"
          hide-bottom-space
        />

        <q-input
          :rules="[
            (val) =>
              validateMachineKey(val) || 'Format have to be HEX, 64 char',
          ]"
          outlined
          hide-bottom-space
          v-model="mkey"
          label="Machine Key"
          hint="Enter only the key without mkey:"
          hide-hint
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
import { QuasascaleAddNode, User } from 'src/types/Database'
defineOptions({ name: 'add-node-dialog' })
const props = defineProps<{
  onDialogOK: (payload: QuasascaleAddNode) => void
}>()
const { users } = storeToRefs(useUsersStore())
const user = ref<User>(users.value[0])
const mkey = ref('')

function saveChanges(): void {
  if (user.value.id === undefined || user.value.id === null) {
    useNotify('No user selected', 'warning', 'warning')
    return
  }
  props.onDialogOK({ user: user.value, machine_key: mkey.value })
}

function validateMachineKey(key: string) {
  const regex = /^[a-fA-F0-9]{64}$/
  return regex.test(key)
}
</script>
