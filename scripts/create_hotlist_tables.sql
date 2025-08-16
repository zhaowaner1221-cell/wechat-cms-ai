-- Creating hot_lists table for storing hot list metadata
CREATE TABLE IF NOT EXISTS hot_lists (
  id SERIAL PRIMARY KEY,
  hashid VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  description TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating hot_list_items table for storing individual hot list items
CREATE TABLE IF NOT EXISTS hot_list_items (
  id SERIAL PRIMARY KEY,
  hot_list_hashid VARCHAR(50) NOT NULL REFERENCES hot_lists(hashid) ON DELETE CASCADE,
  item_id VARCHAR(200) NOT NULL, -- Unique identifier from the API
  title TEXT NOT NULL,
  url TEXT,
  summary TEXT,
  popularity_score INTEGER DEFAULT 0,
  rank_position INTEGER,
  source_platform VARCHAR(100),
  publish_time TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hot_list_hashid, item_id) -- Prevent duplicates
);

-- Creating indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hot_lists_hashid ON hot_lists(hashid);
CREATE INDEX IF NOT EXISTS idx_hot_list_items_hashid ON hot_list_items(hot_list_hashid);
CREATE INDEX IF NOT EXISTS idx_hot_list_items_collected_at ON hot_list_items(collected_at);
CREATE INDEX IF NOT EXISTS idx_hot_list_items_popularity ON hot_list_items(popularity_score DESC);

-- Insert initial hot list configurations
INSERT INTO hot_lists (hashid, name, category, platform, description) VALUES
('5PdMaaadmg', '微信科技24小时热文榜', '科技', '微信', '微信科技领域24小时内最热门的文章'),
('nBe0xxje37', '微信生活24小时热文榜', '生活', '微信', '微信生活领域24小时内最热门的文章'),
('DOvn33ydEB', '微信职场24小时热文榜', '职场', '微信', '微信职场领域24小时内最热门的文章'),
('KGoRGRDvl6', '微信财经24小时热文榜', '财经', '微信', '微信财经领域24小时内最热门的文章'),
('Y2KeDGQdNP', '少数派热门文章', '科技', '少数派', '少数派平台的热门科技文章'),
('Q1Vd5Ko85R', '36氪热门文章', '创投', '36氪', '36氪平台的热门创投文章')
ON CONFLICT (hashid) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  platform = EXCLUDED.platform,
  description = EXCLUDED.description,
  last_updated = NOW();
