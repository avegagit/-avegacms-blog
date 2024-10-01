<template>
  <CmsDashboardPage>
    <CmsDashboardPageHeader title="Управление тегами">
      <template #right>
        <CmsButton
          label="Создать тег"
          title="Создать тег"
          icon="i-heroicons-plus-16-solid"
          @click="create"
        />
      </template>
    </CmsDashboardPageHeader>
    <CmsDashboardPageContent ref="contentRef">
      <CmsCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
        <CmsTable v-bind="{ loading, rows, columns }">
          <template #id-data="{ row }: { row: BlogTag }">
            <a
              href="#"
              class="text-primary p-2 font-medium"
              title="Редактировать"
              @click.prevent="edit(row.id)"
            >
              {{ row.id }}
            </a>
          </template>

          <template #active-data="{ row }: { row: BlogTag }">
            <CmsBadge :color="row.active ? 'green' : 'red'">
              {{ row.active ? "Активен" : "Не активен" }}
            </CmsBadge>
          </template>

          <template #num-data="{ row }: { row: BlogTag }">
            <NuxtLink
              to="/blog/posts"
              class="text-primary p-2 font-medium"
              title="Перейти к постам"
            >
              {{ row.num }}
            </NuxtLink>
          </template>

          <template #actions-data="{ row }: { row: BlogTag }">
            <CmsDropdown :items="actions(row)">
              <CmsButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
                title="Действия"
              />
            </CmsDropdown>
          </template>
        </CmsTable>

        <template #footer>
          <div class="flex justify-end">
            <CmsPagination v-bind="pagination" v-model="page" />
          </div>
        </template>
      </CmsCard>
    </CmsDashboardPageContent>
  </CmsDashboardPage>
</template>

<script setup lang="ts">
import {
  CmsConfirmModal,
  BlogTagsCreateModal,
  BlogTagsEditModal,
} from "#components";
import type { BlogTag } from "#module/blog/types";
import type { CmsPagination } from "avegacms/src/types/core";
import type { DropdownItem } from "#ui/types";

useSeoMeta({
  title: "Управление тегами",
});

const api = useApi();
const modal = useModal();
const toast = useToast();
const route = useRoute();
const screenSpinner = useScreenSpinner();

const contentRef = ref();

const { data, status, execute } = useAsyncData(() => {
  return api<{ data: BlogTag[]; meta: { pagination: CmsPagination } }>(
    "admin/blog/tags",
    { query: route.query }
  );
});

const loading = computed(() => status.value === "pending");
const rows = computed(() => data.value?.data ?? []);
const columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "name",
    label: "Название",
  },
  {
    key: "active",
    label: "Активен",
  },
  {
    key: "num",
    label: "Кол-во постов",
  },
  {
    key: "actions",
  },
];

const actions = (row: BlogTag) => {
  return [
    [
      {
        label: "Редактировать",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => edit(row.id),
      },
      {
        label: "Перейти к постам",
        icon: "i-heroicons-list-bullet",
        to: "/blog/posts",
      },
    ],
    [
      {
        label: "Удалить",
        icon: "i-heroicons-trash-20-solid",
        class: "text-red-500",
        iconClass: "text-red-500",
        click: () => remove(row.id),
      },
    ],
  ] as DropdownItem[][];
};

const page = useRouteQuery("page", 1, { transform: Number });
const pagination = computed(() => {
  return {
    pageCount: data.value?.meta.pagination.limit ?? 0,
    total: data.value?.meta.pagination.total ?? 0,
  };
});

const create = () => {
  modal.open(BlogTagsCreateModal, { onCreate: () => execute() });
};
const edit = async (id: number) => {
  screenSpinner.show();

  try {
    const r = await api<{ data: BlogTag }>(`admin/blog/tags/${id}`);
    await screenSpinner.hide();
    modal.open(BlogTagsEditModal, { tag: r.data, onUpdate: execute });
  } catch {
    screenSpinner.hide();
    toast.add({
      title: "Не удалось получить данные.",
      color: "red",
    });
  }
};
const remove = (id: number) => {
  const loading = shallowRef(false);
  modal.open(CmsConfirmModal, {
    title: "Внимание!",
    message: "Вы действительно хотите удалить тег?",
    resolve: { loading },
    onResolve: async () => {
      loading.value = true;

      try {
        await api(`admin/blog/tags/${id}`, { method: "DELETE" });
        modal.close();
        toast.add({
          title: "Тег успешно удалён.",
          color: "green",
        });
        execute();
      } catch {
        loading.value = false;
        toast.add({
          title: "Не удалось удалить.",
          color: "red",
        });
      }
    },
    onReject: () => modal.close(),
  });
};
watch(
  () => page.value,
  () => {
    (contentRef.value?.$el as HTMLDivElement).scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
);
watchDebounced(
  () => route.query,
  () => execute(),
  { debounce: 500, deep: true }
);
</script>

<style scoped></style>
