USE library_db;

DROP PROCEDURE IF EXISTS sp_search_book;
DELIMITER $$
CREATE PROCEDURE sp_search_book(IN keyword VARCHAR(100))
BEGIN
  SELECT
    b.id,
    b.book_name,
    b.author,
    b.publisher,
    b.price,
    b.stock,
    c.category_name
  FROM books b
  JOIN categories c ON b.category_id = c.id
  WHERE b.book_name LIKE CONCAT('%', keyword, '%')
  ORDER BY b.book_name ASC;
END$$
DELIMITER ;
