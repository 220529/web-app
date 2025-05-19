<script lang="ts" setup>
import type {
  FormatResult,
  PageParams,
} from '~/components/Base/Page/CompanyPage.vue'
import type {
  ProjectManagerSettlementConfig,
} from '~/types/Config/ProjectManagerSettlemengConfig'
import type { RecordParams, RecordResponse } from '~/types/Record'
import PerformancePointConfig from '~/components/Config/HumanResource/PerformancePointConfig.vue'
import type { SelectItem } from '~/types/Base/select'
import type { DepartmentItem } from '~/types/Department'

const { showLoading, hideLoading, errorMessage, successMessage }
  = useAppStore()
const { record, records } = useHttp()
const { parseTime } = useUtils()

const pageState = ref<PageParams>({
  company_id: -1,
  companies: [],
})
function handleParamsChange(params: PageParams) {
  pageState.value = params
}

const updateKey = ref(0)
function refreshList() {
  updateKey.value += 1
}

const api = useHttp()
// 获取所有分店
async function getDepartments(
  companyId: number,
): Promise<SelectItem<number>[]> {
  const res = await api.departments.fetch({
    companyId,
    page: 1,
    limit: 1000,
  })
  const deps: DepartmentItem[] = []
  function getChildren(items: DepartmentItem[]) {
    items.forEach((item) => {
      deps.push(item)
      if (item.children?.length)
        getChildren(item.children)
    })
  }
  getChildren(res.data)
  return deps
    .filter(v => v.type === 6)
    .map(v => ({ label: v.name, value: v.id }))
}
const departments = ref<SelectItem<number>[]>([])

watch(
  () => pageState.value.company_id,
  async (companyId) => {
    if (companyId) {
      departments.value = await getDepartments(companyId)
      refreshList()
    }
    else {
      departments.value = []
    }
  },
)
const confirmState = reactive({
  showConfirm: false,
  tipText: '',
  handleType: '',
  curData: null as RecordResponse | null,
  handleConfirm: () => {
    if (confirmState.handleType === 'deleteConfig')
      confirmDelete()
    else if (confirmState.handleType === 'copyConfig')
      confirmCopy()
  },
})
// 删除实际操作
async function confirmDelete() {
  showLoading()
  const res = await record.delete(confirmState.curData!.id)
  hideLoading()
  if (res.code === 1) {
    successMessage('删除成功')
    refreshList()
  }
  else {
    errorMessage('删除失败')
  }
}
// 复制实际操作
async function confirmCopy() {
  showLoading()
  const res = await record.create({
    type: 45,
    title: `${confirmState.curData!.title}_copy`,
    targetId: confirmState.curData!.targetId,
    houseSpace: confirmState.curData!.houseSpace,
    data: JSON.stringify(confirmState.curData!.data),
  })
  hideLoading()
  if (res.code === 1) {
    successMessage('复制成功')
    refreshList()
  }
  else {
    errorMessage('复制失败')
  }
}

// 启用\停用操作 按钮
async function changeStatus(data: any, status: number) {
  showLoading()
  const res: any = await record.update(
    {
      status,
      id: data.id,
    },
    data.id,
  )
  hideLoading()
  if (res.code === 1) {
    successMessage('修改成功')
    refreshList()
  }
  else {
    errorMessage('修改失败')
  }
}

// 复制配置 按钮
function openConfirmCopy(data: RecordResponse) {
  Object.assign(confirmState, {
    curData: data,
    tipText: `确定复制配置-${data.title || '无'}-吗？`,
    handleType: 'copyConfig',
    showConfirm: true,
  })
}
// 删除配置 按钮
function openDeleteConfirm(data: RecordResponse) {
  Object.assign(confirmState, {
    curData: data,
    tipText: `确定删除配置-${data.title || '无'}-吗？`,
    handleType: 'deleteConfig',
    showConfirm: true,
  })
}

