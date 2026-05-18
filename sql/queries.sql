USE library_db;

-- 1. WHERE 条件查询：查询库存大于 0 且分类为“数据库”的图书
SELECT b.id, b.book_name, b.author, b.stock
FROM books b
WHERE b.stock > 0
  AND b.category_id = (SELECT id FROM categories WHERE category_name = '数据库');

-- 2. 多表 JOIN 查询：查询借阅详情
SELECT u.username, b.book_name, c.category_name, r.borrow_time, r.status
FROM borrow_records r
JOIN users u ON r.user_id = u.id
JOIN books b ON r.book_id = b.id
JOIN categories c ON b.category_id = c.id;

-- 3. 子查询：查询被借阅次数高于平均借阅次数的图书
SELECT b.id, b.book_name, COUNT(r.id) AS borrow_count
FROM books b
JOIN borrow_records r ON b.id = r.book_id
GROUP BY b.id, b.book_name
HAVING COUNT(r.id) > (
  SELECT AVG(book_borrow_count)
  FROM (
    SELECT COUNT(*) AS book_borrow_count
    FROM borrow_records
    GROUP BY book_id
  ) t
);

-- 4. GROUP BY 聚合查询：按分类统计图书数量、总库存和平均价格
SELECT c.category_name, COUNT(b.id) AS book_count, SUM(b.stock) AS total_stock, ROUND(AVG(b.price), 2) AS avg_price
FROM categories c
LEFT JOIN books b ON c.id = b.category_id
GROUP BY c.id, c.category_name;

-- 5. ORDER BY 排序查询：按价格从高到低查询图书
SELECT id, book_name, author, publisher, price, stock
FROM books
ORDER BY price DESC, id ASC;

-- 6. 查询当前未归还图书的用户及数量，用于触发器验收对照
SELECT u.username, COUNT(r.id) AS current_borrowed_count
FROM users u
JOIN borrow_records r ON u.id = r.user_id
WHERE r.status = 'BORROWED'
GROUP BY u.id, u.username
ORDER BY current_borrowed_count DESC;
