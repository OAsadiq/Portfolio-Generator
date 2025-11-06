import minimalTemplate from "./minimal-template/index";
import { TemplateConfig } from "./templateTypes";

export const templates: Record<string, TemplateConfig> = {
  [minimalTemplate.id]: minimalTemplate
};
