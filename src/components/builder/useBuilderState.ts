/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getTemplateConfig, SECTION_METADATA, SectionItem } from './builder.config';
import { FileText } from 'lucide-react';
import React from 'react';

export function useBuilderState(onCancel?: () => void) {
  const { slug, templateId } = useParams<{ slug?: string; templateId?: string }>();
  const isEditing = !!slug;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('design');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentSample, setCurrentSample] = useState(1);
  const [currentTestimonial, setCurrentTestimonial] = useState(1);
  const [currentCase, setCurrentCase] = useState(1);
  const [currentBlog, setCurrentBlog] = useState(1);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [portfolioSlug, setPortfolioSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || 'professional-writer-template');

  const config = getTemplateConfig(selectedTemplate);
  const [sections, setSections] = useState<SectionItem[]>(config.sections);
  const [formData, setFormData] = useState<Record<string, string>>(config.fields);
  const [history, setHistory] = useState([config.fields]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    const newConfig = getTemplateConfig(selectedTemplate);
    setSections(newConfig.sections);
    setFormData(newConfig.fields);
    setHistory([newConfig.fields]);
    setHistoryIndex(0);
  }, [selectedTemplate]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isEditing && slug) loadPortfolioData();
  }, [slug, isEditing]);

  const uploadImage = async (file: File): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    const ext = file.name.split('.').pop();
    const path = `profile-pictures/${session?.user?.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const pushHistory = (newData: Record<string, string>) => {
    const trimmed = history.slice(0, historyIndex + 1);
    trimmed.push(newData);
    setHistory(trimmed);
    setHistoryIndex(trimmed.length - 1);
  };

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    pushHistory(newData);
  };

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      const newData = { ...formData, [field]: url };
      setFormData(newData);
      pushHistory(newData);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFormData(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFormData(history[historyIndex + 1]);
    }
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    [next[index], next[index - 1]] = [next[index - 1], next[index]];
    next.forEach((s, i) => (s.order = i));
    setSections(next);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    next.forEach((s, i) => (s.order = i));
    setSections(next);
  };

  const handleReorder = (reordered: SectionItem[]) => setSections(reordered);

  const clearItemFields = (prefix: string, num: number, keys: string[]) => {
    const updates: Record<string, string> = {};
    keys.forEach(k => (updates[`${prefix}${num}${k}`] = ''));
    return updates;
  };

  const shiftItemFields = (prefix: string, from: number, to: number, keys: string[], data: Record<string, string>) => {
    const updates: Record<string, string> = {};
    keys.forEach(k => (updates[`${prefix}${from}${k}`] = data[`${prefix}${to}${k}`] || ''));
    return updates;
  };

  const deleteItem = (prefix: string, num: number, total: number, keys: string[]) => {
    let newData = { ...formData };
    for (let i = num; i < total; i++) {
      Object.assign(newData, shiftItemFields(prefix, i, i + 1, keys, newData));
    }
    Object.assign(newData, clearItemFields(prefix, total, keys));
    setFormData(newData);
    pushHistory(newData);
  };

  const handleDeleteSample = (num: number) => {
    const total = countItems('sample', 'Title');
    deleteItem('sample', num, total, ['Title', 'Type', 'Description', 'Content', 'Link', 'Image']);
  };

  const handleDeleteTestimonial = (num: number) => {
    const updates: Record<string, string> = {
      [`testimonial${num}`]: '',
      [`testimonial${num}Author`]: '',
      [`testimonial${num}Role`]: '',
    };
    const newData = { ...formData, ...updates };
    setFormData(newData);
    pushHistory(newData);
  };

  const handleDeleteCase = (num: number) => {
    const total = countItems('case', 'Title');
    deleteItem('case', num, total, ['Title', 'Client', 'Role', 'Description', 'Tags', 'Challenge', 'Solution', 'Results', 'Image']);
  };

  const handleDeleteBlog = (num: number) => {
    const total = countItems('blog', 'Title');
    deleteItem('blog', num, total, ['Title', 'Excerpt', 'Category', 'Date', 'ReadTime', 'Link']);
  };

  const countItems = (prefix: string, titleKey: string) => {
    let count = 0;
    for (let i = 1; i <= 100; i++) {
      if (formData[`${prefix}${i}${titleKey}`]) count = i;
    }
    return count;
  };

  const normalizeSections = (dbSections: { id: string; enabled?: boolean; visible?: boolean; order?: number; name?: string }[]) => {
    if (!dbSections?.length) return config.sections;
    return dbSections.map(s => {
      const meta = SECTION_METADATA[s.id] ?? { name: s.id, icon: React.createElement(FileText, { className: 'w-4 h-4' }) };
      return {
        id: s.id,
        name: s.name || meta.name,
        icon: meta.icon,
        visible: s.enabled !== undefined ? s.enabled : (s.visible !== undefined ? s.visible : true),
        order: s.order ?? 0,
      };
    }).sort((a, b) => a.order - b.order);
  };

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to edit your portfolio'); setLoading(false); return; }

      const { data: portfolio, error: pErr } = await supabase.from('portfolios').select('*').eq('slug', slug).single();
      if (pErr) throw new Error(pErr.code === 'PGRST116' ? `Portfolio "${slug}" not found.` : pErr.message);
      if (portfolio.user_id !== session.user.id) throw new Error('You do not have permission to edit this portfolio.');

      setPortfolioSlug(portfolio.slug);
      if (portfolio.form_data) setFormData(portfolio.form_data);
      if (portfolio.template_id) {
        setSelectedTemplate(portfolio.template_id);
        const tConfig = getTemplateConfig(portfolio.template_id);
        setSections(portfolio.sections?.length ? normalizeSections(portfolio.sections) : tConfig.sections);
      } else if (portfolio.sections?.length) {
        setSections(normalizeSections(portfolio.sections));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to save your portfolio'); setSaving(false); return; }

      const shouldUpdate = isEditing || !!portfolioSlug;
      const endpoint = shouldUpdate
        ? `${import.meta.env.VITE_API_URL}/api/templates/update-portfolio`
        : `${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`;

      const sectionsForSave = sections.map(s => ({ id: s.id, enabled: s.visible, order: s.order }));
      const body = shouldUpdate
        ? { slug: portfolioSlug, templateId: selectedTemplate, formData, sections: sectionsForSave }
        : { templateId: selectedTemplate, formData, sections: sectionsForSave };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });

      if (res.status === 413) throw new Error('Content is too large. Please reduce the amount of content and try again.');
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'FREE_TEMPLATE_LIMIT_REACHED') throw new Error("You've already used your free template. Upgrade to Pro to access premium templates.");
        if (data.code === 'PRO_TEMPLATE_REQUIRED') throw new Error('This template requires a Pro subscription. Upgrade to unlock all templates!');
        if (data.code === 'PORTFOLIO_NOT_FOUND') throw new Error(`Portfolio not found. The slug "${portfolioSlug}" does not exist.`);
        if (data.code === 'PERMISSION_DENIED') throw new Error('You do not have permission to edit this portfolio.');
        throw new Error(data.error || `Failed to ${shouldUpdate ? 'update' : 'save'} portfolio`);
      }

      if (!shouldUpdate && data.portfolioSlug) {
        setPortfolioSlug(data.portfolioSlug);
        window.history.replaceState({}, '', `/builder/${data.portfolioSlug}`);
      }
      setSuccessModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setShowCancelConfirm(true);
  const confirmCancel = () => {
    if (onCancel) onCancel();
    else if (isEditing) navigate('/dashboard');
  };

  return {
    // routing
    isEditing, selectedTemplate,
    // ui state
    activeTab, setActiveTab,
    previewMode, setPreviewMode,
    isMobile, loading, saving, error, setError,
    showCancelConfirm, setShowCancelConfirm,
    // data
    sections, formData,
    // history
    historyIndex, historyLength: history.length,
    // modal state
    currentSample, setCurrentSample, sampleModalOpen, setSampleModalOpen,
    currentTestimonial, setCurrentTestimonial, testimonialModalOpen, setTestimonialModalOpen,
    currentCase, setCurrentCase, caseModalOpen, setCaseModalOpen,
    currentBlog, setCurrentBlog, blogModalOpen, setBlogModalOpen,
    successModalOpen, setSuccessModalOpen,
    portfolioSlug,
    // handlers
    handleInputChange, handleFileChange,
    undo, redo,
    toggleSection, moveSectionUp, moveSectionDown, handleReorder,
    handleDeleteSample, handleDeleteTestimonial, handleDeleteCase, handleDeleteBlog,
    handleSubmit, handleCancel, confirmCancel,
    countItems,
  };
}
