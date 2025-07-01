-- Create database
-- CREATE DATABASE IF NOT EXISTS question_management;
-- USE question_management;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay') NOT NULL,
    options JSON,
    correct_answer TEXT,
    points INT DEFAULT 1,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    category VARCHAR(100),
    analysis TEXT,
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Student answers table
CREATE TABLE student_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT,
    is_correct BOOLEAN,
    score DECIMAL(5,2),
    session_id VARCHAR(64),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_question (student_id, question_id)
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, role) VALUES
('teacher1', 'teacher1@example.com', '$2a$10$example_hash_here', 'teacher'),
('student1', 'student1@example.com', '$2a$10$example_hash_here', 'student'),
('student2', 'student2@example.com', '$2a$10$example_hash_here', 'student');

INSERT INTO questions (title, content, question_type, options, correct_answer, points, difficulty, category, analysis, created_by) VALUES
('What is 2 + 2?', 'Basic arithmetic question', 'multiple_choice', '["3", "4", "5", "6"]', '4', 1, 'easy', 'Mathematics', '2+2=4，基础加法题。', 1),
('Is the Earth round?', 'True or false question about Earth', 'true_false', '["True", "False"]', 'True', 1, 'easy', 'Science', '地球是球体，属于基础常识。', 1),
('Explain photosynthesis', 'Describe the process of photosynthesis', 'essay', NULL, NULL, 5, 'hard', 'Biology', '光合作用是绿色植物利用光能合成有机物的过程。', 1); 