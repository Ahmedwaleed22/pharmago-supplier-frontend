declare module Category {
  interface Category {
    id: string;
    name: string;
    icon: string;
    description?: string;
    level?: number;
    parent_id?: string;
  }
}