import minimalTemplate from "./minimal-template/index";
import professionalTemplate from "./professional-template/index";
import { TemplateConfig } from "./templateTypes";

export const templates: Record<string, TemplateConfig> = {
  [minimalTemplate.id]: minimalTemplate,
  [professionalTemplate.id]: professionalTemplate
};
