import minimalTemplate from "./minimal-template/_index.js";
import professionalWriterTemplate from "./professional-writer-template/_index.js";
import modernTemplate from "./modern-writer-template/_index.js";

export const templates = {
  [minimalTemplate.id]: minimalTemplate,
  [professionalWriterTemplate.id]: professionalWriterTemplate,
  [modernTemplate.id]: modernTemplate,
};