-- Seed default tags for comment categorization

-- Sentiment tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Positive', 'sentiment', '#22c55e', 'Positive sentiment'),
  ('Neutral', 'sentiment', '#6b7280', 'Neutral sentiment'),
  ('Negative', 'sentiment', '#ef4444', 'Negative sentiment')
ON CONFLICT (name) DO NOTHING;

-- Topic tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Product', 'topic', '#3b82f6', 'About the product'),
  ('Price', 'topic', '#f59e0b', 'About pricing'),
  ('Delivery', 'topic', '#8b5cf6', 'About delivery/shipping'),
  ('Quality', 'topic', '#ec4899', 'About quality'),
  ('Service', 'topic', '#14b8a6', 'About customer service')
ON CONFLICT (name) DO NOTHING;

-- Intent tags
INSERT INTO public.tags (name, type, color, description) VALUES
  ('Purchase Intent', 'intent', '#10b981', 'Shows intent to purchase'),
  ('Complaint', 'intent', '#f97316', 'Complaint or issue'),
  ('Question', 'intent', '#06b6d4', 'Asking a question'),
  ('General', 'intent', '#64748b', 'General comment')
ON CONFLICT (name) DO NOTHING;
