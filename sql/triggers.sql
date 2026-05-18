USE library_db;

DROP TRIGGER IF EXISTS trg_limit_user_borrow;
DELIMITER $$
CREATE TRIGGER trg_limit_user_borrow
BEFORE INSERT ON borrow_records
FOR EACH ROW
BEGIN
  DECLARE current_borrowed_count INT DEFAULT 0;

  IF NEW.status = 'BORROWED' THEN
    SELECT COUNT(*) INTO current_borrowed_count
    FROM borrow_records
    WHERE user_id = NEW.user_id AND status = 'BORROWED';

    IF current_borrowed_count >= 5 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '每个用户最多只能借阅 5 本未归还图书';
    END IF;
  END IF;
END$$
DELIMITER ;
