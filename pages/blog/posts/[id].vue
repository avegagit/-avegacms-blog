<template>
  <CmsDashboardPage :loading="!initialized">
    <CmsDashboardPageHeader :title="title" back-link="/blog/posts">
      <template #right>
        <div class="flex gap-x-4">
          <a href="#" target="_blank" tabindex="-1">
            <CmsButton
              label="Перейти на сайт"
              title="Перейти на сайт"
              variant="outline"
              color="gray"
              icon="i-heroicons-arrow-top-right-on-square"
            />
          </a>
          <CmsButton
            label="Обновить"
            title="Обновить"
            :loading="loading"
            @click="formRef?.submit"
          />
        </div>
      </template>
    </CmsDashboardPageHeader>
    <CmsDashboardPageContent>
      <CmsForm v-bind="{ schema, state }" ref="formRef" @submit="onSubmit">
        <div class="grid grid-cols-4 gap-x-4">
          <div class="col-span-3">
            <CmsCard>
              <div class="space-y-4">
                <CmsFormGroup name="title" label="Название" required>
                  <CmsInput v-model="state.title" :disabled="loading" />
                </CmsFormGroup>
                <CmsFormGroup name="content" label="Контент">
                  <CmsEditor v-model="state.content" />
                </CmsFormGroup>
              </div>
            </CmsCard>
          </div>
          <div class="col-span-1">
            <CmsAccordion :items="accordions">
              <template #info>
                <div class="space-y-4">
                  <CmsFormGroup name="parent" label="Категория">
                    <CmsSelectMenu
                      v-model="state.parent"
                      :options="categories"
                      value-attribute="value"
                      searchable
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="tags" label="Теги">
                    <CmsSelectMenu
                      v-model="state.tags"
                      :options="tags"
                      value-attribute="value"
                      multiple
                      searchable
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="publish_at" label="Дата публикации">
                    <CmsDatePicker
                      v-model="state.publish_at"
                      mode="datetime"
                      is24hr
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="status" label="Статус">
                    <CmsSelectMenu
                      v-model="state.status"
                      :options="CmsPageStatusOptions"
                      value-attribute="value"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="slug" label="Slug" required>
                    <CmsInput v-model="state.slug" :disabled="loading" />
                  </CmsFormGroup>
                </div>
              </template>

              <template #meta>
                <div class="space-y-4">
                  <CmsFormGroup name="meta.title" label="title">
                    <CmsInput v-model="state.meta!.title" :disabled="loading" />
                  </CmsFormGroup>
                  <CmsFormGroup name="meta.keywords" label="keywords">
                    <CmsInput
                      v-model="state.meta!.keywords"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="meta.description" label="description">
                    <CmsInput
                      v-model="state.meta!.description"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="meta.breadcrumb" label="breadcrumb">
                    <CmsInput
                      v-model="state.meta!.breadcrumb"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                </div>
              </template>

              <template #open-graph>
                <div class="space-y-4">
                  <CmsFormGroup name="meta['og:title']" label="og:title">
                    <CmsInput
                      v-model="state.meta!['og:title']"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="meta['og:type']" label="og:type">
                    <CmsInput
                      v-model="state.meta!['og:type']"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup name="meta['og:url']" label="og:url">
                    <CmsInput
                      v-model="state.meta!['og:url']"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                </div>
              </template>

              <template #sitemap>
                <div class="space-y-4">
                  <CmsFormGroup
                    name="in_sitemap"
                    label="Добавить в карту сайта"
                    :ui="{ wrapper: 'flex justify-between items-center' }"
                  >
                    <CmsToggle v-model="state.in_sitemap" :disabled="loading" />
                  </CmsFormGroup>
                  <CmsFormGroup name="meta_sitemap.priority" label="Priority">
                    <CmsInput
                      v-model="state.meta_sitemap!.priority"
                      type="number"
                      inputmode="numeric"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                  <CmsFormGroup
                    name="meta_sitemap.changefreq"
                    label="Change Frequency"
                  >
                    <CmsSelectMenu
                      v-model="state.meta_sitemap!.changefreq"
                      :options="CmsPageSitemapChangeFreqOptions"
                      value-attribute="value"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                </div>
              </template>
            </CmsAccordion>
          </div>
        </div>
      </CmsForm>
    </CmsDashboardPageContent>
  </CmsDashboardPage>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import type { Form, FormSubmitEvent, AccordionItem } from "#ui/types";
import type { CmsPage } from "avegacms/src/types/page";
import type { CmsOption } from "avegacms/src/types/core";

type Post = Pick<
  CmsPage,
  "title" | "content" | "parent",
  "status" | "slug" | "publish_at" | "meta" | "meta_sitemap" | "in_sitemap"
> & { tags: number[] };

type State = Post;

useSeoMeta({
  title: "Загрузка...",
});

const api = useApi();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const initialized = shallowRef(false);
const data = ref<Post>();

const title = computed(() => data.value?.title ?? "");

const accordions: AccordionItem[] = [
  {
    label: "Информация",
    defaultOpen: true,
    slot: "info",
  },
  {
    label: "Meta",
    slot: "meta",
  },
  {
    label: "Open Graph",
    slot: "open-graph",
  },
  {
    label: "Sitemap",
    slot: "sitemap",
  },
];

const tags = shallowRef<CmsOption[]>([]);
const categories = shallowRef<CmsOption[]>([]);

const loading = shallowRef(false);
const state = ref<Partial<State>>({});
const schema = object({
  title: string().required().label("Название"),
});
const formRef = ref<Form<State>>();

const onSubmit = async (values: FormSubmitEvent<State>) => {
  if (!loading.value) {
    loading.value = true;

    try {
      await api(`admin/blog/post/${route.params.id}`, {
        method: "PUT",
        body: values.data,
      });

      if (state.value.title !== data.value?.title) {
        data.value!.title = state.value.title!;
      }

      toast.add({
        title: "Запись успешно сохранена.",
        color: "green",
      });
    } catch (err) {
      if (err instanceof CmsApiResponseError) {
        if (err.errors) {
          formRef.value?.setErrors(err.errors);
        }

        toast.add({
          title: err.message,
          color: "red",
        });
      } else {
        toast.add({
          title: "Произошла ошибка.",
          color: "red",
        });
      }
    } finally {
      loading.value = false;
    }
  }
};

watch(
  () => data.value?.title,
  (title) => {
    useSeoMeta({
      title: `Редактирование страницы: ${title}`,
    });
  }
);

onMounted(async () => {
  try {
    const r = await api<{
      data: Post;
      meta: Record<"tags" | "categories", CmsOption[]>;
    }>(`admin/blog/post/${route.params.id}`);

    data.value = r.data;

    tags.value = r.meta.tags;
    categories.value = r.meta.categories;

    state.value = {
      title: r.data.title,
      content: r.data.content,
      parent: r.data.parent,
      status: r.data.status,
      slug: r.data.slug,
      publish_at: r.data.publish_at,
      meta: r.data.meta,
      meta_sitemap: r.data.meta_sitemap,
      in_sitemap: r.data.in_sitemap,
      tags: r.data.tags,
    };

    if (!initialized.value) {
      initialized.value = true;
    }
  } catch {
    await router.replace("/blog/posts");
  }
});
</script>

<style scoped></style>
