-- 素材库相关数据库表结构
-- 用于热榜数据到素材库的完整流程

-- 1. 素材库主表（从热榜收集的内容）
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    original_content TEXT, -- 原始内容全文
    url VARCHAR(500), -- 原始链接
    source VARCHAR(100), -- 来源：微信热文、知乎热榜等
    source_id VARCHAR(100), -- 原始ID（如热榜item_hash）
    category VARCHAR(50),
    tags TEXT[],
    author VARCHAR(200),
    publish_time TIMESTAMP WITH TIME ZONE,
    read_count VARCHAR(50),
    popularity_score INTEGER DEFAULT 0,
    
    -- 素材状态
    material_status VARCHAR(20) DEFAULT 'collected', -- collected, rewriting, rewritten, published
    
    -- 关联用户
    user_id UUID REFERENCES auth.users(id),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：同一用户的同一来源内容不重复
    UNIQUE(user_id, source, source_id)
);

-- 2. AI改写结果表
CREATE TABLE IF NOT EXISTS rewrite_results (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
    
    -- 改写配置
    rewrite_type VARCHAR(50) DEFAULT 'standard', -- standard, creative, concise, expand
    tone VARCHAR(50) DEFAULT 'neutral', -- neutral, formal, casual, professional
    target_audience VARCHAR(100), -- 目标受众
    keywords TEXT[], -- 关键词要求
    
    -- 改写结果
    rewritten_title TEXT,
    rewritten_content TEXT NOT NULL,
    summary TEXT, -- 改写后摘要
    
    -- 质量评估
    quality_score DECIMAL(3,2), -- 0.00-1.00
    readability_score INTEGER, -- 0-100
    word_count INTEGER,
    
    -- 使用模型
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    
    -- 状态
    rewrite_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    
    -- 关联用户
    user_id UUID REFERENCES auth.users(id),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_material_id (material_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (rewrite_status),
    INDEX idx_created_at (created_at)
);

-- 3. 改写任务队列表（用于异步处理）
CREATE TABLE IF NOT EXISTS rewrite_tasks (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- 任务配置
    rewrite_type VARCHAR(50) DEFAULT 'standard',
    tone VARCHAR(50) DEFAULT 'neutral',
    target_audience VARCHAR(100),
    keywords TEXT[],
    priority INTEGER DEFAULT 5, -- 1-10, 10为最高优先级
    
    -- 任务状态
    task_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- 重试机制
    max_retries INTEGER DEFAULT 3,
    current_retry INTEGER DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_material_id (material_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (task_status),
    INDEX idx_priority (priority DESC, created_at ASC),
    INDEX idx_created_at (created_at)
);

-- 4. 素材标签表（规范化标签管理）
CREATE TABLE IF NOT EXISTS material_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#6B7280',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_name (name)
);

-- 5. 素材与标签的关联表
CREATE TABLE IF NOT EXISTS material_tag_relations (
    material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES material_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (material_id, tag_id)
);

-- 6. 素材使用记录表（发布历史）
CREATE TABLE IF NOT EXISTS material_usage_logs (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id) ON DELETE CASCADE,
    rewrite_result_id INTEGER REFERENCES rewrite_results(id) ON DELETE SET NULL,
    
    usage_type VARCHAR(50) NOT NULL, -- publish, export, share
    platform VARCHAR(100), -- 发布平台：微信公众号、知乎等
    platform_post_id VARCHAR(100), -- 平台文章ID
    
    title_used TEXT,
    content_used TEXT,
    url VARCHAR(500), -- 发布后的URL
    
    -- 发布数据
    publish_time TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- 关联用户
    user_id UUID REFERENCES auth.users(id),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 索引
    INDEX idx_material_id (material_id),
    INDEX idx_user_id (user_id),
    INDEX idx_platform_post_id (platform_post_id),
    INDEX idx_publish_time (publish_time)
);

-- 7. 用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- AI改写偏好
    default_rewrite_type VARCHAR(50) DEFAULT 'standard',
    default_tone VARCHAR(50) DEFAULT 'neutral',
    default_target_audience VARCHAR(100),
    default_keywords TEXT[],
    
    -- 通知设置
    notify_on_rewrite_complete BOOLEAN DEFAULT true,
    notify_on_task_fail BOOLEAN DEFAULT true,
    
    -- 界面偏好
    default_view_mode VARCHAR(20) DEFAULT 'grid',
    items_per_page INTEGER DEFAULT 20,
    
    -- 时间戳
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_id (user_id)
);

-- 8. 创建自动更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间戳的表创建触发器
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewrite_results_updated_at BEFORE UPDATE ON rewrite_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewrite_tasks_updated_at BEFORE UPDATE ON rewrite_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 创建必要的索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(material_status);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_user_created ON materials(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_source ON materials(source);
CREATE INDEX IF NOT EXISTS idx_materials_publish_time ON materials(publish_time DESC);

-- 10. 插入默认标签
INSERT INTO material_tags (name, color, description) VALUES
('科技', '#3B82F6', '科技类内容'),
('商业', '#059669', '商业财经类内容'),
('生活', '#EAB308', '生活类内容'),
('职场', '#8B5CF6', '职场类内容'),
('健康', '#EF4444', '健康医疗类内容'),
('教育', '#06B6D4', '教育培训类内容'),
('娱乐', '#EC4899', '娱乐类内容'),
('热点', '#F97316', '热点事件类内容')
ON CONFLICT (name) DO NOTHING;

-- 11. 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_materials_search ON materials USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(original_content, '')));
CREATE INDEX IF NOT EXISTS idx_rewrite_results_search ON rewrite_results USING gin(to_tsvector('english', rewritten_title || ' ' || rewritten_content));

-- 12. 创建视图：素材统计视图
CREATE OR REPLACE VIEW material_statistics AS
SELECT 
    m.user_id,
    COUNT(*) as total_materials,
    COUNT(CASE WHEN m.material_status = 'collected' THEN 1 END) as collected_count,
    COUNT(CASE WHEN m.material_status = 'rewriting' THEN 1 END) as rewriting_count,
    COUNT(CASE WHEN m.material_status = 'rewritten' THEN 1 END) as rewritten_count,
    COUNT(CASE WHEN m.material_status = 'published' THEN 1 END) as published_count,
    AVG(COALESCE(r.quality_score, 0)) as avg_quality_score,
    SUM(COALESCE(r.word_count, 0)) as total_rewritten_words,
    MAX(m.created_at) as latest_material,
    MIN(m.created_at) as oldest_material
FROM materials m
LEFT JOIN rewrite_results r ON m.id = r.material_id AND r.rewrite_status = 'completed'
GROUP BY m.user_id;

-- 13. 创建视图：今日素材概览
CREATE OR REPLACE VIEW daily_material_overview AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    user_id,
    COUNT(*) as daily_added,
    COUNT(CASE WHEN material_status = 'rewritten' THEN 1 END) as daily_rewritten,
    COUNT(CASE WHEN source = '微信热文' THEN 1 END) as from_wechat,
    COUNT(CASE WHEN source = '知乎热榜' THEN 1 END) as from_zhihu,
    COUNT(CASE WHEN source = '微博热搜' THEN 1 END) as from_weibo
FROM materials
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), user_id
ORDER BY date DESC;