-- TopHub 热榜数据表结构
-- 热榜列表信息表
CREATE TABLE IF NOT EXISTS hot_lists (
  id SERIAL PRIMARY KEY,
  hash_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  source_platform VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 热榜内容项表
CREATE TABLE IF NOT EXISTS hot_list_items (
  id SERIAL PRIMARY KEY,
  list_hash_id VARCHAR(50) NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url VARCHAR(500),
  popularity_score INTEGER DEFAULT 0,
  read_count VARCHAR(50),
  publish_time TIMESTAMP WITH TIME ZONE,
  author VARCHAR(200),
  category VARCHAR(100),
  tags TEXT[],
  is_collected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_hash_id, item_id)
);

-- 采集历史记录表
CREATE TABLE IF NOT EXISTS collection_logs (
  id SERIAL PRIMARY KEY,
  list_hash_id VARCHAR(50) NOT NULL,
  list_name VARCHAR(200) NOT NULL,
  items_count INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
  error_message TEXT,
  execution_time INTEGER, -- 执行时间(毫秒)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入预定义的微信热榜列表
INSERT INTO hot_lists (hash_id, name, description, category, source_platform) VALUES
('5PdMaaadmg', '微信科技24小时热文榜', '微信公众号科技类文章24小时热度排行', '科技', '微信公众号'),
('nBe0xxje37', '微信生活24小时热文榜', '微信公众号生活类文章24小时热度排行', '生活', '微信公众号'),
('DOvn33ydEB', '微信职场24小时热文榜', '微信公众号职场类文章24小时热度排行', '职场', '微信公众号'),
('KGoRGRDvl6', '微信财经24小时热文榜', '微信公众号财经类文章24小时热度排行', '财经', '微信公众号')
ON CONFLICT (hash_id) DO NOTHING;
