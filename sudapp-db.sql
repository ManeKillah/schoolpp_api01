
-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL UNIQUE,
    password VARCHAR(255) NULL,
    phone_country_code VARCHAR(5) NULL,
    phone VARCHAR(15) NULL UNIQUE,
    role ENUM('superadmin', 'admin', 'user') NOT NULL,
    status ENUM('active', 'inactive', 'pending_verification', 'pending_information') NOT NULL,
    otp_code VARCHAR(10) NULL,
    otp_retries INT NULL,
    otp_expiry TIMESTAMP NULL,
    otp_operation ENUM('password_reset', 'email_verification', 'phone_verification') NULL,
    current_device_os_version VARCHAR(200) NULL,
    current_device_brand VARCHAR(200) NULL,
    current_codepush_version VARCHAR(200) NULL,
    current_device_id VARCHAR(200) NULL,
    current_firebase_token VARCHAR(200) NULL,
    current_apple_token VARCHAR(200) NULL,
    current_device_make ENUM('apple', 'android') NULL,
    deleted_email VARCHAR(255) NULL,
    deleted_phone VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL,
    INDEX (status),
    INDEX (role)
);

CREATE TABLE alquileres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    container_id INT NOT NULL,
    project_id INT NOT NULL,
    equipment_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_date TIMESTAMP null DEFAULT null,
    end_date TIMESTAMP null DEFAULT null,
    status ENUM('active', 'inactive') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE shop_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'manager', 'staff') NOT NULL,
    status ENUM('active', 'inactive') NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);

-- Health Data Table
CREATE TABLE health_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source ENUM('apple_health', 'garmin') NOT NULL,
    measurement_type VARCHAR(255) NOT NULL,
    measurement_value DECIMAL(10, 2) NOT NULL,
    measurement_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE drops_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL,  -- Positive for additions, negative for deductions
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    health_data_id INT NULL,  -- Reference for additions based on health data
    user_offer_redemption_id INT NULL,  -- Reference for deductions due to offer redemptions
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (health_data_id) REFERENCES health_data(id),
    FOREIGN KEY (user_offer_redemption_id) REFERENCES user_offer_redemptions(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);


CREATE TABLE offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    drops_required INT NOT NULL,
    listeing_start_date TIMESTAMP NOT NULL,
    listeing_end_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    status ENUM('active', 'inactive') NOT NULL,
    is_hot_offer BOOLEAN DEFAULT FALSE,
    category_id INT,
    quantity_available INT DEFAULT 0,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);
CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('active', 'inactive') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);




CREATE TABLE user_offer_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    shop_id INT NOT NULL,  -- Added reference to the shop
    redemption_token VARCHAR(255) UNIQUE NOT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    offer_name VARCHAR(255) NOT NULL,
    offer_description TEXT NOT NULL,
    offer_image_url VARCHAR(255) NOT NULL,
    offer_start_date TIMESTAMP NOT NULL,
    offer_end_date TIMESTAMP NOT NULL,
    offer_expiration_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (offer_id) REFERENCES offers(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id),  -- Foreign key to shops table
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    drop_multiplier DECIMAL(3, 2) NOT NULL,  -- Multiplier for the number of drops earned
    listing_start_date TIMESTAMP NOT NULL,
    listing_end_date TIMESTAMP NOT NULL,
    status ENUM('active', 'inactive') NOT NULL,
    max_subscriptions INT,  -- Maximum number of user subscriptions allowed
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE user_challenge_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    meta_challenge_image_url VARCHAR(255) NOT NULL,
    meta_challenge_name VARCHAR(255) NOT NULL,
    meta_challenge_description VARCHAR(255) NOT NULL,
    meta_challenge_listing_start_date VARCHAR(255) NOT NULL,
    meta_challenge_listing_end_date VARCHAR(255) NOT NULL,
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL DEFAULT NULL
);