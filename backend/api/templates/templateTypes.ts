export interface TemplateField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "file" | "number";
  required?: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // URL or local path
  fields: TemplateField[];
  generateHTML: (data: Record<string, any>) => string;
}
