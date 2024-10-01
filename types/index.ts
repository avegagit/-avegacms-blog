import { CmsPageStatus } from "avegacms/src/types/page";
import type { CmsOption } from "avegacms/src/types/core";

export interface BlogCategory {
  id: number;
  title: string;
  slug: string;
  num: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  num: number;
}

export interface BlogPost {
  id: number;
  title: string;
  parent: CmsOption;
  status: CmsPageStatus;
}
