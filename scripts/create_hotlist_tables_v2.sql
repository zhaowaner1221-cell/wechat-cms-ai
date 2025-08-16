-- Creating hot_lists table matching TopHub API response format
CREATE TABLE IF NOT EXISTS hot_lists (
  id SERIAL PRIMARY KEY,
  hashid VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  display VARCHAR(100),
  domain VARCHAR(200),
  logo TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating hot_list_items table matching TopHub API items format
CREATE TABLE IF NOT EXISTS hot_list_items (
  id SERIAL PRIMARY KEY,
  hot_list_hashid VARCHAR(50) NOT NULL REFERENCES hot_lists(hashid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  url TEXT,
  extra VARCHAR(500), -- For popularity info like "455 万热度"
  item_hash VARCHAR(64) NOT NULL, -- Generated hash for deduplication
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hot_list_hashid, item_hash) -- Prevent duplicates based on content hash
);

-- Creating indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hot_lists_hashid ON hot_lists(hashid);
CREATE INDEX IF NOT EXISTS idx_hot_list_items_hashid ON hot_list_items(hot_list_hashid);
CREATE INDEX IF NOT EXISTS idx_hot_list_items_collected_at ON hot_list_items(collected_at DESC);

-- Insert initial hot list configurations (will be updated from API)
INSERT INTO hot_lists (hashid, name, display) VALUES
('5PdMaaadmg', '微信科技24小时热文榜', '热文榜'),
('nBe0xxje37', '微信生活24小时热文榜', '热文榜'),
('DOvn33ydEB', '微信职场24小时热文榜', '热文榜'),
('KGoRGRDvl6', '微信财经24小时热文榜', '热文榜'),
('Y2KeDGQdNP', '少数派热门文章', '热门文章'),
('Q1Vd5Ko85R', '36氪热门文章', '热门文章')
ON CONFLICT (hashid) DO UPDATE SET
  name = EXCLUDED.name,
  display = EXCLUDED.display,
  last_updated = NOW();
