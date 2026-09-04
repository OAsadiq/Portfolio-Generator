import minimalTemplate from "./minimal-template/_index.js";
import professionalWriterTemplate from "./professional-writer-template/_index.js";
import modernTemplate from "./modern-writer-template/_index.js";
import traderTemplate from "./trader-template/_index.js";

// ORDER MATTERS: /api/templates returns Object.values(templates), and the template grid
// renders them in that order. Porfilr Journal leads because it's the product we're
// actively selling and the only one that's free to start — burying it fourth put the
// thing we point every campaign at below three templates nobody is being sent to.
export const templates = {
  [traderTemplate.id]: traderTemplate,
  [minimalTemplate.id]: minimalTemplate,
  [professionalWriterTemplate.id]: professionalWriterTemplate,
  [modernTemplate.id]: modernTemplate,
};