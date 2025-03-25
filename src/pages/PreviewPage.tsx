import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const TemplatePreview = () => {
  const { templateId } = useParams();
  const [previewHTML, setPreviewHTML] = useState("");

  useEffect(() => {
    const fetchPreview = async () => {
      const response = await fetch(`/api/preview-template/${templateId}`);
      const data = await response.text();
      setPreviewHTML(data);
    };
    fetchPreview();
  }, [templateId]);

  return (
    <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
  );
};

export default TemplatePreview;
