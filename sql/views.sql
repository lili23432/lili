USE library_db;

CREATE OR REPLACE VIEW v_borrow_detail AS
SELECT
  r.id,
  u.id AS user_id,
  u.username,
  b.id AS book_id,
  b.book_name,
  r.borrow_time,
  r.return_time,
  r.status
FROM borrow_records r
JOIN users u ON r.user_id = u.id
JOIN books b ON r.book_id = b.id;
