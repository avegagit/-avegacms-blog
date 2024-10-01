<template>
  <CmsDashboardPage>
    <CmsDashboardPageHeader title="Управление записями">
      <template #right>
        <CmsButton
          label="Создать запись"
          title="Создать запись"
          icon="i-heroicons-plus-16-solid"
          @click="create"
        />
      </template>
    </CmsDashboardPageHeader>
    <CmsDashboardPageContent ref="contentRef">
      <CmsCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
        <CmsTable v-bind="{ loading, rows, columns }">
          <template #id-data="{ row }: { row: BlogPost }">
            <NuxtLink
              :to="`/blog/posts/${row.id}`"
              class="text-primary p-2 font-medium"
              title="Редактировать"
            >
              {{ row.id }}
            </NuxtLink>
          </template>

          <template #status-data="{ row }: { row: BlogPost }">
            <CmsBadge :color="CmsPageStatusColor[row.status]">
              {{ CmsPageStatusLabel[row.status] }}
            </CmsBadge>
          </template>

          <template #actions-data="{ row }: { row: BlogPost }">
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
import { CmsConfirmModal, BlogPostsCreateModal } from "#components";
import type { DropdownItem } from "#ui/types";
import type { BlogPost } from "#module/blog/types";
import type { CmsOption, CmsPagination } from "avegacms/src/types/core";

const api = useApi();
const modal = useModal();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const screenSpinner = useScreenSpinner();

const contentRef = ref();

const { data, status, execute } = useAsyncData(() => {
  return api<{ data: BlogPost[]; meta: { pagination: CmsPagination } }>(
    "admin/blog/post",
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
    key: "title",
    label: "Название",
  },
  {
    key: "status",
    label: "Статус",
  },
  {
    key: "actions",
  },
];

const actions = (row: BlogPost) => {
  return [
    [
      {
        label: "Редактировать",
        icon: "i-heroicons-pencil-square-20-solid",
        to: `/blog/posts/${row.id}`,
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

const create = async () => {
  screenSpinner.show();
  try {
    const r = await api<{ meta: { categories: CmsOption[] } }>(
      "admin/blog/post/new"
    );
    await screenSpinner.hide();
    modal.open(BlogPostsCreateModal, {
      categories: r.meta.categories,
      onCreate: (id) => {
        modal.close();
        router.push(`/blog/posts/${id}`);
      },
    });
  } catch {
    screenSpinner.hide();
    toast.add({
      title: "Не удалось получить данные.",
      color: "red",
    });
  }
};
const remove = async (id: number) => {
  const loading = shallowRef(false);
  modal.open(CmsConfirmModal, {
    title: "Внимание!",
    message: "Вы действительно хотите удалить запись?",
    resolve: { loading },
    onResolve: async () => {
      loading.value = true;

      try {
        await api(`admin/blog/post/${id}`, { method: "DELETE" });
        modal.close();
        toast.add({
          title: "Запись успешно удалена.",
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
