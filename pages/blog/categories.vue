<template>
  <CmsDashboardPage>
    <CmsDashboardPageHeader title="Управление категориями">
      <template #right>
        <CmsButton
          label="Создать категорию"
          title="Создать категорию"
          icon="i-heroicons-plus-16-solid"
          @click="create"
        />
      </template>
    </CmsDashboardPageHeader>
    <CmsDashboardPageContent> ... </CmsDashboardPageContent>
  </CmsDashboardPage>
</template>

<script setup lang="ts">
import { BlogCategoriesCreateModal } from "#components";

useSeoMeta({
  title: "Управление категориями",
});

const api = useApi();
const modal = useModal();
const toast = useToast();

const { data } = useAsyncData(() => {
  return api("admin/blog/category");
});

const rows = computed(() => data.value ?? []);
const columns = [];

const create = () => {
  modal.open(BlogCategoriesCreateModal);
};
</script>

<style scoped></style>