const performancePointConfig = ref<InstanceType<typeof PerformancePointConfig>>()
const formatResult: FormatResult<ProjectManagerSettlementConfig> = (
  sourceList,
  { companies },
) => {
  return sourceList.map((v) => {
    let btnsList: any = []
    const btns = [
      {
        text: '复制',
        icon: 'mdi-content-copy',
        props: {
          color: 'primary',
        },
        click: () => {
          openConfirmCopy(v)
        },
      },
      {
        text: '删除',
        icon: 'mdi-delete',
        props: {
          color: 'error-0001',
        },
        click: () => {
          openDeleteConfirm(v)
        },
      },
    ]

    // 底部按钮
    btnsList = [
      {
        text: '配置',
        props: {
          variant: 'outlined',
        },
        click: async () => {
          record.get(v.id).then((res) => {
            // 打开配置编辑弹窗
            performancePointConfig.value?.show({
              companyId: v.targetId,
              data: res.data,
            })
          })
        },
      },

      v.status === 1
        ? {
            text: '停用',
            props: {
              color: 'red-darken-1',
              variant: 'elevated',
            },
            click: async () => {
              await changeStatus(v, 0)
              // 获取数据
              refreshList()
            },
          }
        : {
            text: '启用',
            props: {
              color: 'blue-darken-1',
              variant: 'elevated',
            },
            click: async () => {
              await changeStatus(v, 1)
              // 获取数据
              refreshList()
            },
          },
    ]
    const headerTags: any = []

    if (v.status === -1) {
      headerTags.push({
        text: '未启用',
        color: '#58637D',
        props: { size: 'small' },
      })
    }
    else if (v.status === 0) {
      headerTags.push({
        text: '停用',
        color: 'red',
        props: { size: 'small' },
      })
    }
    else {
      headerTags.push({
        text: '启用',
        color: 'green',
        props: { size: 'small' },
      })
    }

    const jsonData: any = v.data
    const companyName = companies?.find(comp => comp.id === v.targetId)?.name
    const deps = departments.value.filter(v =>
      jsonData.shops?.includes(v.value),
    )

    return {
      type: v.type,
      header: {
        title: v.title,
        icon: {
          type: 'mdi-semantic-web',
          size: '22px',
        },
        bg: '#f8f9fa',
        tags: headerTags,
        btns,
      },
      padding: [10, 5, 15, 5],
      table: {
        type: 'surround',
        labelWidth: 70,
        items: [
          {
            label: '适用门店',
            value: deps.map(v => v.label),
          },
        ],
        padding: [5, 10],
        lineHeight: 26, // 单独控制文本行高ß
      },
      list: {
        padding: [5, 0, 0, 10],
        items: [
          {
            icon: { type: 'mdi-clock-outline', size: '14px', color: '#BAC0CD' },
            text: `创建时间：${parseTime(v.createdAt)}`,
            size: '12px',
          },
          {
            icon: { type: 'mdi-clock-outline', size: '14px', color: '#BAC0CD' },
            text: companyName,
            size: '12px',
          },
        ],
      },
      btns: btnsList,
    }
  })
}

function handleToolbarClick(payload: { type: 'create' }) {
  if (payload.type === 'create') {
    console.log('pageState.value.company_id :>> ', pageState.value.company_id)
    performancePointConfig.value?.show({
      companyId: pageState.value.company_id,
    })
  }
}
const query = ref({ status: 999, department: 0 })
const params = computed<RecordParams>(() => {
  const q: Partial<typeof query.value> = { ...query.value }
  if (q.status === 999)
    delete q.status

  if (!q.department)
    delete q.department

  return {
    type: 45,
    ...q,
  }
})
function handleQuery(queryHandle: () => {}) {
  query.value.status = 0
  query.value.department = 0
  queryHandle()
}
onMounted(() => {
  setTimeout(() => {
    // handleToolbarClick({type: "create"})
  }, 500)
})
</script>

<template>
  <CompanyPage
    :update-key="updateKey"
    :list-api="records.fetch"
    :format-result="formatResult"
    :params="params"
    @params-change="handleParamsChange"
    @toolbar-click="handleToolbarClick"
  >
    <template #filter="scope">
      <v-select
        v-model="query.status"
        class="w-110px"
        :items="[
          { label: '全部', value: 999 },
          { label: '启用', value: 1 },
          { label: '未启用', value: -1 },
        ]"
        placeholder="状态"
        item-title="label"
        item-value="value"
        hide-details
        density="compact"
        @change="handleQuery(scope.query)"
      />
      <v-select
        v-model="query.department"
        class="ml-20px w-150px"
        :items="[
          { label: '全部', value: 0 },
          ...departments,
        ]"
        placeholder="公司"
        item-title="label"
        item-value="value"
        hide-details
        density="compact"
        @change="handleQuery(scope.query)"
      />
    </template>
  </CompanyPage>

  <LightConfirm
    v-model="confirmState.showConfirm"
    :tip-text="confirmState.tipText"
    @confirm="confirmState.handleConfirm"
  />

  <!-- 新建配置 | 编辑配置弹窗 组件 -->
  <PerformancePointConfig
    ref="performancePointConfig"
    :departments="departments"
    @refresh="refreshList"
  />
</template>

<route lang="yaml">
meta:
  layout: wujieFull
</route>
