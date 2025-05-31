-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 31, 2025 at 09:04 AM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 8.0.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `isoko_finance`
--

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `client_number` varchar(20) NOT NULL,
  `borrower_id` varchar(50) DEFAULT NULL,
  `title` enum('Mr','Mrs','Miss','Dr','Prof','Chief','Alhaji','Alhaja') DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `marital_status` enum('single','married','divorced','widowed','separated') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `unique_number` varchar(50) DEFAULT NULL,
  `mobile` varchar(15) NOT NULL,
  `telephone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province_state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Nigeria',
  `zipcode` varchar(20) DEFAULT NULL,
  `business_name` varchar(200) DEFAULT NULL,
  `working_status` enum('employed','self_employed','unemployed','student','retired') DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `monthly_income` decimal(15,2) DEFAULT NULL,
  `employer_name` varchar(200) DEFAULT NULL,
  `employer_address` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive','suspended','pending_approval') DEFAULT 'pending_approval',
  `assigned_officer` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `client_number`, `borrower_id`, `title`, `first_name`, `middle_name`, `last_name`, `gender`, `marital_status`, `date_of_birth`, `unique_number`, `mobile`, `telephone`, `email`, `address`, `city`, `province_state`, `country`, `zipcode`, `business_name`, `working_status`, `occupation`, `monthly_income`, `employer_name`, `employer_address`, `description`, `status`, `assigned_officer`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'CLT001', NULL, 'Mr', 'John', 'Doe', 'Smith', 'male', NULL, '1990-05-15', '12345678901', '08012345678', NULL, 'john.smith@example.com', '123 Main Street, Victoria Island', 'Lagos', 'Lagos State', 'Nigeria', '100001', 'John Trading Company', 'self_employed', 'Trader', '150000.00', NULL, NULL, 'Small scale trader dealing in electronics', 'pending_approval', NULL, 2, '2025-05-26 19:33:30', '2025-05-26 19:33:30'),
(2, 'CLT002', NULL, 'Mr', 'John', 'Paul', 'Uwimana', 'male', NULL, '1990-05-15', '1199012345678901', '+250788123456', NULL, 'john.uwimana@email.com', 'KG 123 St, Kigali', 'Kigali', 'Kigali City', 'Rwanda', '00000', 'John\'s Electronics Shop', 'self_employed', 'Electronics Retailer', '500000.00', NULL, NULL, 'Small electronics retail business owner', 'pending_approval', 1, 2, '2025-05-27 01:29:58', '2025-05-27 01:29:58'),
(3, 'CLT003', NULL, 'Mrs', 'Marie', NULL, 'Mukamana', 'female', NULL, '1985-08-22', '1198508220012345', '+250789654321', NULL, 'marie.mukamana@email.com', 'KN 456 Ave, Kigali', 'Kigali', 'Kigali City', 'Rwanda', NULL, NULL, 'employed', 'Teacher', '300000.00', 'Green Hills Academy', 'Nyarutarama, Kigali', 'Primary school teacher', 'pending_approval', 1, 2, '2025-05-27 01:30:13', '2025-05-27 01:30:13');

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` int(11) NOT NULL,
  `loan_number` varchar(20) NOT NULL,
  `loan_account` varchar(30) NOT NULL,
  `client_id` int(11) NOT NULL,
  `borrower_id` varchar(50) DEFAULT NULL,
  `loan_type` int(11) NOT NULL,
  `loan_purpose` text DEFAULT NULL,
  `economic_sector` enum('agriculture','manufacturing','trade','services','transport','construction','education','health','other') DEFAULT 'other',
  `applied_amount` decimal(15,2) NOT NULL,
  `approved_amount` decimal(15,2) DEFAULT NULL,
  `disbursed_amount` decimal(15,2) DEFAULT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `interest_rate_method` enum('flat','reducing_balance','compound') DEFAULT 'reducing_balance',
  `loan_term_months` int(11) DEFAULT NULL,
  `maturity_date` date DEFAULT NULL,
  `repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly') DEFAULT 'monthly',
  `installment_amount` decimal(15,2) DEFAULT NULL,
  `total_installments` int(11) DEFAULT NULL,
  `installments_paid` int(11) DEFAULT 0,
  `installments_outstanding` int(11) DEFAULT NULL,
  `installments_in_arrears` int(11) DEFAULT 0,
  `loan_balance` decimal(15,2) DEFAULT NULL,
  `principal_balance` decimal(15,2) DEFAULT NULL,
  `interest_balance` decimal(15,2) DEFAULT NULL,
  `arrears_principal` decimal(15,2) DEFAULT 0.00,
  `arrears_interest` decimal(15,2) DEFAULT 0.00,
  `performance_class` enum('performing','watch','substandard','doubtful','loss') DEFAULT 'performing',
  `arrears_start_date` date DEFAULT NULL,
  `days_in_arrears` int(11) DEFAULT 0,
  `collateral_type` enum('immovable_assets','movable_assets','guarantor','none') DEFAULT 'none',
  `collateral_description` text DEFAULT NULL,
  `collateral_value` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','under_review','approved','disbursed','active','completed','defaulted','rejected','written_off') DEFAULT 'pending',
  `loan_officer_id` int(11) DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `disbursed_by` int(11) DEFAULT NULL,
  `application_date` datetime DEFAULT current_timestamp(),
  `approval_date` datetime DEFAULT NULL,
  `disbursement_date` datetime DEFAULT NULL,
  `first_payment_date` date DEFAULT NULL,
  `last_payment_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`id`, `loan_number`, `loan_account`, `client_id`, `borrower_id`, `loan_type`, `loan_purpose`, `economic_sector`, `applied_amount`, `approved_amount`, `disbursed_amount`, `interest_rate`, `interest_rate_method`, `loan_term_months`, `maturity_date`, `repayment_frequency`, `installment_amount`, `total_installments`, `installments_paid`, `installments_outstanding`, `installments_in_arrears`, `loan_balance`, `principal_balance`, `interest_balance`, `arrears_principal`, `arrears_interest`, `performance_class`, `arrears_start_date`, `days_in_arrears`, `collateral_type`, `collateral_description`, `collateral_value`, `status`, `loan_officer_id`, `branch`, `approved_by`, `disbursed_by`, `application_date`, `approval_date`, `disbursement_date`, `first_payment_date`, `last_payment_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'LN001', 'ACC001', 1, 'BRW001', 1, 'Business expansion', 'trade', '1000000.00', NULL, NULL, '3.89', 'reducing_balance', 12, NULL, 'monthly', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'pending', 2, 'Main Branch', NULL, NULL, '2025-05-27 03:24:10', NULL, NULL, NULL, NULL, NULL, '2025-05-27 01:24:10', '2025-05-27 01:24:10'),
(2, 'LN002', 'ACC002', 2, 'CLT002', 1, 'Business expansion', 'trade', '1500000.00', NULL, NULL, '3.89', 'reducing_balance', 12, '2026-05-06', 'monthly', '127649.48', 12, 0, 12, 0, '1531793.78', '1500000.00', '31793.78', '0.00', '0.00', 'performing', NULL, 0, 'movable_assets', 'Electronics inventory', '2000000.00', 'active', 2, 'Main Branch', NULL, NULL, '2025-05-27 02:12:29', NULL, NULL, NULL, NULL, NULL, '2025-05-27 02:12:29', '2025-05-31 07:00:00'),
(3, 'LN003', 'ACC003', 3, 'CLT003', 1, 'Purchase farming equipment and seeds', 'agriculture', '1500000.00', NULL, NULL, '4.50', 'reducing_balance', 18, '2026-11-27', 'monthly', '86333.56', 18, 1, 17, 0, '1374004.17', '1350000.00', '24004.17', '0.00', '0.00', 'performing', NULL, 0, 'immovable_assets', 'Land title deed', '5000000.00', 'pending', 2, 'Rural Branch', NULL, NULL, '2025-05-27 02:14:18', NULL, NULL, NULL, '2024-01-15', NULL, '2025-05-27 02:14:18', '2025-05-28 05:42:03'),
(4, 'LN004', 'ACC004', 1, 'CLT001', 1, 'Equipment purchase', 'other', '1500000.00', NULL, NULL, '3.89', 'reducing_balance', 6, '2025-11-27', 'monthly', '252844.11', 6, 0, 6, 0, '1517064.65', '1500000.00', '17064.65', '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'pending', 2, NULL, NULL, NULL, '2025-05-27 02:20:26', NULL, NULL, NULL, NULL, NULL, '2025-05-27 02:20:26', '2025-05-27 02:20:26'),
(5, 'LN005', 'ACC005', 1, 'CLT001', 1, 'Equipment purchase', 'other', '1500000.00', NULL, NULL, '3.89', 'reducing_balance', 6, '2025-11-28', 'monthly', '252844.11', 6, 0, 6, 0, '1517064.65', '1500000.00', '17064.65', '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'pending', 2, NULL, NULL, NULL, '2025-05-28 07:27:06', NULL, NULL, NULL, NULL, NULL, '2025-05-28 07:27:06', '2025-05-28 07:27:06'),
(6, 'LN006', 'ACC006', 1, 'CLT001', 1, 'Business expansion', 'other', '2000000.00', NULL, NULL, '3.89', 'reducing_balance', 12, '2026-05-28', 'monthly', '170199.31', 12, 0, 12, 0, '2000000.00', '2000000.00', '42391.71', '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'pending', 2, NULL, NULL, NULL, '2025-05-28 08:55:11', NULL, NULL, NULL, NULL, NULL, '2025-05-28 08:55:11', '2025-05-28 08:55:11'),
(11, 'LN007', 'ACC007', 1, 'CLT001', 1, 'Business expansion', 'other', '2000000.00', NULL, NULL, '3.89', 'reducing_balance', 12, '2026-05-28', 'monthly', '170199.31', 12, 12, 0, 0, '0.00', '0.00', '0.00', '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'completed', 2, NULL, NULL, NULL, '2025-05-28 10:04:03', NULL, NULL, NULL, '2024-05-28', NULL, '2025-05-28 10:04:03', '2025-05-28 11:09:14'),
(12, 'LN008', 'ACC008', 1, 'CLT001', 1, 'Business expansion', 'other', '2000000.00', NULL, NULL, '3.89', 'reducing_balance', 12, '2026-05-30', 'monthly', '170199.31', 12, 0, 12, 0, '2000000.00', '2000000.00', '42391.71', '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'pending', 2, NULL, NULL, NULL, '2025-05-30 19:22:40', NULL, NULL, NULL, NULL, NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(13, 'LN009', 'ACC009', 1, 'CLT001', 1, 'Business expansion', 'other', '2000000.00', NULL, NULL, '3.89', 'reducing_balance', 12, '2026-05-30', 'monthly', '170199.31', 12, 0, 12, 0, '2000000.00', '2000000.00', '42391.71', '0.00', '0.00', 'performing', NULL, 0, 'none', NULL, NULL, 'pending', 2, NULL, NULL, NULL, '2025-05-30 22:55:40', NULL, NULL, NULL, NULL, NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40');

-- --------------------------------------------------------

--
-- Table structure for table `loan_audit_logs`
--

CREATE TABLE `loan_audit_logs` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `performed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_collateral`
--

CREATE TABLE `loan_collateral` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `collateral_type` enum('property','vehicle','equipment','jewelry','documents','other') NOT NULL,
  `description` text NOT NULL,
  `estimated_value` decimal(15,2) NOT NULL,
  `current_value` decimal(15,2) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `condition_status` enum('excellent','good','fair','poor') DEFAULT 'good',
  `insurance_details` text DEFAULT NULL,
  `valuation_date` date DEFAULT NULL,
  `valuated_by` varchar(100) DEFAULT NULL,
  `status` enum('active','released','liquidated') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_comments`
--

CREATE TABLE `loan_comments` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `comment_type` enum('general','approval','disbursement','collection','legal','system') DEFAULT 'general',
  `comment` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT 1,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_expenses`
--

CREATE TABLE `loan_expenses` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `expense_type` enum('processing_fee','valuation_fee','legal_fee','insurance','other') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `expense_date` date NOT NULL,
  `paid_by` enum('client','company') DEFAULT 'client',
  `payment_status` enum('pending','paid','waived') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_files`
--

CREATE TABLE `loan_files` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` enum('application','id_copy','income_proof','collateral_docs','agreement','other') NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `status` enum('pending_review','approved','rejected') DEFAULT 'pending_review',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_fraud_flags`
--

CREATE TABLE `loan_fraud_flags` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `fraud_indicators` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Array of fraud indicators' CHECK (json_valid(`fraud_indicators`)),
  `severity` enum('low','medium','high','critical') NOT NULL,
  `status` enum('reported','investigating','confirmed','dismissed','resolved') DEFAULT 'reported',
  `description` text NOT NULL,
  `evidence_description` text DEFAULT NULL,
  `evidence_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of evidence file paths' CHECK (json_valid(`evidence_files`)),
  `investigated_by` int(11) DEFAULT NULL,
  `investigation_start_date` date DEFAULT NULL,
  `investigation_end_date` date DEFAULT NULL,
  `investigation_notes` text DEFAULT NULL,
  `recommended_action` enum('investigate_further','contact_authorities','freeze_account','legal_action','write_off','refer_to_fraud_team') DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `outcome` enum('fraud_confirmed','fraud_dismissed','partial_fraud','under_investigation') DEFAULT NULL,
  `notify_authorities` tinyint(1) DEFAULT 0,
  `authorities_notified_date` date DEFAULT NULL,
  `authorities_reference` varchar(100) DEFAULT NULL,
  `estimated_loss` decimal(15,2) DEFAULT NULL,
  `actual_loss` decimal(15,2) DEFAULT NULL,
  `recovered_amount` decimal(15,2) DEFAULT 0.00,
  `reported_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_other_income`
--

CREATE TABLE `loan_other_income` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `income_type` enum('late_fee','processing_fee','service_charge','insurance_commission','other') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `income_date` date NOT NULL,
  `status` enum('pending','received','waived') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_payments`
--

CREATE TABLE `loan_payments` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `payment_number` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `interest_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fees_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `penalty_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','bank_transfer','mobile_money','check','card','online') NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `receipt_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','confirmed','failed','reversed','partial') DEFAULT 'confirmed',
  `verification_status` enum('unverified','verified','disputed') DEFAULT 'unverified',
  `verified_by` int(11) DEFAULT NULL,
  `verification_date` date DEFAULT NULL,
  `loan_balance_after` decimal(15,2) DEFAULT NULL,
  `principal_balance_after` decimal(15,2) DEFAULT NULL,
  `interest_balance_after` decimal(15,2) DEFAULT NULL,
  `days_late` int(11) DEFAULT 0,
  `late_fee_charged` decimal(15,2) DEFAULT 0.00,
  `payment_notes` text DEFAULT NULL,
  `internal_notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_payment_analysis_cache`
--

CREATE TABLE `loan_payment_analysis_cache` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `analysis_date` date NOT NULL,
  `analysis_start_date` date NOT NULL,
  `analysis_end_date` date NOT NULL,
  `criteria` varchar(50) NOT NULL,
  `expected_payments_count` int(11) DEFAULT 0,
  `actual_payments_count` int(11) DEFAULT 0,
  `missed_payments_count` int(11) DEFAULT 0,
  `payment_gaps_count` int(11) DEFAULT 0,
  `expected_amount` decimal(15,2) DEFAULT 0.00,
  `actual_amount` decimal(15,2) DEFAULT 0.00,
  `payment_consistency_score` int(11) DEFAULT 0,
  `avg_days_between_payments` decimal(8,2) DEFAULT 0.00,
  `max_payment_gap_days` int(11) DEFAULT 0,
  `days_since_last_payment` int(11) DEFAULT 0,
  `risk_category` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
  `estimated_interest_loss` decimal(15,2) DEFAULT 0.00,
  `detailed_analysis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detailed_analysis`)),
  `recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recommendations`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_recovery_actions`
--

CREATE TABLE `loan_recovery_actions` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `action_type` enum('phone_call','sms_reminder','email_notice','field_visit','formal_notice','legal_notice','restructure_proposal','settlement_offer','collateral_assessment','guarantor_contact','payment_plan_setup','account_freeze','asset_seizure','legal_proceedings') NOT NULL,
  `description` text NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('planned','in_progress','completed','cancelled','failed') DEFAULT 'planned',
  `action_date` date NOT NULL,
  `target_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `contact_method` enum('phone','sms','email','in_person','letter','legal_notice') DEFAULT NULL,
  `contact_person` varchar(200) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `amount_to_collect` decimal(15,2) DEFAULT NULL,
  `amount_collected` decimal(15,2) DEFAULT 0.00,
  `payment_promise_date` date DEFAULT NULL,
  `payment_promise_amount` decimal(15,2) DEFAULT NULL,
  `outcome` enum('successful','partial','failed','no_contact','refused','pending') DEFAULT NULL,
  `outcome_description` text DEFAULT NULL,
  `next_action_recommended` varchar(500) DEFAULT NULL,
  `evidence_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of file paths/URLs for evidence' CHECK (json_valid(`evidence_files`)),
  `notes` text DEFAULT NULL,
  `internal_notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_restructures`
--

CREATE TABLE `loan_restructures` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `restructure_type` enum('term_extension','payment_reduction','interest_rate_reduction','principal_reduction','payment_holiday') NOT NULL,
  `reason` text NOT NULL,
  `original_terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`original_terms`)),
  `new_terms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_terms`)),
  `effective_date` date NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('pending','approved','rejected','implemented') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `loan_schedules`
--

CREATE TABLE `loan_schedules` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `installment_number` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `principal_due` decimal(15,2) NOT NULL DEFAULT 0.00,
  `interest_due` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fees_due` decimal(15,2) DEFAULT 0.00,
  `total_due` decimal(15,2) NOT NULL DEFAULT 0.00,
  `principal_paid` decimal(15,2) DEFAULT 0.00,
  `interest_paid` decimal(15,2) DEFAULT 0.00,
  `fees_paid` decimal(15,2) DEFAULT 0.00,
  `total_paid` decimal(15,2) DEFAULT 0.00,
  `balance_after` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','partial','paid','overdue','follow_up_scheduled') DEFAULT 'pending',
  `payment_date` date DEFAULT NULL,
  `days_overdue` int(11) DEFAULT 0,
  `penalty_amount` decimal(15,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `loan_schedules`
--

INSERT INTO `loan_schedules` (`id`, `loan_id`, `installment_number`, `due_date`, `principal_due`, `interest_due`, `fees_due`, `total_due`, `principal_paid`, `interest_paid`, `fees_paid`, `total_paid`, `balance_after`, `status`, `payment_date`, `days_overdue`, `penalty_amount`, `notes`, `created_at`, `updated_at`) VALUES
(1, 11, 1, '2025-06-28', '163715.98', '6483.33', '0.00', '170199.31', '163715.98', '6483.33', '0.00', '170199.31', '1836284.02', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:06:54'),
(2, 11, 2, '2025-07-28', '164246.69', '5952.62', '0.00', '170199.31', '164246.69', '5952.62', '0.00', '170199.31', '1672037.34', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(3, 11, 3, '2025-08-28', '164779.12', '5420.19', '0.00', '170199.31', '164779.12', '5420.19', '0.00', '170199.31', '1507258.22', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(4, 11, 4, '2025-09-28', '165313.28', '4886.03', '0.00', '170199.31', '165313.28', '4886.03', '0.00', '170199.31', '1341944.94', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(5, 11, 5, '2025-10-28', '165849.17', '4350.14', '0.00', '170199.31', '165849.17', '4350.14', '0.00', '170199.31', '1176095.76', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(6, 11, 6, '2025-11-28', '166386.80', '3812.51', '0.00', '170199.31', '166386.80', '3812.51', '0.00', '170199.31', '1009708.97', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(7, 11, 7, '2025-12-28', '166926.17', '3273.14', '0.00', '170199.31', '166926.17', '3273.14', '0.00', '170199.31', '842782.80', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(8, 11, 8, '2026-01-28', '167467.29', '2732.02', '0.00', '170199.31', '167467.29', '2732.02', '0.00', '170199.31', '675315.51', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(9, 11, 9, '2026-02-28', '168010.16', '2189.15', '0.00', '170199.31', '168010.16', '2189.15', '0.00', '170199.31', '507305.35', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(10, 11, 10, '2026-03-28', '168554.79', '1644.51', '0.00', '170199.31', '168554.79', '1644.51', '0.00', '170199.30', '338750.55', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(11, 11, 11, '2026-04-28', '169101.19', '1098.12', '0.00', '170199.31', '169101.19', '1098.12', '0.00', '170199.31', '169649.36', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:08:33'),
(12, 11, 12, '2026-05-28', '169649.36', '549.95', '0.00', '170199.31', '169649.36', '549.95', '0.00', '170199.31', '0.00', 'paid', '2024-05-28', 0, '0.00', NULL, '2025-05-28 10:04:03', '2025-05-28 11:09:14'),
(13, 12, 1, '2025-06-30', '163715.98', '6483.33', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1836284.02', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(14, 12, 2, '2025-07-30', '164246.69', '5952.62', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1672037.34', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(15, 12, 3, '2025-08-30', '164779.12', '5420.19', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1507258.22', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(16, 12, 4, '2025-09-30', '165313.28', '4886.03', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1341944.94', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(17, 12, 5, '2025-10-30', '165849.17', '4350.14', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1176095.76', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(18, 12, 6, '2025-11-30', '166386.80', '3812.51', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1009708.97', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(19, 12, 7, '2025-12-30', '166926.17', '3273.14', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '842782.80', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(20, 12, 8, '2026-01-30', '167467.29', '2732.02', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '675315.51', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(21, 12, 9, '2026-03-02', '168010.16', '2189.15', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '507305.35', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(22, 12, 10, '2026-03-30', '168554.79', '1644.51', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '338750.55', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(23, 12, 11, '2026-04-30', '169101.19', '1098.12', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '169649.36', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(24, 12, 12, '2026-05-30', '169649.36', '549.95', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '0.00', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 19:22:40', '2025-05-30 19:22:40'),
(25, 13, 1, '2025-06-30', '163715.98', '6483.33', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1836284.02', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(26, 13, 2, '2025-07-30', '164246.69', '5952.62', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1672037.34', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(27, 13, 3, '2025-08-30', '164779.12', '5420.19', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1507258.22', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(28, 13, 4, '2025-09-30', '165313.28', '4886.03', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1341944.94', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(29, 13, 5, '2025-10-30', '165849.17', '4350.14', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1176095.76', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(30, 13, 6, '2025-11-30', '166386.80', '3812.51', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '1009708.97', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(31, 13, 7, '2025-12-30', '166926.17', '3273.14', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '842782.80', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(32, 13, 8, '2026-01-30', '167467.29', '2732.02', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '675315.51', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(33, 13, 9, '2026-03-02', '168010.16', '2189.15', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '507305.35', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(34, 13, 10, '2026-03-30', '168554.79', '1644.51', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '338750.55', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(35, 13, 11, '2026-04-30', '169101.19', '1098.12', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '169649.36', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40'),
(36, 13, 12, '2026-05-30', '169649.36', '549.95', '0.00', '170199.31', '0.00', '0.00', '0.00', '0.00', '0.00', 'pending', NULL, 0, '0.00', NULL, '2025-05-30 22:55:40', '2025-05-30 22:55:40');

-- --------------------------------------------------------

--
-- Table structure for table `loan_types`
--

CREATE TABLE `loan_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('loan','guarantee','finance') DEFAULT 'loan',
  `cost_of_funds` decimal(5,4) DEFAULT 0.0100 COMMENT 'Cost of funds percentage (e.g., 0.01 = 1%)',
  `operating_cost` decimal(5,4) DEFAULT 0.0083 COMMENT 'Operating cost percentage (e.g., 0.0083 = 0.83%)',
  `risk_percentage` decimal(5,4) DEFAULT 0.0083 COMMENT 'Risk percentage (e.g., 0.0083 = 0.83%)',
  `profit_margin` decimal(5,4) DEFAULT 0.0123 COMMENT 'Profit margin percentage (e.g., 0.0123 = 1.23%)',
  `nominal_interest_rate` decimal(5,2) NOT NULL COMMENT 'Total nominal interest rate (e.g., 3.90 = 3.9%)',
  `min_interest_rate` decimal(5,2) DEFAULT NULL COMMENT 'Minimum interest rate for variable rate loans',
  `max_interest_rate` decimal(5,2) DEFAULT NULL COMMENT 'Maximum interest rate for variable rate loans',
  `interest_calculation_method` enum('flat','reducing_balance','compound') DEFAULT 'reducing_balance',
  `application_fee_type` enum('percentage','fixed_amount') DEFAULT 'percentage',
  `application_fee_rate` decimal(5,4) DEFAULT NULL COMMENT 'Application fee as percentage (e.g., 0.01 = 1%)',
  `application_fee_fixed` decimal(15,2) DEFAULT NULL COMMENT 'Fixed application fee amount',
  `disbursement_fee_type` enum('percentage','fixed_amount','tiered') DEFAULT 'percentage',
  `disbursement_fee_rate` decimal(5,4) DEFAULT NULL COMMENT 'Disbursement fee as percentage',
  `disbursement_fee_fixed` decimal(15,2) DEFAULT NULL COMMENT 'Fixed disbursement fee amount',
  `management_fee_rate` decimal(5,4) DEFAULT 0.0200 COMMENT 'Management fee as percentage',
  `risk_premium_fee_rate` decimal(5,4) DEFAULT 0.0150 COMMENT 'Risk premium fee as percentage',
  `late_payment_fee_rate` decimal(5,4) DEFAULT 0.0700 COMMENT 'Late payment fee rate (daily)',
  `late_payment_fee_type` enum('daily','monthly','fixed') DEFAULT 'daily',
  `vat_applicable` tinyint(1) DEFAULT 1,
  `vat_rate` decimal(5,4) DEFAULT 0.1800 COMMENT 'VAT rate (e.g., 0.18 = 18%)',
  `min_term_days` int(11) DEFAULT NULL COMMENT 'Minimum loan term in days',
  `max_term_days` int(11) DEFAULT NULL COMMENT 'Maximum loan term in days',
  `min_term_months` int(11) DEFAULT NULL COMMENT 'Minimum loan term in months',
  `max_term_months` int(11) DEFAULT NULL COMMENT 'Maximum loan term in months',
  `min_amount` decimal(15,2) DEFAULT NULL COMMENT 'Minimum loan amount',
  `max_amount` decimal(15,2) DEFAULT NULL COMMENT 'Maximum loan amount',
  `allowed_frequencies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of allowed repayment frequencies' CHECK (json_valid(`allowed_frequencies`)),
  `default_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly','lump_sum') DEFAULT 'monthly',
  `requires_collateral` tinyint(1) DEFAULT 0,
  `requires_guarantor` tinyint(1) DEFAULT 0,
  `documentation_required` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of required documents' CHECK (json_valid(`documentation_required`)),
  `currency` varchar(3) DEFAULT 'RWF',
  `is_active` tinyint(1) DEFAULT 1,
  `is_visible_to_clients` tinyint(1) DEFAULT 1 COMMENT 'Whether clients can see this loan type in applications',
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `disbursement_fee_tiers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON array of tiered fee structure: [{min_amount, max_amount, fee}]' CHECK (json_valid(`disbursement_fee_tiers`)),
  `fixed_term_days` int(11) DEFAULT NULL COMMENT 'Fixed term in days (for products with fixed terms)',
  `allowed_collateral_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of allowed collateral types' CHECK (json_valid(`allowed_collateral_types`)),
  `min_collateral_ratio` decimal(5,2) DEFAULT NULL COMMENT 'Minimum collateral to loan ratio (e.g., 1.2 = 120%)',
  `requires_approval` tinyint(1) DEFAULT 1,
  `auto_approve_limit` decimal(15,2) DEFAULT NULL COMMENT 'Amount below which loans can be auto-approved',
  `approval_levels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON array defining approval hierarchy' CHECK (json_valid(`approval_levels`)),
  `max_loans_per_client` int(11) DEFAULT NULL COMMENT 'Maximum number of active loans per client',
  `min_guarantor_income` decimal(15,2) DEFAULT NULL,
  `special_conditions` text DEFAULT NULL COMMENT 'Special terms and conditions for this loan type'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `loan_types`
--

INSERT INTO `loan_types` (`id`, `name`, `code`, `description`, `category`, `cost_of_funds`, `operating_cost`, `risk_percentage`, `profit_margin`, `nominal_interest_rate`, `min_interest_rate`, `max_interest_rate`, `interest_calculation_method`, `application_fee_type`, `application_fee_rate`, `application_fee_fixed`, `disbursement_fee_type`, `disbursement_fee_rate`, `disbursement_fee_fixed`, `management_fee_rate`, `risk_premium_fee_rate`, `late_payment_fee_rate`, `late_payment_fee_type`, `vat_applicable`, `vat_rate`, `min_term_days`, `max_term_days`, `min_term_months`, `max_term_months`, `min_amount`, `max_amount`, `allowed_frequencies`, `default_frequency`, `requires_collateral`, `requires_guarantor`, `documentation_required`, `currency`, `is_active`, `is_visible_to_clients`, `created_by`, `updated_by`, `created_at`, `updated_at`, `disbursement_fee_tiers`, `fixed_term_days`, `allowed_collateral_types`, `min_collateral_ratio`, `requires_approval`, `auto_approve_limit`, `approval_levels`, `max_loans_per_client`, `min_guarantor_income`, `special_conditions`) VALUES
(1, 'Business Loan', 'BL001', 'Loan for business expansion and working capital needs', 'loan', '0.0100', '0.0083', '0.0083', '0.0123', '3.89', '3.50', '4.50', 'reducing_balance', 'percentage', '0.0200', NULL, 'percentage', '0.0100', NULL, '0.0200', '0.0150', '0.0700', 'daily', 1, '0.1800', NULL, NULL, 6, 60, '100000.00', '50000000.00', '[\"monthly\",\"quarterly\"]', 'monthly', 1, 1, '[\"business_license\",\"financial_statements\",\"tax_returns\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:02:57', '2025-05-27 01:02:57', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(2, 'Contract Finance Loan', 'CFL001', 'Financing for contract execution and fulfillment', 'loan', '0.0100', '0.0083', '0.0100', '0.0150', '4.33', '4.00', '5.00', 'reducing_balance', 'percentage', '0.0250', NULL, 'percentage', '0.0150', NULL, '0.0250', '0.0200', '0.0700', 'daily', 1, '0.1800', NULL, NULL, 3, 24, '500000.00', '100000000.00', '[\"monthly\"]', 'monthly', 1, 1, '[\"contract_document\",\"business_license\",\"bank_statements\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:02:57', '2025-05-27 01:02:57', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(3, 'Daily Finance Loan (Immovable Assets)', 'DFL-IA001', 'Short-term financing secured by immovable assets', 'loan', '0.0080', '0.0120', '0.0080', '0.0170', '4.50', '4.00', '5.50', 'reducing_balance', 'percentage', '0.0200', NULL, 'percentage', '0.0100', NULL, '0.0200', '0.0100', '0.1000', 'daily', 1, '0.1800', 30, 365, NULL, NULL, '100000.00', '20000000.00', '[\"daily\",\"weekly\",\"monthly\"]', 'monthly', 1, 0, '[\"property_title\",\"valuation_report\",\"national_id\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:02:57', '2025-05-27 01:02:57', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(4, 'Daily Finance Loan (Movable Assets)', 'DFL-MA001', 'Short-term financing secured by movable assets', 'loan', '0.0080', '0.0150', '0.0120', '0.0200', '5.50', '5.00', '6.50', 'reducing_balance', 'percentage', '0.0250', NULL, 'percentage', '0.0150', NULL, '0.0250', '0.0150', '0.1000', 'daily', 1, '0.1800', 30, 180, NULL, NULL, '50000.00', '10000000.00', '[\"daily\",\"weekly\",\"monthly\"]', 'weekly', 1, 1, '[\"asset_valuation\",\"ownership_proof\",\"national_id\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:02:57', '2025-05-27 01:02:57', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(5, 'Personal Loan', 'PL001', 'Personal financing for individual needs', 'loan', '0.0100', '0.0100', '0.0150', '0.0200', '5.50', '5.00', '6.00', 'reducing_balance', 'percentage', '0.0300', NULL, 'fixed_amount', NULL, '5000.00', '0.0150', '0.0100', '0.0500', 'daily', 1, '0.1800', NULL, NULL, 3, 36, '50000.00', '5000000.00', '[\"monthly\"]', 'monthly', 0, 1, '[\"national_id\",\"salary_slip\",\"bank_statements\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:06:14', '2025-05-27 01:06:14', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(6, 'Bid Security', 'BS001', 'Guarantee for tender bid security', 'guarantee', '0.0050', '0.0080', '0.0050', '0.0120', '3.00', '2.50', '3.50', 'flat', 'percentage', '0.0150', NULL, 'percentage', '0.0050', NULL, '0.0100', '0.0050', '0.0500', 'daily', 1, '0.1800', 30, 365, NULL, NULL, '100000.00', '50000000.00', '[\"lump_sum\"]', 'lump_sum', 1, 0, '[\"tender_document\",\"business_license\",\"financial_statements\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:06:14', '2025-05-27 01:06:14', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(7, 'Performance Guarantee', 'PG001', 'Guarantee for contract performance', 'guarantee', '0.0050', '0.0100', '0.0080', '0.0150', '3.80', '3.50', '4.50', 'flat', 'percentage', '0.0200', NULL, 'percentage', '0.0100', NULL, '0.0150', '0.0100', '0.0500', 'daily', 1, '0.1800', 90, 1095, NULL, NULL, '500000.00', '100000000.00', '[\"lump_sum\"]', 'lump_sum', 1, 0, '[\"contract_document\",\"business_license\",\"bank_statements\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:06:14', '2025-05-27 01:06:14', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(8, 'Advance Payment Guarantee', 'APG001', 'Guarantee for advance payment protection', 'guarantee', '0.0050', '0.0080', '0.0070', '0.0130', '3.30', '3.00', '4.00', 'flat', 'percentage', '0.0180', NULL, 'percentage', '0.0080', NULL, '0.0120', '0.0080', '0.0500', 'daily', 1, '0.1800', 60, 730, NULL, NULL, '200000.00', '75000000.00', '[\"lump_sum\"]', 'lump_sum', 1, 0, '[\"contract_document\",\"advance_payment_request\",\"business_license\"]', 'RWF', 1, 1, NULL, NULL, '2025-05-27 01:06:14', '2025-05-27 01:06:14', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `missed_repayment_followups`
--

CREATE TABLE `missed_repayment_followups` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `follow_up_action` enum('phone_call','sms','email','visit','legal_notice','restructure','other') NOT NULL,
  `follow_up_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `completion_notes` text DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `next_action` enum('phone_call','sms','email','visit','legal_notice','restructure','escalate','none') DEFAULT NULL,
  `next_follow_up_date` date DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `penalty_settings`
--

CREATE TABLE `penalty_settings` (
  `id` int(11) NOT NULL,
  `loan_type_id` int(11) DEFAULT NULL,
  `penalty_type` enum('daily','monthly','fixed') DEFAULT 'daily',
  `penalty_rate` decimal(5,4) NOT NULL,
  `grace_period_days` int(11) DEFAULT 0,
  `max_penalty_amount` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `repayments`
--

CREATE TABLE `repayments` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `receipt_number` varchar(20) NOT NULL,
  `payment_date` date NOT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `principal_paid` decimal(15,2) NOT NULL,
  `interest_paid` decimal(15,2) NOT NULL,
  `penalty_paid` decimal(15,2) DEFAULT 0.00,
  `payment_method` enum('cash','bank_transfer','mobile_money','cheque','card') DEFAULT 'cash',
  `reference_number` varchar(100) DEFAULT NULL,
  `received_by` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','reversed') DEFAULT 'confirmed',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `repayments`
--

INSERT INTO `repayments` (`id`, `loan_id`, `schedule_id`, `receipt_number`, `payment_date`, `amount_paid`, `principal_paid`, `interest_paid`, `penalty_paid`, `payment_method`, `reference_number`, `received_by`, `notes`, `status`, `created_at`, `updated_at`) VALUES
(1, 11, NULL, 'RPT001', '2024-05-28', '170199.31', '163715.98', '6483.33', '0.00', 'cash', 'REF123456', 2, 'First installment payment', 'confirmed', '2025-05-28 11:06:54', '2025-05-28 11:06:54'),
(2, 11, NULL, 'RPT002', '2024-05-28', '1836284.02', '1800375.64', '35908.38', '0.00', 'cash', 'REF123456', 2, 'First installment payment', 'confirmed', '2025-05-28 11:08:33', '2025-05-28 11:08:33'),
(3, 11, NULL, 'RPT003', '2024-05-28', '1836284.02', '35908.38', '0.00', '0.00', 'cash', 'REF123456', 2, 'First installment payment', 'confirmed', '2025-05-28 11:09:14', '2025-05-28 11:09:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','supervisor','loan-officer','cashier') NOT NULL DEFAULT 'loan-officer',
  `password` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `first_name`, `last_name`, `email`, `role`, `password`, `last_login`, `created_at`, `updated_at`, `mobile`, `status`) VALUES
(1, 'LO50371434', 'John', 'Doe', 'john.doe@isoko.com', 'loan-officer', '$2b$12$s9ow0U5.R1ZmB5BDp/tRc.tQVc/sEDdCW1fWhy32oG7A4cSVRQyIe', NULL, '2025-05-25 12:51:43', '2025-05-25 12:51:43', NULL, 'active'),
(2, 'ADM02118263', 'Admin', 'User', 'admin@isoko.com', 'admin', '$2b$12$eSytKx6jAABXs78/4m140ea7lrJLXnza1qUBl6pRuGQUh0uqCsKC2', '2025-05-29 19:30:20', '2025-05-25 13:00:21', '2025-05-29 19:30:20', NULL, 'active'),
(3, 'SUP09478912', 'Supervisor', 'User', 'supervisor@isoko.com', 'supervisor', '$2b$12$QyNf4JLzZmyD9EhB/QiZiO/FCi5cO3jCnOWkyIT7iofNo2TTbHSqe', NULL, '2025-05-25 13:01:34', '2025-05-25 13:01:34', NULL, 'active'),
(4, 'LO15903915', 'Loan', 'Officer', 'loan-officer@isoko.com', 'loan-officer', '$2b$12$UVOfD/3at8y5FXxioUP0OeEMRPfHswjkUE3nQdRu2q4cGW/6tynhi', '2025-05-26 19:22:23', '2025-05-25 13:02:39', '2025-05-26 19:22:23', NULL, 'active'),
(5, 'CSH22604932', 'Cashier', 'User', 'cashier@isoko.com', 'cashier', '$2b$12$iqUbx73ckQLKEWrNC6kUsO5s4D4h9A05VnaypzmUvyIRYdr67wPOa', NULL, '2025-05-25 13:03:46', '2025-05-25 13:03:46', NULL, 'active'),
(6, 'DEACT001', 'Deactivated', 'User', 'deactivated@test.com', 'loan-officer', '$2a$12$LQv3c1yqBwlVHpPRLqvBNu7BgGqKdx8kW2qkjrwHxYzCy/Lxj3oCm', NULL, '2025-05-26 18:35:22', '2025-05-26 18:35:22', NULL, 'inactive');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_daily_no_repayment_dashboard`
-- (See below for the actual view)
--
CREATE TABLE `v_daily_no_repayment_dashboard` (
`total_loans_no_payment` bigint(21)
,`total_amount_at_risk` decimal(37,2)
,`total_estimated_loss` decimal(47,2)
,`critical_loans` bigint(21)
,`high_risk_loans` bigint(21)
,`critical_amount` decimal(37,2)
,`new_loans_no_payment` bigint(21)
,`urgent_action_required` bigint(21)
,`worst_performing_branch` varchar(100)
,`officer_most_issues` varchar(101)
,`avg_days_since_disbursement` decimal(14,4)
,`report_date` date
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_loans_no_payments`
-- (See below for the actual view)
--
CREATE TABLE `v_loans_no_payments` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`loan_account` varchar(30)
,`client_id` int(11)
,`client_name` varchar(201)
,`client_mobile` varchar(15)
,`client_email` varchar(100)
,`disbursed_amount` decimal(15,2)
,`disbursement_date` datetime
,`maturity_date` date
,`days_since_disbursement` int(7)
,`days_since_last_payment` int(7)
,`risk_category` varchar(9)
,`total_payments_made` bigint(21)
,`total_amount_paid` decimal(37,2)
,`expected_payments_by_now` int(8)
,`missed_payments_count` bigint(22)
,`expected_amount_by_now` decimal(22,2)
,`estimated_interest_loss` decimal(25,2)
,`recovery_actions_count` bigint(21)
,`pending_actions_count` bigint(21)
,`latest_recovery_action` varchar(21)
,`latest_recovery_action_date` date
,`active_fraud_flags` bigint(21)
,`loan_officer_name` varchar(101)
,`loan_officer_phone` varchar(15)
,`branch` varchar(100)
,`loan_type_name` varchar(100)
,`installment_amount` decimal(15,2)
,`repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly')
,`performance_class` enum('performing','watch','substandard','doubtful','loss')
,`interest_rate` decimal(5,2)
,`loan_type` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_no_repayment_by_branch`
-- (See below for the actual view)
--
CREATE TABLE `v_no_repayment_by_branch` (
`branch` varchar(100)
,`loans_count` bigint(21)
,`total_amount` decimal(37,2)
,`avg_loan_amount` decimal(19,6)
,`avg_days_since_disbursement` decimal(14,4)
,`low_risk_count` decimal(22,0)
,`medium_risk_count` decimal(22,0)
,`high_risk_count` decimal(22,0)
,`critical_risk_count` decimal(22,0)
,`total_estimated_loss` decimal(47,2)
,`total_expected_amount` decimal(44,2)
,`total_recovery_actions` decimal(42,0)
,`officers_count` bigint(21)
,`performing_count` decimal(22,0)
,`non_performing_count` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_no_repayment_by_officer`
-- (See below for the actual view)
--
CREATE TABLE `v_no_repayment_by_officer` (
`loan_officer_id` int(11)
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`branch` varchar(100)
,`loans_count` bigint(21)
,`total_amount` decimal(37,2)
,`avg_loan_amount` decimal(19,6)
,`avg_days_since_disbursement` decimal(14,4)
,`critical_risk_count` decimal(22,0)
,`high_risk_count` decimal(22,0)
,`medium_risk_count` decimal(22,0)
,`low_risk_count` decimal(22,0)
,`total_estimated_loss` decimal(47,2)
,`total_expected_amount` decimal(44,2)
,`total_recovery_actions` decimal(42,0)
,`loans_without_actions` decimal(22,0)
,`critical_risk_percentage` decimal(28,2)
,`action_taken_percentage` decimal(28,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_no_repayment_contact_list`
-- (See below for the actual view)
--
CREATE TABLE `v_no_repayment_contact_list` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`client_name` varchar(201)
,`client_mobile` varchar(15)
,`client_email` varchar(100)
,`disbursed_amount` decimal(15,2)
,`days_since_disbursement` int(7)
,`risk_category` varchar(9)
,`estimated_interest_loss` decimal(25,2)
,`loan_officer_name` varchar(101)
,`loan_officer_phone` varchar(15)
,`branch` varchar(100)
,`recovery_actions_count` bigint(21)
,`latest_recovery_action` varchar(21)
,`latest_recovery_action_date` date
,`contact_priority` varchar(26)
,`days_since_last_action` int(11)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_no_repayment_management_report`
-- (See below for the actual view)
--
CREATE TABLE `v_no_repayment_management_report` (
`period_name` varchar(13)
,`loans_count` bigint(21)
,`total_amount` decimal(37,2)
,`estimated_loss` decimal(47,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_no_repayment_stats`
-- (See below for the actual view)
--
CREATE TABLE `v_no_repayment_stats` (
`total_loans_no_payment` bigint(21)
,`total_amount_at_risk` decimal(37,2)
,`avg_loan_amount` decimal(19,6)
,`avg_days_since_disbursement` decimal(14,4)
,`min_days_since_disbursement` int(7)
,`max_days_since_disbursement` int(7)
,`low_risk_count` decimal(22,0)
,`medium_risk_count` decimal(22,0)
,`high_risk_count` decimal(22,0)
,`critical_risk_count` decimal(22,0)
,`low_risk_amount` decimal(37,2)
,`medium_risk_amount` decimal(37,2)
,`high_risk_amount` decimal(37,2)
,`critical_risk_amount` decimal(37,2)
,`low_risk_percentage` decimal(28,2)
,`medium_risk_percentage` decimal(28,2)
,`high_risk_percentage` decimal(28,2)
,`critical_risk_percentage` decimal(28,2)
,`total_recovery_actions` decimal(42,0)
,`loans_with_recovery_actions` decimal(22,0)
,`total_pending_actions` decimal(42,0)
,`avg_recovery_actions_per_loan` decimal(24,4)
,`total_fraud_flags` decimal(42,0)
,`loans_with_fraud_flags` decimal(22,0)
,`total_estimated_interest_loss` decimal(47,2)
,`avg_estimated_interest_loss` decimal(29,6)
,`total_expected_amount` decimal(44,2)
,`affected_branches` bigint(21)
,`affected_officers` bigint(21)
,`affected_loan_types` bigint(21)
,`performing_count` decimal(22,0)
,`watch_count` decimal(22,0)
,`substandard_count` decimal(22,0)
,`doubtful_count` decimal(22,0)
,`loss_count` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_no_repayment_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_no_repayment_summary` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`loan_account` varchar(30)
,`client_id` int(11)
,`disbursed_amount` decimal(15,2)
,`disbursement_date` datetime
,`maturity_date` date
,`loan_status` enum('pending','under_review','approved','disbursed','active','completed','defaulted','rejected','written_off')
,`branch` varchar(100)
,`loan_officer_id` int(11)
,`loan_term_months` int(11)
,`interest_rate` decimal(5,2)
,`repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly')
,`installment_amount` decimal(15,2)
,`total_installments` int(11)
,`loan_type` int(11)
,`performance_class` enum('performing','watch','substandard','doubtful','loss')
,`days_in_arrears` int(11)
,`arrears_start_date` date
,`collateral_type` enum('immovable_assets','movable_assets','guarantor','none')
,`collateral_value` decimal(15,2)
,`client_number` varchar(20)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`mobile` varchar(15)
,`email` varchar(100)
,`client_status` enum('active','inactive','suspended','pending_approval')
,`days_since_disbursement` int(7)
,`days_to_maturity` int(7)
,`total_payments_made` bigint(21)
,`total_amount_paid` decimal(37,2)
,`last_payment_date` date
,`days_since_last_payment` int(7)
,`expected_payments_by_now` int(8)
,`missed_payments_count` bigint(22)
,`risk_category` varchar(9)
,`estimated_interest_loss` decimal(25,2)
,`expected_amount_by_now` decimal(22,2)
,`recovery_actions_count` bigint(21)
,`completed_actions_count` bigint(21)
,`pending_actions_count` bigint(21)
,`latest_recovery_action` varchar(21)
,`latest_recovery_action_date` date
,`latest_recovery_action_status` varchar(11)
,`active_fraud_flags` bigint(21)
,`highest_fraud_severity` varchar(8)
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`loan_officer_email` varchar(100)
,`loan_officer_phone` varchar(15)
,`loan_type_name` varchar(100)
,`loan_type_category` enum('loan','guarantee','finance')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_past_maturity_by_branch`
-- (See below for the actual view)
--
CREATE TABLE `v_past_maturity_by_branch` (
`branch` varchar(100)
,`loans_count` bigint(21)
,`total_outstanding` decimal(37,2)
,`avg_outstanding` decimal(19,6)
,`avg_days_past_maturity` decimal(14,4)
,`extremely_overdue_count` decimal(22,0)
,`critically_overdue_count` decimal(22,0)
,`total_penalty_interest` decimal(47,2)
,`avg_collection_rate` decimal(47,6)
,`total_recovery_actions` decimal(42,0)
,`total_post_maturity_actions` decimal(42,0)
,`officers_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_past_maturity_by_officer`
-- (See below for the actual view)
--
CREATE TABLE `v_past_maturity_by_officer` (
`loan_officer_id` int(11)
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`branch` varchar(100)
,`loans_count` bigint(21)
,`total_outstanding` decimal(37,2)
,`avg_days_past_maturity` decimal(14,4)
,`extremely_overdue_count` decimal(22,0)
,`critically_overdue_count` decimal(22,0)
,`total_penalty_interest` decimal(47,2)
,`avg_collection_rate` decimal(47,6)
,`total_recovery_actions` decimal(42,0)
,`total_post_maturity_actions` decimal(42,0)
,`loans_without_post_maturity_actions` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_past_maturity_day_analysis`
-- (See below for the actual view)
--
CREATE TABLE `v_past_maturity_day_analysis` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`loan_account` varchar(30)
,`client_id` int(11)
,`disbursed_amount` decimal(15,2)
,`disbursement_date` datetime
,`maturity_date` date
,`loan_status` enum('pending','under_review','approved','disbursed','active','completed','defaulted','rejected','written_off')
,`branch` varchar(100)
,`loan_officer_id` int(11)
,`loan_term_months` int(11)
,`interest_rate` decimal(5,2)
,`interest_rate_method` enum('flat','reducing_balance','compound')
,`repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly')
,`installment_amount` decimal(15,2)
,`total_installments` int(11)
,`installments_paid` int(11)
,`installments_outstanding` int(11)
,`installments_in_arrears` int(11)
,`loan_balance` decimal(15,2)
,`principal_balance` decimal(15,2)
,`interest_balance` decimal(15,2)
,`arrears_principal` decimal(15,2)
,`arrears_interest` decimal(15,2)
,`loan_type` int(11)
,`performance_class` enum('performing','watch','substandard','doubtful','loss')
,`days_in_arrears` int(11)
,`arrears_start_date` date
,`collateral_type` enum('immovable_assets','movable_assets','guarantor','none')
,`collateral_value` decimal(15,2)
,`economic_sector` enum('agriculture','manufacturing','trade','services','transport','construction','education','health','other')
,`loan_purpose` text
,`client_number` varchar(20)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`mobile` varchar(15)
,`email` varchar(100)
,`client_status` enum('active','inactive','suspended','pending_approval')
,`days_past_maturity` int(7)
,`days_since_disbursement` int(7)
,`original_loan_duration_days` int(7)
,`total_payments_made` bigint(21)
,`total_amount_paid` decimal(37,2)
,`amount_paid_after_maturity` decimal(37,2)
,`payments_made_after_maturity` bigint(21)
,`last_payment_date` date
,`current_outstanding_balance` decimal(15,2)
,`outstanding_principal` decimal(15,2)
,`overdue_category` varchar(18)
,`estimated_penalty_interest` decimal(25,2)
,`collection_rate_percentage` decimal(43,2)
,`recovery_actions_count` bigint(21)
,`post_maturity_actions_count` bigint(21)
,`latest_recovery_action` varchar(21)
,`latest_recovery_action_date` date
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`loan_officer_email` varchar(100)
,`loan_officer_phone` varchar(15)
,`loan_type_name` varchar(100)
,`loan_type_category` enum('loan','guarantee','finance')
,`urgency_level` varchar(9)
,`recovery_priority_score` int(5)
,`weeks_past_maturity` bigint(12)
,`months_past_maturity_approx` bigint(12)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_past_maturity_day_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_past_maturity_day_summary` (
`days_past_maturity` int(7)
,`loans_count` bigint(21)
,`total_outstanding` decimal(37,2)
,`avg_outstanding` decimal(19,6)
,`total_penalty_interest` decimal(47,2)
,`avg_collection_rate` decimal(47,6)
,`loans_without_actions` decimal(22,0)
,`loans_with_no_payments` decimal(22,0)
,`affected_branches` bigint(21)
,`affected_officers` bigint(21)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_past_maturity_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_past_maturity_summary` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`loan_account` varchar(30)
,`client_id` int(11)
,`disbursed_amount` decimal(15,2)
,`disbursement_date` datetime
,`maturity_date` date
,`loan_status` enum('pending','under_review','approved','disbursed','active','completed','defaulted','rejected','written_off')
,`branch` varchar(100)
,`loan_officer_id` int(11)
,`loan_term_months` int(11)
,`interest_rate` decimal(5,2)
,`interest_rate_method` enum('flat','reducing_balance','compound')
,`repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly')
,`installment_amount` decimal(15,2)
,`total_installments` int(11)
,`installments_paid` int(11)
,`installments_outstanding` int(11)
,`installments_in_arrears` int(11)
,`loan_balance` decimal(15,2)
,`principal_balance` decimal(15,2)
,`interest_balance` decimal(15,2)
,`arrears_principal` decimal(15,2)
,`arrears_interest` decimal(15,2)
,`loan_type` int(11)
,`performance_class` enum('performing','watch','substandard','doubtful','loss')
,`days_in_arrears` int(11)
,`arrears_start_date` date
,`collateral_type` enum('immovable_assets','movable_assets','guarantor','none')
,`collateral_value` decimal(15,2)
,`economic_sector` enum('agriculture','manufacturing','trade','services','transport','construction','education','health','other')
,`loan_purpose` text
,`client_number` varchar(20)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`mobile` varchar(15)
,`email` varchar(100)
,`client_status` enum('active','inactive','suspended','pending_approval')
,`days_past_maturity` int(7)
,`days_since_disbursement` int(7)
,`original_loan_duration_days` int(7)
,`total_payments_made` bigint(21)
,`total_amount_paid` decimal(37,2)
,`amount_paid_after_maturity` decimal(37,2)
,`payments_made_after_maturity` bigint(21)
,`last_payment_date` date
,`current_outstanding_balance` decimal(15,2)
,`outstanding_principal` decimal(15,2)
,`overdue_category` varchar(18)
,`estimated_penalty_interest` decimal(25,2)
,`collection_rate_percentage` decimal(43,2)
,`recovery_actions_count` bigint(21)
,`post_maturity_actions_count` bigint(21)
,`latest_recovery_action` varchar(21)
,`latest_recovery_action_date` date
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`loan_officer_email` varchar(100)
,`loan_officer_phone` varchar(15)
,`loan_type_name` varchar(100)
,`loan_type_category` enum('loan','guarantee','finance')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_principal_outstanding_by_branch`
-- (See below for the actual view)
--
CREATE TABLE `v_principal_outstanding_by_branch` (
`branch` varchar(100)
,`loans_count` bigint(21)
,`total_principal_disbursed` decimal(37,2)
,`total_principal_recovered` decimal(59,2)
,`total_principal_outstanding` decimal(37,2)
,`avg_recovery_percentage` decimal(47,6)
,`on_track_count` decimal(22,0)
,`critically_behind_count` decimal(22,0)
,`critical_risk_amount` decimal(37,2)
,`high_risk_amount` decimal(37,2)
,`total_due_today` decimal(48,2)
,`total_paid_today` decimal(59,2)
,`total_variance` decimal(60,2)
,`officers_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_principal_outstanding_by_officer`
-- (See below for the actual view)
--
CREATE TABLE `v_principal_outstanding_by_officer` (
`loan_officer_id` int(11)
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`branch` varchar(100)
,`loans_count` bigint(21)
,`total_principal_disbursed` decimal(37,2)
,`total_principal_recovered` decimal(59,2)
,`total_principal_outstanding` decimal(37,2)
,`avg_recovery_percentage` decimal(47,6)
,`on_track_count` decimal(22,0)
,`critically_behind_count` decimal(22,0)
,`critical_risk_amount` decimal(37,2)
,`total_due_today` decimal(48,2)
,`total_paid_today` decimal(59,2)
,`total_variance` decimal(60,2)
,`avg_payment_compliance` decimal(47,6)
,`no_payment_loans` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_principal_outstanding_detailed`
-- (See below for the actual view)
--
CREATE TABLE `v_principal_outstanding_detailed` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`loan_account` varchar(30)
,`client_id` int(11)
,`client_name` varchar(201)
,`client_number` varchar(20)
,`client_mobile` varchar(15)
,`client_email` varchar(100)
,`released_amount` decimal(15,2)
,`release_date` datetime
,`maturity_date` date
,`loan_status` enum('pending','under_review','approved','disbursed','active','completed','defaulted','rejected','written_off')
,`loan_term_months` int(11)
,`installment_amount` decimal(15,2)
,`total_installments` int(11)
,`installments_paid` int(11)
,`repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly')
,`principal_amount` decimal(15,2)
,`principal_balance` decimal(15,2)
,`principal_paid` decimal(37,2)
,`principal_due_till_today` decimal(26,2)
,`principal_paid_till_today` decimal(37,2)
,`principal_balance_till_today` decimal(27,2)
,`total_payments_count` bigint(21)
,`total_amount_paid` decimal(37,2)
,`total_interest_paid` decimal(37,2)
,`total_fees_paid` decimal(37,2)
,`total_penalty_paid` decimal(37,2)
,`last_payment_date` date
,`last_payment_amount` decimal(15,2)
,`last_payment_principal` decimal(15,2)
,`branch` varchar(100)
,`loan_officer_id` int(11)
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`loan_officer_phone` varchar(15)
,`loan_type_name` varchar(100)
,`performance_class` enum('performing','watch','substandard','doubtful','loss')
,`days_in_arrears` int(11)
,`arrears_principal` decimal(15,2)
,`arrears_interest` decimal(15,2)
,`disbursement_date` datetime
,`first_payment_date` date
,`application_date` datetime
,`approval_date` datetime
,`status_category` varchar(13)
,`principal_recovery_percentage` decimal(43,2)
,`days_since_disbursement` int(7)
,`days_from_maturity` int(7)
,`current_loan_balance` decimal(15,2)
,`current_interest_balance` decimal(15,2)
,`principal_variance` decimal(38,2)
,`principal_performance_status` varchar(20)
,`risk_category` varchar(13)
,`payment_compliance_percentage` decimal(43,2)
,`monthly_principal_installment` decimal(16,2)
,`payment_pattern` varchar(18)
,`outstanding_ratio_percentage` decimal(21,2)
,`days_since_last_payment` int(7)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_principal_outstanding_stats`
-- (See below for the actual view)
--
CREATE TABLE `v_principal_outstanding_stats` (
`total_loans` bigint(21)
,`total_principal_disbursed` decimal(37,2)
,`total_principal_recovered` decimal(59,2)
,`total_principal_outstanding` decimal(37,2)
,`avg_recovery_percentage` decimal(47,6)
,`active_loans` decimal(22,0)
,`past_maturity_loans` decimal(22,0)
,`arrears_loans` decimal(22,0)
,`completed_loans` decimal(22,0)
,`defaulted_loans` decimal(22,0)
,`low_risk_amount` decimal(37,2)
,`medium_risk_amount` decimal(37,2)
,`high_risk_amount` decimal(37,2)
,`critical_risk_amount` decimal(37,2)
,`on_track_loans` decimal(22,0)
,`slightly_behind_loans` decimal(22,0)
,`moderately_behind_loans` decimal(22,0)
,`significantly_behind_loans` decimal(22,0)
,`critically_behind_loans` decimal(22,0)
,`total_principal_due_till_today` decimal(48,2)
,`total_principal_paid_till_today` decimal(59,2)
,`total_principal_balance_till_today` decimal(49,2)
,`total_principal_variance` decimal(60,2)
,`total_payments_received` decimal(59,2)
,`total_interest_collected` decimal(59,2)
,`total_fees_collected` decimal(59,2)
,`total_penalties_collected` decimal(59,2)
,`total_branches` bigint(21)
,`total_officers` bigint(21)
,`avg_principal_outstanding` decimal(19,6)
,`avg_payment_compliance` decimal(47,6)
,`avg_days_since_disbursement` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_principal_outstanding_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_principal_outstanding_summary` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`loan_account` varchar(30)
,`client_id` int(11)
,`client_name` varchar(201)
,`client_number` varchar(20)
,`client_mobile` varchar(15)
,`client_email` varchar(100)
,`released_amount` decimal(15,2)
,`release_date` datetime
,`maturity_date` date
,`loan_status` enum('pending','under_review','approved','disbursed','active','completed','defaulted','rejected','written_off')
,`loan_term_months` int(11)
,`installment_amount` decimal(15,2)
,`total_installments` int(11)
,`installments_paid` int(11)
,`repayment_frequency` enum('daily','weekly','bi_weekly','monthly','quarterly')
,`principal_amount` decimal(15,2)
,`principal_balance` decimal(15,2)
,`principal_paid` decimal(37,2)
,`principal_due_till_today` decimal(26,2)
,`principal_paid_till_today` decimal(37,2)
,`principal_balance_till_today` decimal(27,2)
,`total_payments_count` bigint(21)
,`total_amount_paid` decimal(37,2)
,`total_interest_paid` decimal(37,2)
,`total_fees_paid` decimal(37,2)
,`total_penalty_paid` decimal(37,2)
,`last_payment_date` date
,`last_payment_amount` decimal(15,2)
,`last_payment_principal` decimal(15,2)
,`branch` varchar(100)
,`loan_officer_id` int(11)
,`loan_officer_name` varchar(101)
,`loan_officer_employee_id` varchar(20)
,`loan_officer_phone` varchar(15)
,`loan_type_name` varchar(100)
,`performance_class` enum('performing','watch','substandard','doubtful','loss')
,`days_in_arrears` int(11)
,`arrears_principal` decimal(15,2)
,`arrears_interest` decimal(15,2)
,`disbursement_date` datetime
,`first_payment_date` date
,`application_date` datetime
,`approval_date` datetime
,`status_category` varchar(13)
,`principal_recovery_percentage` decimal(43,2)
,`days_since_disbursement` int(7)
,`days_from_maturity` int(7)
,`current_loan_balance` decimal(15,2)
,`current_interest_balance` decimal(15,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_recovery_priority_queue`
-- (See below for the actual view)
--
CREATE TABLE `v_recovery_priority_queue` (
`loan_id` int(11)
,`loan_number` varchar(20)
,`client_name` varchar(201)
,`client_mobile` varchar(15)
,`disbursed_amount` decimal(15,2)
,`days_since_disbursement` int(7)
,`estimated_interest_loss` decimal(25,2)
,`risk_category` varchar(9)
,`loan_officer_name` varchar(101)
,`loan_officer_phone` varchar(15)
,`branch` varchar(100)
,`recovery_actions_count` bigint(21)
,`latest_recovery_action` varchar(21)
,`latest_recovery_action_date` date
,`priority_score` int(6)
,`recommended_action` varchar(22)
);

-- --------------------------------------------------------

--
-- Structure for view `v_daily_no_repayment_dashboard`
--
DROP TABLE IF EXISTS `v_daily_no_repayment_dashboard`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_daily_no_repayment_dashboard`  AS SELECT (select count(0) from `v_loans_no_payments`) AS `total_loans_no_payment`, (select sum(`v_loans_no_payments`.`disbursed_amount`) from `v_loans_no_payments`) AS `total_amount_at_risk`, (select sum(`v_loans_no_payments`.`estimated_interest_loss`) from `v_loans_no_payments`) AS `total_estimated_loss`, (select count(0) from `v_loans_no_payments` where `v_loans_no_payments`.`risk_category` = 'CRITICAL') AS `critical_loans`, (select count(0) from `v_loans_no_payments` where `v_loans_no_payments`.`risk_category` = 'HIGH') AS `high_risk_loans`, (select sum(`v_loans_no_payments`.`disbursed_amount`) from `v_loans_no_payments` where `v_loans_no_payments`.`risk_category` = 'CRITICAL') AS `critical_amount`, (select count(0) from `v_loans_no_payments` where `v_loans_no_payments`.`days_since_disbursement` <= 7) AS `new_loans_no_payment`, (select count(0) from `v_loans_no_payments` where `v_loans_no_payments`.`risk_category` in ('CRITICAL','HIGH') and `v_loans_no_payments`.`recovery_actions_count` = 0) AS `urgent_action_required`, (select `v_no_repayment_by_branch`.`branch` from `v_no_repayment_by_branch` order by `v_no_repayment_by_branch`.`critical_risk_count` desc limit 1) AS `worst_performing_branch`, (select `v_no_repayment_by_officer`.`loan_officer_name` from `v_no_repayment_by_officer` order by `v_no_repayment_by_officer`.`critical_risk_count` desc limit 1) AS `officer_most_issues`, (select avg(`v_loans_no_payments`.`days_since_disbursement`) from `v_loans_no_payments`) AS `avg_days_since_disbursement`, curdate() AS `report_date` ;

-- --------------------------------------------------------

--
-- Structure for view `v_loans_no_payments`
--
DROP TABLE IF EXISTS `v_loans_no_payments`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_loans_no_payments`  AS SELECT `v_no_repayment_summary`.`loan_id` AS `loan_id`, `v_no_repayment_summary`.`loan_number` AS `loan_number`, `v_no_repayment_summary`.`loan_account` AS `loan_account`, `v_no_repayment_summary`.`client_id` AS `client_id`, concat(`v_no_repayment_summary`.`first_name`,' ',`v_no_repayment_summary`.`last_name`) AS `client_name`, `v_no_repayment_summary`.`mobile` AS `client_mobile`, `v_no_repayment_summary`.`email` AS `client_email`, `v_no_repayment_summary`.`disbursed_amount` AS `disbursed_amount`, `v_no_repayment_summary`.`disbursement_date` AS `disbursement_date`, `v_no_repayment_summary`.`maturity_date` AS `maturity_date`, `v_no_repayment_summary`.`days_since_disbursement` AS `days_since_disbursement`, `v_no_repayment_summary`.`days_since_last_payment` AS `days_since_last_payment`, `v_no_repayment_summary`.`risk_category` AS `risk_category`, `v_no_repayment_summary`.`total_payments_made` AS `total_payments_made`, `v_no_repayment_summary`.`total_amount_paid` AS `total_amount_paid`, `v_no_repayment_summary`.`expected_payments_by_now` AS `expected_payments_by_now`, `v_no_repayment_summary`.`missed_payments_count` AS `missed_payments_count`, `v_no_repayment_summary`.`expected_amount_by_now` AS `expected_amount_by_now`, `v_no_repayment_summary`.`estimated_interest_loss` AS `estimated_interest_loss`, `v_no_repayment_summary`.`recovery_actions_count` AS `recovery_actions_count`, `v_no_repayment_summary`.`pending_actions_count` AS `pending_actions_count`, `v_no_repayment_summary`.`latest_recovery_action` AS `latest_recovery_action`, `v_no_repayment_summary`.`latest_recovery_action_date` AS `latest_recovery_action_date`, `v_no_repayment_summary`.`active_fraud_flags` AS `active_fraud_flags`, `v_no_repayment_summary`.`loan_officer_name` AS `loan_officer_name`, `v_no_repayment_summary`.`loan_officer_phone` AS `loan_officer_phone`, `v_no_repayment_summary`.`branch` AS `branch`, `v_no_repayment_summary`.`loan_type_name` AS `loan_type_name`, `v_no_repayment_summary`.`installment_amount` AS `installment_amount`, `v_no_repayment_summary`.`repayment_frequency` AS `repayment_frequency`, `v_no_repayment_summary`.`performance_class` AS `performance_class`, `v_no_repayment_summary`.`interest_rate` AS `interest_rate`, `v_no_repayment_summary`.`loan_type` AS `loan_type` FROM `v_no_repayment_summary` WHERE `v_no_repayment_summary`.`total_payments_made` = 0 ORDER BY CASE `v_no_repayment_summary`.`risk_category` WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 ELSE 5 END ASC, `v_no_repayment_summary`.`days_since_disbursement` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_no_repayment_by_branch`
--
DROP TABLE IF EXISTS `v_no_repayment_by_branch`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_no_repayment_by_branch`  AS SELECT coalesce(`v_no_repayment_summary`.`branch`,'Unassigned') AS `branch`, count(0) AS `loans_count`, sum(`v_no_repayment_summary`.`disbursed_amount`) AS `total_amount`, avg(`v_no_repayment_summary`.`disbursed_amount`) AS `avg_loan_amount`, avg(`v_no_repayment_summary`.`days_since_disbursement`) AS `avg_days_since_disbursement`, sum(case when `v_no_repayment_summary`.`risk_category` = 'LOW' then 1 else 0 end) AS `low_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'MEDIUM' then 1 else 0 end) AS `medium_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'HIGH' then 1 else 0 end) AS `high_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then 1 else 0 end) AS `critical_risk_count`, sum(`v_no_repayment_summary`.`estimated_interest_loss`) AS `total_estimated_loss`, sum(`v_no_repayment_summary`.`expected_amount_by_now`) AS `total_expected_amount`, sum(`v_no_repayment_summary`.`recovery_actions_count`) AS `total_recovery_actions`, count(distinct `v_no_repayment_summary`.`loan_officer_id`) AS `officers_count`, sum(case when `v_no_repayment_summary`.`performance_class` = 'performing' then 1 else 0 end) AS `performing_count`, sum(case when `v_no_repayment_summary`.`performance_class` in ('watch','substandard','doubtful','loss') then 1 else 0 end) AS `non_performing_count` FROM `v_no_repayment_summary` WHERE `v_no_repayment_summary`.`total_payments_made` = 0 GROUP BY coalesce(`v_no_repayment_summary`.`branch`,'Unassigned') ORDER BY sum(`v_no_repayment_summary`.`disbursed_amount`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_no_repayment_by_officer`
--
DROP TABLE IF EXISTS `v_no_repayment_by_officer`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_no_repayment_by_officer`  AS SELECT `v_no_repayment_summary`.`loan_officer_id` AS `loan_officer_id`, coalesce(`v_no_repayment_summary`.`loan_officer_name`,'Unassigned') AS `loan_officer_name`, `v_no_repayment_summary`.`loan_officer_employee_id` AS `loan_officer_employee_id`, coalesce(`v_no_repayment_summary`.`branch`,'Unassigned') AS `branch`, count(0) AS `loans_count`, sum(`v_no_repayment_summary`.`disbursed_amount`) AS `total_amount`, avg(`v_no_repayment_summary`.`disbursed_amount`) AS `avg_loan_amount`, avg(`v_no_repayment_summary`.`days_since_disbursement`) AS `avg_days_since_disbursement`, sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then 1 else 0 end) AS `critical_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'HIGH' then 1 else 0 end) AS `high_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'MEDIUM' then 1 else 0 end) AS `medium_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'LOW' then 1 else 0 end) AS `low_risk_count`, sum(`v_no_repayment_summary`.`estimated_interest_loss`) AS `total_estimated_loss`, sum(`v_no_repayment_summary`.`expected_amount_by_now`) AS `total_expected_amount`, sum(`v_no_repayment_summary`.`recovery_actions_count`) AS `total_recovery_actions`, sum(case when `v_no_repayment_summary`.`recovery_actions_count` = 0 then 1 else 0 end) AS `loans_without_actions`, round(sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then 1 else 0 end) * 100.0 / count(0),2) AS `critical_risk_percentage`, round(sum(case when `v_no_repayment_summary`.`recovery_actions_count` > 0 then 1 else 0 end) * 100.0 / count(0),2) AS `action_taken_percentage` FROM `v_no_repayment_summary` WHERE `v_no_repayment_summary`.`total_payments_made` = 0 GROUP BY `v_no_repayment_summary`.`loan_officer_id`, `v_no_repayment_summary`.`loan_officer_name`, `v_no_repayment_summary`.`loan_officer_employee_id`, `v_no_repayment_summary`.`branch` ORDER BY sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then 1 else 0 end) DESC, sum(`v_no_repayment_summary`.`disbursed_amount`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_no_repayment_contact_list`
--
DROP TABLE IF EXISTS `v_no_repayment_contact_list`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_no_repayment_contact_list`  AS SELECT `v_loans_no_payments`.`loan_id` AS `loan_id`, `v_loans_no_payments`.`loan_number` AS `loan_number`, `v_loans_no_payments`.`client_name` AS `client_name`, `v_loans_no_payments`.`client_mobile` AS `client_mobile`, `v_loans_no_payments`.`client_email` AS `client_email`, `v_loans_no_payments`.`disbursed_amount` AS `disbursed_amount`, `v_loans_no_payments`.`days_since_disbursement` AS `days_since_disbursement`, `v_loans_no_payments`.`risk_category` AS `risk_category`, `v_loans_no_payments`.`estimated_interest_loss` AS `estimated_interest_loss`, `v_loans_no_payments`.`loan_officer_name` AS `loan_officer_name`, `v_loans_no_payments`.`loan_officer_phone` AS `loan_officer_phone`, `v_loans_no_payments`.`branch` AS `branch`, `v_loans_no_payments`.`recovery_actions_count` AS `recovery_actions_count`, `v_loans_no_payments`.`latest_recovery_action` AS `latest_recovery_action`, `v_loans_no_payments`.`latest_recovery_action_date` AS `latest_recovery_action_date`, CASE WHEN `v_loans_no_payments`.`risk_category` = 'CRITICAL' AND `v_loans_no_payments`.`recovery_actions_count` = 0 THEN 'URGENT - IMMEDIATE CONTACT' WHEN `v_loans_no_payments`.`risk_category` = 'HIGH' AND `v_loans_no_payments`.`recovery_actions_count` = 0 THEN 'HIGH - CONTACT TODAY' WHEN `v_loans_no_payments`.`risk_category` = 'CRITICAL' THEN 'URGENT - FOLLOW UP' WHEN `v_loans_no_payments`.`risk_category` = 'HIGH' THEN 'HIGH - FOLLOW UP' WHEN `v_loans_no_payments`.`risk_category` = 'MEDIUM' THEN 'MEDIUM - SCHEDULE CONTACT' ELSE 'LOW - MONITOR' END AS `contact_priority`, CASE WHEN `v_loans_no_payments`.`latest_recovery_action_date` is not null THEN to_days(curdate()) - to_days(`v_loans_no_payments`.`latest_recovery_action_date`) ELSE `v_loans_no_payments`.`days_since_disbursement` END AS `days_since_last_action` FROM `v_loans_no_payments` WHERE `v_loans_no_payments`.`client_mobile` is not null ORDER BY CASE `v_loans_no_payments`.`risk_category` WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END ASC, `v_loans_no_payments`.`recovery_actions_count` ASC, `v_loans_no_payments`.`disbursed_amount` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_no_repayment_management_report`
--
DROP TABLE IF EXISTS `v_no_repayment_management_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_no_repayment_management_report`  AS SELECT 'Last 30 Days' AS `period_name`, (select count(0) from `v_loans_no_payments` where `v_loans_no_payments`.`days_since_disbursement` <= 30) AS `loans_count`, (select sum(`v_loans_no_payments`.`disbursed_amount`) from `v_loans_no_payments` where `v_loans_no_payments`.`days_since_disbursement` <= 30) AS `total_amount`, (select sum(`v_loans_no_payments`.`estimated_interest_loss`) from `v_loans_no_payments` where `v_loans_no_payments`.`days_since_disbursement` <= 30) AS `estimated_loss` ;

-- --------------------------------------------------------

--
-- Structure for view `v_no_repayment_stats`
--
DROP TABLE IF EXISTS `v_no_repayment_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_no_repayment_stats`  AS SELECT count(0) AS `total_loans_no_payment`, sum(`v_no_repayment_summary`.`disbursed_amount`) AS `total_amount_at_risk`, avg(`v_no_repayment_summary`.`disbursed_amount`) AS `avg_loan_amount`, avg(`v_no_repayment_summary`.`days_since_disbursement`) AS `avg_days_since_disbursement`, min(`v_no_repayment_summary`.`days_since_disbursement`) AS `min_days_since_disbursement`, max(`v_no_repayment_summary`.`days_since_disbursement`) AS `max_days_since_disbursement`, sum(case when `v_no_repayment_summary`.`risk_category` = 'LOW' then 1 else 0 end) AS `low_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'MEDIUM' then 1 else 0 end) AS `medium_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'HIGH' then 1 else 0 end) AS `high_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then 1 else 0 end) AS `critical_risk_count`, sum(case when `v_no_repayment_summary`.`risk_category` = 'LOW' then `v_no_repayment_summary`.`disbursed_amount` else 0 end) AS `low_risk_amount`, sum(case when `v_no_repayment_summary`.`risk_category` = 'MEDIUM' then `v_no_repayment_summary`.`disbursed_amount` else 0 end) AS `medium_risk_amount`, sum(case when `v_no_repayment_summary`.`risk_category` = 'HIGH' then `v_no_repayment_summary`.`disbursed_amount` else 0 end) AS `high_risk_amount`, sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then `v_no_repayment_summary`.`disbursed_amount` else 0 end) AS `critical_risk_amount`, round(sum(case when `v_no_repayment_summary`.`risk_category` = 'LOW' then 1 else 0 end) * 100.0 / count(0),2) AS `low_risk_percentage`, round(sum(case when `v_no_repayment_summary`.`risk_category` = 'MEDIUM' then 1 else 0 end) * 100.0 / count(0),2) AS `medium_risk_percentage`, round(sum(case when `v_no_repayment_summary`.`risk_category` = 'HIGH' then 1 else 0 end) * 100.0 / count(0),2) AS `high_risk_percentage`, round(sum(case when `v_no_repayment_summary`.`risk_category` = 'CRITICAL' then 1 else 0 end) * 100.0 / count(0),2) AS `critical_risk_percentage`, sum(`v_no_repayment_summary`.`recovery_actions_count`) AS `total_recovery_actions`, sum(case when `v_no_repayment_summary`.`recovery_actions_count` > 0 then 1 else 0 end) AS `loans_with_recovery_actions`, sum(`v_no_repayment_summary`.`pending_actions_count`) AS `total_pending_actions`, CASE WHEN count(0) > 0 THEN avg(`v_no_repayment_summary`.`recovery_actions_count`) ELSE 0 END AS `avg_recovery_actions_per_loan`, sum(`v_no_repayment_summary`.`active_fraud_flags`) AS `total_fraud_flags`, sum(case when `v_no_repayment_summary`.`active_fraud_flags` > 0 then 1 else 0 end) AS `loans_with_fraud_flags`, sum(`v_no_repayment_summary`.`estimated_interest_loss`) AS `total_estimated_interest_loss`, CASE WHEN count(0) > 0 THEN avg(`v_no_repayment_summary`.`estimated_interest_loss`) ELSE 0 END AS `avg_estimated_interest_loss`, sum(`v_no_repayment_summary`.`expected_amount_by_now`) AS `total_expected_amount`, count(distinct `v_no_repayment_summary`.`branch`) AS `affected_branches`, count(distinct `v_no_repayment_summary`.`loan_officer_id`) AS `affected_officers`, count(distinct `v_no_repayment_summary`.`loan_type`) AS `affected_loan_types`, sum(case when `v_no_repayment_summary`.`performance_class` = 'performing' then 1 else 0 end) AS `performing_count`, sum(case when `v_no_repayment_summary`.`performance_class` = 'watch' then 1 else 0 end) AS `watch_count`, sum(case when `v_no_repayment_summary`.`performance_class` = 'substandard' then 1 else 0 end) AS `substandard_count`, sum(case when `v_no_repayment_summary`.`performance_class` = 'doubtful' then 1 else 0 end) AS `doubtful_count`, sum(case when `v_no_repayment_summary`.`performance_class` = 'loss' then 1 else 0 end) AS `loss_count` FROM `v_no_repayment_summary` WHERE `v_no_repayment_summary`.`total_payments_made` = 0 ;

-- --------------------------------------------------------

--
-- Structure for view `v_no_repayment_summary`
--
DROP TABLE IF EXISTS `v_no_repayment_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_no_repayment_summary`  AS SELECT `l`.`id` AS `loan_id`, `l`.`loan_number` AS `loan_number`, `l`.`loan_account` AS `loan_account`, `l`.`client_id` AS `client_id`, `l`.`disbursed_amount` AS `disbursed_amount`, `l`.`disbursement_date` AS `disbursement_date`, `l`.`maturity_date` AS `maturity_date`, `l`.`status` AS `loan_status`, `l`.`branch` AS `branch`, `l`.`loan_officer_id` AS `loan_officer_id`, `l`.`loan_term_months` AS `loan_term_months`, `l`.`interest_rate` AS `interest_rate`, `l`.`repayment_frequency` AS `repayment_frequency`, `l`.`installment_amount` AS `installment_amount`, `l`.`total_installments` AS `total_installments`, `l`.`loan_type` AS `loan_type`, `l`.`performance_class` AS `performance_class`, `l`.`days_in_arrears` AS `days_in_arrears`, `l`.`arrears_start_date` AS `arrears_start_date`, `l`.`collateral_type` AS `collateral_type`, `l`.`collateral_value` AS `collateral_value`, `c`.`client_number` AS `client_number`, `c`.`first_name` AS `first_name`, `c`.`last_name` AS `last_name`, `c`.`mobile` AS `mobile`, `c`.`email` AS `email`, `c`.`status` AS `client_status`, to_days(curdate()) - to_days(`l`.`disbursement_date`) AS `days_since_disbursement`, CASE WHEN `l`.`maturity_date` is not null THEN to_days(`l`.`maturity_date`) - to_days(curdate()) ELSE NULL END AS `days_to_maturity`, coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_payments_made`, coalesce((select sum(`lp`.`amount`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_amount_paid`, (select max(`lp`.`payment_date`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed') AS `last_payment_date`, CASE WHEN (select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` AND `lp`.`payment_status` = 'confirmed') = 0 THEN to_days(curdate()) - to_days(`l`.`disbursement_date`) ELSE to_days(curdate()) - to_days((select max(`lp`.`payment_date`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed')) END AS `days_since_last_payment`, CASE WHEN `l`.`repayment_frequency` = 'monthly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 30)) WHEN `l`.`repayment_frequency` = 'weekly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 7)) WHEN `l`.`repayment_frequency` = 'bi_weekly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 14)) WHEN `l`.`repayment_frequency` = 'quarterly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 90)) WHEN `l`.`repayment_frequency` = 'daily' THEN greatest(0,to_days(curdate()) - to_days(`l`.`disbursement_date`)) ELSE 0 END AS `expected_payments_by_now`, greatest(0,case when `l`.`repayment_frequency` = 'monthly' then greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 30)) when `l`.`repayment_frequency` = 'weekly' then greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 7)) when `l`.`repayment_frequency` = 'bi_weekly' then greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 14)) when `l`.`repayment_frequency` = 'quarterly' then greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 90)) when `l`.`repayment_frequency` = 'daily' then greatest(0,to_days(curdate()) - to_days(`l`.`disbursement_date`)) else 0 end - coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0)) AS `missed_payments_count`, CASE WHEN to_days(curdate()) - to_days(`l`.`disbursement_date`) <= 30 AND coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` AND `lp`.`payment_status` = 'confirmed'),0) = 0 THEN 'LOW' WHEN to_days(curdate()) - to_days(`l`.`disbursement_date`) between 31 and 90 AND coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` AND `lp`.`payment_status` = 'confirmed'),0) = 0 THEN 'MEDIUM' WHEN to_days(curdate()) - to_days(`l`.`disbursement_date`) between 91 and 180 AND coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` AND `lp`.`payment_status` = 'confirmed'),0) = 0 THEN 'HIGH' WHEN to_days(curdate()) - to_days(`l`.`disbursement_date`) > 180 AND coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` AND `lp`.`payment_status` = 'confirmed'),0) = 0 THEN 'CRITICAL' ELSE 'MONITORED' END AS `risk_category`, CASE WHEN `l`.`interest_rate` is not null AND `l`.`disbursed_amount` is not null THEN round(`l`.`disbursed_amount` * `l`.`interest_rate` / 100 / 12 * ((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 30),2) ELSE 0 END AS `estimated_interest_loss`, CASE WHEN `l`.`installment_amount` is not null THEN `l`.`installment_amount`* CASE WHEN `l`.`repayment_frequency` = 'monthly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 30)) WHEN `l`.`repayment_frequency` = 'weekly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 7)) WHEN `l`.`repayment_frequency` = 'bi_weekly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 14)) WHEN `l`.`repayment_frequency` = 'quarterly' THEN greatest(0,floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 90)) ELSE 0 END ELSE 0 END AS `expected_amount_by_now`, coalesce((select count(0) from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id`),0) AS `recovery_actions_count`, coalesce((select count(0) from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` and `lra`.`status` = 'completed'),0) AS `completed_actions_count`, coalesce((select count(0) from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` and `lra`.`status` in ('planned','in_progress')),0) AS `pending_actions_count`, (select `lra`.`action_type` from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` order by `lra`.`created_at` desc limit 1) AS `latest_recovery_action`, (select `lra`.`action_date` from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` order by `lra`.`created_at` desc limit 1) AS `latest_recovery_action_date`, (select `lra`.`status` from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` order by `lra`.`created_at` desc limit 1) AS `latest_recovery_action_status`, coalesce((select count(0) from `loan_fraud_flags` `lff` where `lff`.`loan_id` = `l`.`id` and `lff`.`status` not in ('dismissed','resolved')),0) AS `active_fraud_flags`, (select `lff`.`severity` from `loan_fraud_flags` `lff` where `lff`.`loan_id` = `l`.`id` and `lff`.`status` not in ('dismissed','resolved') order by `lff`.`created_at` desc limit 1) AS `highest_fraud_severity`, concat(coalesce(`u`.`first_name`,''),' ',coalesce(`u`.`last_name`,'')) AS `loan_officer_name`, `u`.`employee_id` AS `loan_officer_employee_id`, `u`.`email` AS `loan_officer_email`, `u`.`mobile` AS `loan_officer_phone`, `lt`.`name` AS `loan_type_name`, `lt`.`category` AS `loan_type_category` FROM (((`loans` `l` join `clients` `c` on(`l`.`client_id` = `c`.`id`)) left join `users` `u` on(`l`.`loan_officer_id` = `u`.`id`)) left join `loan_types` `lt` on(`l`.`loan_type` = `lt`.`id`)) WHERE `l`.`status` in ('disbursed','active') AND `l`.`disbursement_date` is not null AND `l`.`disbursed_amount` > 0 ;

-- --------------------------------------------------------

--
-- Structure for view `v_past_maturity_by_branch`
--
DROP TABLE IF EXISTS `v_past_maturity_by_branch`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_past_maturity_by_branch`  AS SELECT coalesce(`v_past_maturity_day_analysis`.`branch`,'Unassigned') AS `branch`, count(0) AS `loans_count`, sum(`v_past_maturity_day_analysis`.`current_outstanding_balance`) AS `total_outstanding`, avg(`v_past_maturity_day_analysis`.`current_outstanding_balance`) AS `avg_outstanding`, avg(`v_past_maturity_day_analysis`.`days_past_maturity`) AS `avg_days_past_maturity`, sum(case when `v_past_maturity_day_analysis`.`overdue_category` = 'EXTREMELY_OVERDUE' then 1 else 0 end) AS `extremely_overdue_count`, sum(case when `v_past_maturity_day_analysis`.`overdue_category` = 'CRITICALLY_OVERDUE' then 1 else 0 end) AS `critically_overdue_count`, sum(`v_past_maturity_day_analysis`.`estimated_penalty_interest`) AS `total_penalty_interest`, avg(`v_past_maturity_day_analysis`.`collection_rate_percentage`) AS `avg_collection_rate`, sum(`v_past_maturity_day_analysis`.`recovery_actions_count`) AS `total_recovery_actions`, sum(`v_past_maturity_day_analysis`.`post_maturity_actions_count`) AS `total_post_maturity_actions`, count(distinct `v_past_maturity_day_analysis`.`loan_officer_id`) AS `officers_count` FROM `v_past_maturity_day_analysis` GROUP BY coalesce(`v_past_maturity_day_analysis`.`branch`,'Unassigned') ORDER BY sum(`v_past_maturity_day_analysis`.`current_outstanding_balance`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_past_maturity_by_officer`
--
DROP TABLE IF EXISTS `v_past_maturity_by_officer`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_past_maturity_by_officer`  AS SELECT `v_past_maturity_day_analysis`.`loan_officer_id` AS `loan_officer_id`, coalesce(`v_past_maturity_day_analysis`.`loan_officer_name`,'Unassigned') AS `loan_officer_name`, `v_past_maturity_day_analysis`.`loan_officer_employee_id` AS `loan_officer_employee_id`, coalesce(`v_past_maturity_day_analysis`.`branch`,'Unassigned') AS `branch`, count(0) AS `loans_count`, sum(`v_past_maturity_day_analysis`.`current_outstanding_balance`) AS `total_outstanding`, avg(`v_past_maturity_day_analysis`.`days_past_maturity`) AS `avg_days_past_maturity`, sum(case when `v_past_maturity_day_analysis`.`overdue_category` = 'EXTREMELY_OVERDUE' then 1 else 0 end) AS `extremely_overdue_count`, sum(case when `v_past_maturity_day_analysis`.`overdue_category` = 'CRITICALLY_OVERDUE' then 1 else 0 end) AS `critically_overdue_count`, sum(`v_past_maturity_day_analysis`.`estimated_penalty_interest`) AS `total_penalty_interest`, avg(`v_past_maturity_day_analysis`.`collection_rate_percentage`) AS `avg_collection_rate`, sum(`v_past_maturity_day_analysis`.`recovery_actions_count`) AS `total_recovery_actions`, sum(`v_past_maturity_day_analysis`.`post_maturity_actions_count`) AS `total_post_maturity_actions`, sum(case when `v_past_maturity_day_analysis`.`post_maturity_actions_count` = 0 then 1 else 0 end) AS `loans_without_post_maturity_actions` FROM `v_past_maturity_day_analysis` GROUP BY `v_past_maturity_day_analysis`.`loan_officer_id`, `v_past_maturity_day_analysis`.`loan_officer_name`, `v_past_maturity_day_analysis`.`loan_officer_employee_id`, `v_past_maturity_day_analysis`.`branch` ORDER BY sum(case when `v_past_maturity_day_analysis`.`overdue_category` = 'EXTREMELY_OVERDUE' then 1 else 0 end) DESC, sum(`v_past_maturity_day_analysis`.`current_outstanding_balance`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_past_maturity_day_analysis`
--
DROP TABLE IF EXISTS `v_past_maturity_day_analysis`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_past_maturity_day_analysis`  AS SELECT `v_past_maturity_summary`.`loan_id` AS `loan_id`, `v_past_maturity_summary`.`loan_number` AS `loan_number`, `v_past_maturity_summary`.`loan_account` AS `loan_account`, `v_past_maturity_summary`.`client_id` AS `client_id`, `v_past_maturity_summary`.`disbursed_amount` AS `disbursed_amount`, `v_past_maturity_summary`.`disbursement_date` AS `disbursement_date`, `v_past_maturity_summary`.`maturity_date` AS `maturity_date`, `v_past_maturity_summary`.`loan_status` AS `loan_status`, `v_past_maturity_summary`.`branch` AS `branch`, `v_past_maturity_summary`.`loan_officer_id` AS `loan_officer_id`, `v_past_maturity_summary`.`loan_term_months` AS `loan_term_months`, `v_past_maturity_summary`.`interest_rate` AS `interest_rate`, `v_past_maturity_summary`.`interest_rate_method` AS `interest_rate_method`, `v_past_maturity_summary`.`repayment_frequency` AS `repayment_frequency`, `v_past_maturity_summary`.`installment_amount` AS `installment_amount`, `v_past_maturity_summary`.`total_installments` AS `total_installments`, `v_past_maturity_summary`.`installments_paid` AS `installments_paid`, `v_past_maturity_summary`.`installments_outstanding` AS `installments_outstanding`, `v_past_maturity_summary`.`installments_in_arrears` AS `installments_in_arrears`, `v_past_maturity_summary`.`loan_balance` AS `loan_balance`, `v_past_maturity_summary`.`principal_balance` AS `principal_balance`, `v_past_maturity_summary`.`interest_balance` AS `interest_balance`, `v_past_maturity_summary`.`arrears_principal` AS `arrears_principal`, `v_past_maturity_summary`.`arrears_interest` AS `arrears_interest`, `v_past_maturity_summary`.`loan_type` AS `loan_type`, `v_past_maturity_summary`.`performance_class` AS `performance_class`, `v_past_maturity_summary`.`days_in_arrears` AS `days_in_arrears`, `v_past_maturity_summary`.`arrears_start_date` AS `arrears_start_date`, `v_past_maturity_summary`.`collateral_type` AS `collateral_type`, `v_past_maturity_summary`.`collateral_value` AS `collateral_value`, `v_past_maturity_summary`.`economic_sector` AS `economic_sector`, `v_past_maturity_summary`.`loan_purpose` AS `loan_purpose`, `v_past_maturity_summary`.`client_number` AS `client_number`, `v_past_maturity_summary`.`first_name` AS `first_name`, `v_past_maturity_summary`.`last_name` AS `last_name`, `v_past_maturity_summary`.`mobile` AS `mobile`, `v_past_maturity_summary`.`email` AS `email`, `v_past_maturity_summary`.`client_status` AS `client_status`, `v_past_maturity_summary`.`days_past_maturity` AS `days_past_maturity`, `v_past_maturity_summary`.`days_since_disbursement` AS `days_since_disbursement`, `v_past_maturity_summary`.`original_loan_duration_days` AS `original_loan_duration_days`, `v_past_maturity_summary`.`total_payments_made` AS `total_payments_made`, `v_past_maturity_summary`.`total_amount_paid` AS `total_amount_paid`, `v_past_maturity_summary`.`amount_paid_after_maturity` AS `amount_paid_after_maturity`, `v_past_maturity_summary`.`payments_made_after_maturity` AS `payments_made_after_maturity`, `v_past_maturity_summary`.`last_payment_date` AS `last_payment_date`, `v_past_maturity_summary`.`current_outstanding_balance` AS `current_outstanding_balance`, `v_past_maturity_summary`.`outstanding_principal` AS `outstanding_principal`, `v_past_maturity_summary`.`overdue_category` AS `overdue_category`, `v_past_maturity_summary`.`estimated_penalty_interest` AS `estimated_penalty_interest`, `v_past_maturity_summary`.`collection_rate_percentage` AS `collection_rate_percentage`, `v_past_maturity_summary`.`recovery_actions_count` AS `recovery_actions_count`, `v_past_maturity_summary`.`post_maturity_actions_count` AS `post_maturity_actions_count`, `v_past_maturity_summary`.`latest_recovery_action` AS `latest_recovery_action`, `v_past_maturity_summary`.`latest_recovery_action_date` AS `latest_recovery_action_date`, `v_past_maturity_summary`.`loan_officer_name` AS `loan_officer_name`, `v_past_maturity_summary`.`loan_officer_employee_id` AS `loan_officer_employee_id`, `v_past_maturity_summary`.`loan_officer_email` AS `loan_officer_email`, `v_past_maturity_summary`.`loan_officer_phone` AS `loan_officer_phone`, `v_past_maturity_summary`.`loan_type_name` AS `loan_type_name`, `v_past_maturity_summary`.`loan_type_category` AS `loan_type_category`, CASE WHEN `v_past_maturity_summary`.`days_past_maturity` <= 7 THEN 'IMMEDIATE' WHEN `v_past_maturity_summary`.`days_past_maturity` <= 30 THEN 'URGENT' WHEN `v_past_maturity_summary`.`days_past_maturity` <= 90 THEN 'HIGH' WHEN `v_past_maturity_summary`.`days_past_maturity` <= 180 THEN 'MEDIUM' ELSE 'LOW' END AS `urgency_level`, CASE WHEN `v_past_maturity_summary`.`overdue_category` = 'EXTREMELY_OVERDUE' THEN 100 WHEN `v_past_maturity_summary`.`overdue_category` = 'CRITICALLY_OVERDUE' THEN 80 WHEN `v_past_maturity_summary`.`overdue_category` = 'SERIOUSLY_OVERDUE' THEN 60 WHEN `v_past_maturity_summary`.`overdue_category` = 'MODERATE_OVERDUE' THEN 40 WHEN `v_past_maturity_summary`.`overdue_category` = 'RECENTLY_MATURED' THEN 20 ELSE 10 END FROM `v_past_maturity_summary` ;

-- --------------------------------------------------------

--
-- Structure for view `v_past_maturity_day_summary`
--
DROP TABLE IF EXISTS `v_past_maturity_day_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_past_maturity_day_summary`  AS SELECT `v_past_maturity_day_analysis`.`days_past_maturity` AS `days_past_maturity`, count(0) AS `loans_count`, sum(`v_past_maturity_day_analysis`.`current_outstanding_balance`) AS `total_outstanding`, avg(`v_past_maturity_day_analysis`.`current_outstanding_balance`) AS `avg_outstanding`, sum(`v_past_maturity_day_analysis`.`estimated_penalty_interest`) AS `total_penalty_interest`, avg(`v_past_maturity_day_analysis`.`collection_rate_percentage`) AS `avg_collection_rate`, sum(case when `v_past_maturity_day_analysis`.`post_maturity_actions_count` = 0 then 1 else 0 end) AS `loans_without_actions`, sum(case when `v_past_maturity_day_analysis`.`total_payments_made` = 0 then 1 else 0 end) AS `loans_with_no_payments`, count(distinct `v_past_maturity_day_analysis`.`branch`) AS `affected_branches`, count(distinct `v_past_maturity_day_analysis`.`loan_officer_id`) AS `affected_officers` FROM `v_past_maturity_day_analysis` GROUP BY `v_past_maturity_day_analysis`.`days_past_maturity` ORDER BY `v_past_maturity_day_analysis`.`days_past_maturity` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_past_maturity_summary`
--
DROP TABLE IF EXISTS `v_past_maturity_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_past_maturity_summary`  AS SELECT `l`.`id` AS `loan_id`, `l`.`loan_number` AS `loan_number`, `l`.`loan_account` AS `loan_account`, `l`.`client_id` AS `client_id`, `l`.`disbursed_amount` AS `disbursed_amount`, `l`.`disbursement_date` AS `disbursement_date`, `l`.`maturity_date` AS `maturity_date`, `l`.`status` AS `loan_status`, `l`.`branch` AS `branch`, `l`.`loan_officer_id` AS `loan_officer_id`, `l`.`loan_term_months` AS `loan_term_months`, `l`.`interest_rate` AS `interest_rate`, `l`.`interest_rate_method` AS `interest_rate_method`, `l`.`repayment_frequency` AS `repayment_frequency`, `l`.`installment_amount` AS `installment_amount`, `l`.`total_installments` AS `total_installments`, `l`.`installments_paid` AS `installments_paid`, `l`.`installments_outstanding` AS `installments_outstanding`, `l`.`installments_in_arrears` AS `installments_in_arrears`, `l`.`loan_balance` AS `loan_balance`, `l`.`principal_balance` AS `principal_balance`, `l`.`interest_balance` AS `interest_balance`, `l`.`arrears_principal` AS `arrears_principal`, `l`.`arrears_interest` AS `arrears_interest`, `l`.`loan_type` AS `loan_type`, `l`.`performance_class` AS `performance_class`, `l`.`days_in_arrears` AS `days_in_arrears`, `l`.`arrears_start_date` AS `arrears_start_date`, `l`.`collateral_type` AS `collateral_type`, `l`.`collateral_value` AS `collateral_value`, `l`.`economic_sector` AS `economic_sector`, `l`.`loan_purpose` AS `loan_purpose`, `c`.`client_number` AS `client_number`, `c`.`first_name` AS `first_name`, `c`.`last_name` AS `last_name`, `c`.`mobile` AS `mobile`, `c`.`email` AS `email`, `c`.`status` AS `client_status`, to_days(curdate()) - to_days(`l`.`maturity_date`) AS `days_past_maturity`, to_days(curdate()) - to_days(`l`.`disbursement_date`) AS `days_since_disbursement`, to_days(`l`.`maturity_date`) - to_days(`l`.`disbursement_date`) AS `original_loan_duration_days`, coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_payments_made`, coalesce((select sum(`lp`.`amount`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_amount_paid`, coalesce((select sum(`lp`.`amount`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed' and `lp`.`payment_date` > `l`.`maturity_date`),0) AS `amount_paid_after_maturity`, coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed' and `lp`.`payment_date` > `l`.`maturity_date`),0) AS `payments_made_after_maturity`, (select max(`lp`.`payment_date`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed') AS `last_payment_date`, coalesce(`l`.`loan_balance`,`l`.`disbursed_amount`) AS `current_outstanding_balance`, coalesce(`l`.`principal_balance`,`l`.`disbursed_amount`) AS `outstanding_principal`, CASE WHEN to_days(curdate()) - to_days(`l`.`maturity_date`) <= 30 THEN 'RECENTLY_MATURED' WHEN to_days(curdate()) - to_days(`l`.`maturity_date`) between 31 and 90 THEN 'MODERATE_OVERDUE' WHEN to_days(curdate()) - to_days(`l`.`maturity_date`) between 91 and 180 THEN 'SERIOUSLY_OVERDUE' WHEN to_days(curdate()) - to_days(`l`.`maturity_date`) between 181 and 365 THEN 'CRITICALLY_OVERDUE' WHEN to_days(curdate()) - to_days(`l`.`maturity_date`) > 365 THEN 'EXTREMELY_OVERDUE' ELSE 'UNKNOWN' END AS `overdue_category`, CASE WHEN `l`.`interest_rate` is not null AND `l`.`disbursed_amount` is not null THEN round(coalesce(`l`.`loan_balance`,`l`.`disbursed_amount`) * `l`.`interest_rate` / 100 / 365 * (to_days(curdate()) - to_days(`l`.`maturity_date`)),2) ELSE 0 END AS `estimated_penalty_interest`, CASE WHEN `l`.`disbursed_amount` > 0 THEN round(coalesce((select sum(`lp`.`amount`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) * 100.0 / `l`.`disbursed_amount`,2) ELSE 0 END AS `collection_rate_percentage`, coalesce((select count(0) from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id`),0) AS `recovery_actions_count`, coalesce((select count(0) from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` and `lra`.`action_date` > `l`.`maturity_date`),0) AS `post_maturity_actions_count`, (select `lra`.`action_type` from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` order by `lra`.`created_at` desc limit 1) AS `latest_recovery_action`, (select `lra`.`action_date` from `loan_recovery_actions` `lra` where `lra`.`loan_id` = `l`.`id` order by `lra`.`created_at` desc limit 1) AS `latest_recovery_action_date`, concat(coalesce(`u`.`first_name`,''),' ',coalesce(`u`.`last_name`,'')) AS `loan_officer_name`, `u`.`employee_id` AS `loan_officer_employee_id`, `u`.`email` AS `loan_officer_email`, `u`.`mobile` AS `loan_officer_phone`, `lt`.`name` AS `loan_type_name`, `lt`.`category` AS `loan_type_category` FROM (((`loans` `l` join `clients` `c` on(`l`.`client_id` = `c`.`id`)) left join `users` `u` on(`l`.`loan_officer_id` = `u`.`id`)) left join `loan_types` `lt` on(`l`.`loan_type` = `lt`.`id`)) WHERE `l`.`maturity_date` is not null AND `l`.`maturity_date` < curdate() AND `l`.`status` in ('disbursed','active','defaulted') AND `l`.`disbursed_amount` > 0 ;

-- --------------------------------------------------------

--
-- Structure for view `v_principal_outstanding_by_branch`
--
DROP TABLE IF EXISTS `v_principal_outstanding_by_branch`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_principal_outstanding_by_branch`  AS SELECT coalesce(`v_principal_outstanding_detailed`.`branch`,'Unassigned') AS `branch`, count(0) AS `loans_count`, sum(`v_principal_outstanding_detailed`.`principal_amount`) AS `total_principal_disbursed`, sum(`v_principal_outstanding_detailed`.`principal_paid`) AS `total_principal_recovered`, sum(`v_principal_outstanding_detailed`.`principal_balance`) AS `total_principal_outstanding`, avg(`v_principal_outstanding_detailed`.`principal_recovery_percentage`) AS `avg_recovery_percentage`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'ON_TRACK' then 1 else 0 end) AS `on_track_count`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'CRITICALLY_BEHIND' then 1 else 0 end) AS `critically_behind_count`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'CRITICAL_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `critical_risk_amount`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'HIGH_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `high_risk_amount`, sum(`v_principal_outstanding_detailed`.`principal_due_till_today`) AS `total_due_today`, sum(`v_principal_outstanding_detailed`.`principal_paid_till_today`) AS `total_paid_today`, sum(`v_principal_outstanding_detailed`.`principal_variance`) AS `total_variance`, count(distinct `v_principal_outstanding_detailed`.`loan_officer_id`) AS `officers_count` FROM `v_principal_outstanding_detailed` GROUP BY coalesce(`v_principal_outstanding_detailed`.`branch`,'Unassigned') ORDER BY sum(`v_principal_outstanding_detailed`.`principal_balance`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_principal_outstanding_by_officer`
--
DROP TABLE IF EXISTS `v_principal_outstanding_by_officer`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_principal_outstanding_by_officer`  AS SELECT `v_principal_outstanding_detailed`.`loan_officer_id` AS `loan_officer_id`, coalesce(`v_principal_outstanding_detailed`.`loan_officer_name`,'Unassigned') AS `loan_officer_name`, `v_principal_outstanding_detailed`.`loan_officer_employee_id` AS `loan_officer_employee_id`, coalesce(`v_principal_outstanding_detailed`.`branch`,'Unassigned') AS `branch`, count(0) AS `loans_count`, sum(`v_principal_outstanding_detailed`.`principal_amount`) AS `total_principal_disbursed`, sum(`v_principal_outstanding_detailed`.`principal_paid`) AS `total_principal_recovered`, sum(`v_principal_outstanding_detailed`.`principal_balance`) AS `total_principal_outstanding`, avg(`v_principal_outstanding_detailed`.`principal_recovery_percentage`) AS `avg_recovery_percentage`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'ON_TRACK' then 1 else 0 end) AS `on_track_count`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'CRITICALLY_BEHIND' then 1 else 0 end) AS `critically_behind_count`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'CRITICAL_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `critical_risk_amount`, sum(`v_principal_outstanding_detailed`.`principal_due_till_today`) AS `total_due_today`, sum(`v_principal_outstanding_detailed`.`principal_paid_till_today`) AS `total_paid_today`, sum(`v_principal_outstanding_detailed`.`principal_variance`) AS `total_variance`, avg(`v_principal_outstanding_detailed`.`payment_compliance_percentage`) AS `avg_payment_compliance`, sum(case when `v_principal_outstanding_detailed`.`payment_pattern` = 'NO_PAYMENTS' then 1 else 0 end) AS `no_payment_loans` FROM `v_principal_outstanding_detailed` GROUP BY `v_principal_outstanding_detailed`.`loan_officer_id`, `v_principal_outstanding_detailed`.`loan_officer_name`, `v_principal_outstanding_detailed`.`loan_officer_employee_id`, `v_principal_outstanding_detailed`.`branch` ORDER BY sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'CRITICALLY_BEHIND' then 1 else 0 end) DESC, sum(`v_principal_outstanding_detailed`.`principal_balance`) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_principal_outstanding_detailed`
--
DROP TABLE IF EXISTS `v_principal_outstanding_detailed`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_principal_outstanding_detailed`  AS SELECT `v_principal_outstanding_summary`.`loan_id` AS `loan_id`, `v_principal_outstanding_summary`.`loan_number` AS `loan_number`, `v_principal_outstanding_summary`.`loan_account` AS `loan_account`, `v_principal_outstanding_summary`.`client_id` AS `client_id`, `v_principal_outstanding_summary`.`client_name` AS `client_name`, `v_principal_outstanding_summary`.`client_number` AS `client_number`, `v_principal_outstanding_summary`.`client_mobile` AS `client_mobile`, `v_principal_outstanding_summary`.`client_email` AS `client_email`, `v_principal_outstanding_summary`.`released_amount` AS `released_amount`, `v_principal_outstanding_summary`.`release_date` AS `release_date`, `v_principal_outstanding_summary`.`maturity_date` AS `maturity_date`, `v_principal_outstanding_summary`.`loan_status` AS `loan_status`, `v_principal_outstanding_summary`.`loan_term_months` AS `loan_term_months`, `v_principal_outstanding_summary`.`installment_amount` AS `installment_amount`, `v_principal_outstanding_summary`.`total_installments` AS `total_installments`, `v_principal_outstanding_summary`.`installments_paid` AS `installments_paid`, `v_principal_outstanding_summary`.`repayment_frequency` AS `repayment_frequency`, `v_principal_outstanding_summary`.`principal_amount` AS `principal_amount`, `v_principal_outstanding_summary`.`principal_balance` AS `principal_balance`, `v_principal_outstanding_summary`.`principal_paid` AS `principal_paid`, `v_principal_outstanding_summary`.`principal_due_till_today` AS `principal_due_till_today`, `v_principal_outstanding_summary`.`principal_paid_till_today` AS `principal_paid_till_today`, `v_principal_outstanding_summary`.`principal_balance_till_today` AS `principal_balance_till_today`, `v_principal_outstanding_summary`.`total_payments_count` AS `total_payments_count`, `v_principal_outstanding_summary`.`total_amount_paid` AS `total_amount_paid`, `v_principal_outstanding_summary`.`total_interest_paid` AS `total_interest_paid`, `v_principal_outstanding_summary`.`total_fees_paid` AS `total_fees_paid`, `v_principal_outstanding_summary`.`total_penalty_paid` AS `total_penalty_paid`, `v_principal_outstanding_summary`.`last_payment_date` AS `last_payment_date`, `v_principal_outstanding_summary`.`last_payment_amount` AS `last_payment_amount`, `v_principal_outstanding_summary`.`last_payment_principal` AS `last_payment_principal`, `v_principal_outstanding_summary`.`branch` AS `branch`, `v_principal_outstanding_summary`.`loan_officer_id` AS `loan_officer_id`, `v_principal_outstanding_summary`.`loan_officer_name` AS `loan_officer_name`, `v_principal_outstanding_summary`.`loan_officer_employee_id` AS `loan_officer_employee_id`, `v_principal_outstanding_summary`.`loan_officer_phone` AS `loan_officer_phone`, `v_principal_outstanding_summary`.`loan_type_name` AS `loan_type_name`, `v_principal_outstanding_summary`.`performance_class` AS `performance_class`, `v_principal_outstanding_summary`.`days_in_arrears` AS `days_in_arrears`, `v_principal_outstanding_summary`.`arrears_principal` AS `arrears_principal`, `v_principal_outstanding_summary`.`arrears_interest` AS `arrears_interest`, `v_principal_outstanding_summary`.`disbursement_date` AS `disbursement_date`, `v_principal_outstanding_summary`.`first_payment_date` AS `first_payment_date`, `v_principal_outstanding_summary`.`application_date` AS `application_date`, `v_principal_outstanding_summary`.`approval_date` AS `approval_date`, `v_principal_outstanding_summary`.`status_category` AS `status_category`, `v_principal_outstanding_summary`.`principal_recovery_percentage` AS `principal_recovery_percentage`, `v_principal_outstanding_summary`.`days_since_disbursement` AS `days_since_disbursement`, `v_principal_outstanding_summary`.`days_from_maturity` AS `days_from_maturity`, `v_principal_outstanding_summary`.`current_loan_balance` AS `current_loan_balance`, `v_principal_outstanding_summary`.`current_interest_balance` AS `current_interest_balance`, `v_principal_outstanding_summary`.`principal_due_till_today`- `v_principal_outstanding_summary`.`principal_paid_till_today` AS `principal_variance`, CASE WHEN `v_principal_outstanding_summary`.`principal_paid_till_today` >= `v_principal_outstanding_summary`.`principal_due_till_today` THEN 'ON_TRACK' WHEN `v_principal_outstanding_summary`.`principal_due_till_today` = 0 THEN 'NO_PAYMENT_DUE' WHEN `v_principal_outstanding_summary`.`principal_due_till_today` - `v_principal_outstanding_summary`.`principal_paid_till_today` <= `v_principal_outstanding_summary`.`principal_due_till_today` * 0.1 THEN 'SLIGHTLY_BEHIND' WHEN `v_principal_outstanding_summary`.`principal_due_till_today` - `v_principal_outstanding_summary`.`principal_paid_till_today` <= `v_principal_outstanding_summary`.`principal_due_till_today` * 0.25 THEN 'MODERATELY_BEHIND' WHEN `v_principal_outstanding_summary`.`principal_due_till_today` - `v_principal_outstanding_summary`.`principal_paid_till_today` <= `v_principal_outstanding_summary`.`principal_due_till_today` * 0.5 THEN 'SIGNIFICANTLY_BEHIND' ELSE 'CRITICALLY_BEHIND' END AS `principal_performance_status`, CASE WHEN `v_principal_outstanding_summary`.`status_category` in ('COMPLETED','WRITTEN_OFF') THEN 'CLOSED' WHEN `v_principal_outstanding_summary`.`principal_balance` <= 0 THEN 'FULLY_PAID' WHEN `v_principal_outstanding_summary`.`principal_balance` <= 10000 THEN 'LOW_RISK' WHEN `v_principal_outstanding_summary`.`principal_balance` <= 50000 THEN 'MEDIUM_RISK' WHEN `v_principal_outstanding_summary`.`principal_balance` <= 200000 THEN 'HIGH_RISK' ELSE 'CRITICAL_RISK' END AS `risk_category`, CASE WHEN `v_principal_outstanding_summary`.`principal_due_till_today` > 0 THEN round(`v_principal_outstanding_summary`.`principal_paid_till_today` / `v_principal_outstanding_summary`.`principal_due_till_today` * 100,2) ELSE 100 END AS `payment_compliance_percentage`, CASE WHEN `v_principal_outstanding_summary`.`total_installments` > 0 THEN round(`v_principal_outstanding_summary`.`principal_amount` / `v_principal_outstanding_summary`.`total_installments`,2) ELSE 0 END AS `monthly_principal_installment`, CASE WHEN `v_principal_outstanding_summary`.`total_payments_count` = 0 THEN 'NO_PAYMENTS' WHEN `v_principal_outstanding_summary`.`total_payments_count` < `v_principal_outstanding_summary`.`installments_paid` + 1 THEN 'IRREGULAR_PAYMENTS' WHEN `v_principal_outstanding_summary`.`total_payments_count` = `v_principal_outstanding_summary`.`installments_paid` THEN 'REGULAR_PAYMENTS' ELSE 'EXCESS_PAYMENTS' END AS `payment_pattern`, CASE WHEN `v_principal_outstanding_summary`.`principal_amount` > 0 THEN round(`v_principal_outstanding_summary`.`principal_balance` / `v_principal_outstanding_summary`.`principal_amount` * 100,2) ELSE 0 END AS `outstanding_ratio_percentage`, CASE WHEN `v_principal_outstanding_summary`.`last_payment_date` is not null THEN to_days(curdate()) - to_days(`v_principal_outstanding_summary`.`last_payment_date`) ELSE NULL END AS `days_since_last_payment` FROM `v_principal_outstanding_summary` ;

-- --------------------------------------------------------

--
-- Structure for view `v_principal_outstanding_stats`
--
DROP TABLE IF EXISTS `v_principal_outstanding_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_principal_outstanding_stats`  AS SELECT count(0) AS `total_loans`, sum(`v_principal_outstanding_detailed`.`principal_amount`) AS `total_principal_disbursed`, sum(`v_principal_outstanding_detailed`.`principal_paid`) AS `total_principal_recovered`, sum(`v_principal_outstanding_detailed`.`principal_balance`) AS `total_principal_outstanding`, avg(`v_principal_outstanding_detailed`.`principal_recovery_percentage`) AS `avg_recovery_percentage`, sum(case when `v_principal_outstanding_detailed`.`status_category` = 'ACTIVE' then 1 else 0 end) AS `active_loans`, sum(case when `v_principal_outstanding_detailed`.`status_category` = 'PAST_MATURITY' then 1 else 0 end) AS `past_maturity_loans`, sum(case when `v_principal_outstanding_detailed`.`status_category` = 'IN_ARREARS' then 1 else 0 end) AS `arrears_loans`, sum(case when `v_principal_outstanding_detailed`.`status_category` = 'COMPLETED' then 1 else 0 end) AS `completed_loans`, sum(case when `v_principal_outstanding_detailed`.`status_category` = 'DEFAULTED' then 1 else 0 end) AS `defaulted_loans`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'LOW_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `low_risk_amount`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'MEDIUM_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `medium_risk_amount`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'HIGH_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `high_risk_amount`, sum(case when `v_principal_outstanding_detailed`.`risk_category` = 'CRITICAL_RISK' then `v_principal_outstanding_detailed`.`principal_balance` else 0 end) AS `critical_risk_amount`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'ON_TRACK' then 1 else 0 end) AS `on_track_loans`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'SLIGHTLY_BEHIND' then 1 else 0 end) AS `slightly_behind_loans`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'MODERATELY_BEHIND' then 1 else 0 end) AS `moderately_behind_loans`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'SIGNIFICANTLY_BEHIND' then 1 else 0 end) AS `significantly_behind_loans`, sum(case when `v_principal_outstanding_detailed`.`principal_performance_status` = 'CRITICALLY_BEHIND' then 1 else 0 end) AS `critically_behind_loans`, sum(`v_principal_outstanding_detailed`.`principal_due_till_today`) AS `total_principal_due_till_today`, sum(`v_principal_outstanding_detailed`.`principal_paid_till_today`) AS `total_principal_paid_till_today`, sum(`v_principal_outstanding_detailed`.`principal_balance_till_today`) AS `total_principal_balance_till_today`, sum(`v_principal_outstanding_detailed`.`principal_variance`) AS `total_principal_variance`, sum(`v_principal_outstanding_detailed`.`total_amount_paid`) AS `total_payments_received`, sum(`v_principal_outstanding_detailed`.`total_interest_paid`) AS `total_interest_collected`, sum(`v_principal_outstanding_detailed`.`total_fees_paid`) AS `total_fees_collected`, sum(`v_principal_outstanding_detailed`.`total_penalty_paid`) AS `total_penalties_collected`, count(distinct `v_principal_outstanding_detailed`.`branch`) AS `total_branches`, count(distinct `v_principal_outstanding_detailed`.`loan_officer_id`) AS `total_officers`, avg(`v_principal_outstanding_detailed`.`principal_balance`) AS `avg_principal_outstanding`, avg(`v_principal_outstanding_detailed`.`payment_compliance_percentage`) AS `avg_payment_compliance`, avg(`v_principal_outstanding_detailed`.`days_since_disbursement`) AS `avg_days_since_disbursement` FROM `v_principal_outstanding_detailed` ;

-- --------------------------------------------------------

--
-- Structure for view `v_principal_outstanding_summary`
--
DROP TABLE IF EXISTS `v_principal_outstanding_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_principal_outstanding_summary`  AS SELECT `l`.`id` AS `loan_id`, `l`.`loan_number` AS `loan_number`, `l`.`loan_account` AS `loan_account`, `l`.`client_id` AS `client_id`, concat(`c`.`first_name`,' ',`c`.`last_name`) AS `client_name`, `c`.`client_number` AS `client_number`, `c`.`mobile` AS `client_mobile`, `c`.`email` AS `client_email`, `l`.`disbursed_amount` AS `released_amount`, `l`.`disbursement_date` AS `release_date`, `l`.`maturity_date` AS `maturity_date`, `l`.`status` AS `loan_status`, `l`.`loan_term_months` AS `loan_term_months`, `l`.`installment_amount` AS `installment_amount`, `l`.`total_installments` AS `total_installments`, `l`.`installments_paid` AS `installments_paid`, `l`.`repayment_frequency` AS `repayment_frequency`, `l`.`disbursed_amount` AS `principal_amount`, coalesce(`l`.`principal_balance`,`l`.`disbursed_amount`) AS `principal_balance`, coalesce((select sum(coalesce(`lp`.`principal_amount`,0)) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `principal_paid`, CASE WHEN `l`.`maturity_date` is null OR `l`.`disbursement_date` is null THEN 0 WHEN curdate() >= `l`.`maturity_date` THEN `l`.`disbursed_amount` WHEN `l`.`total_installments` > 0 AND `l`.`disbursement_date` is not null THEN round(`l`.`disbursed_amount` / `l`.`total_installments` * least(floor(case when `l`.`repayment_frequency` = 'daily' then to_days(curdate()) - to_days(`l`.`disbursement_date`) when `l`.`repayment_frequency` = 'weekly' then floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 7) when `l`.`repayment_frequency` = 'bi_weekly' then floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 14) when `l`.`repayment_frequency` = 'monthly' then period_diff(date_format(curdate(),'%Y%m'),date_format(`l`.`disbursement_date`,'%Y%m')) when `l`.`repayment_frequency` = 'quarterly' then floor(period_diff(date_format(curdate(),'%Y%m'),date_format(`l`.`disbursement_date`,'%Y%m')) / 3) else 0 end),`l`.`total_installments`),2) ELSE 0 END AS `principal_due_till_today`, coalesce((select sum(coalesce(`lp`.`principal_amount`,0)) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed' and `lp`.`payment_date` <= curdate()),0) AS `principal_paid_till_today`, CASE WHEN `l`.`maturity_date` is null OR `l`.`disbursement_date` is null THEN coalesce(`l`.`principal_balance`,`l`.`disbursed_amount`) WHEN curdate() >= `l`.`maturity_date` THEN coalesce(`l`.`principal_balance`,`l`.`disbursed_amount`) WHEN `l`.`total_installments` > 0 AND `l`.`disbursement_date` is not null THEN greatest(`l`.`disbursed_amount` - round(`l`.`disbursed_amount` / `l`.`total_installments` * least(floor(case when `l`.`repayment_frequency` = 'daily' then to_days(curdate()) - to_days(`l`.`disbursement_date`) when `l`.`repayment_frequency` = 'weekly' then floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 7) when `l`.`repayment_frequency` = 'bi_weekly' then floor((to_days(curdate()) - to_days(`l`.`disbursement_date`)) / 14) when `l`.`repayment_frequency` = 'monthly' then period_diff(date_format(curdate(),'%Y%m'),date_format(`l`.`disbursement_date`,'%Y%m')) when `l`.`repayment_frequency` = 'quarterly' then floor(period_diff(date_format(curdate(),'%Y%m'),date_format(`l`.`disbursement_date`,'%Y%m')) / 3) else 0 end),`l`.`total_installments`),2),0) ELSE coalesce(`l`.`principal_balance`,`l`.`disbursed_amount`) END AS `principal_balance_till_today`, coalesce((select count(0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_payments_count`, coalesce((select sum(`lp`.`amount`) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_amount_paid`, coalesce((select sum(coalesce(`lp`.`interest_amount`,0)) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_interest_paid`, coalesce((select sum(coalesce(`lp`.`fees_amount`,0)) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_fees_paid`, coalesce((select sum(coalesce(`lp`.`penalty_amount`,0)) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) AS `total_penalty_paid`, (select `lp`.`payment_date` from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed' order by `lp`.`payment_date` desc,`lp`.`created_at` desc limit 1) AS `last_payment_date`, (select `lp`.`amount` from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed' order by `lp`.`payment_date` desc,`lp`.`created_at` desc limit 1) AS `last_payment_amount`, (select coalesce(`lp`.`principal_amount`,0) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed' order by `lp`.`payment_date` desc,`lp`.`created_at` desc limit 1) AS `last_payment_principal`, `l`.`branch` AS `branch`, `l`.`loan_officer_id` AS `loan_officer_id`, concat(coalesce(`u`.`first_name`,''),' ',coalesce(`u`.`last_name`,'')) AS `loan_officer_name`, `u`.`employee_id` AS `loan_officer_employee_id`, `u`.`mobile` AS `loan_officer_phone`, `lt`.`name` AS `loan_type_name`, `l`.`performance_class` AS `performance_class`, `l`.`days_in_arrears` AS `days_in_arrears`, `l`.`arrears_principal` AS `arrears_principal`, `l`.`arrears_interest` AS `arrears_interest`, `l`.`disbursement_date` AS `disbursement_date`, `l`.`first_payment_date` AS `first_payment_date`, `l`.`application_date` AS `application_date`, `l`.`approval_date` AS `approval_date`, CASE WHEN `l`.`status` = 'completed' THEN 'COMPLETED' WHEN `l`.`status` = 'defaulted' THEN 'DEFAULTED' WHEN `l`.`status` = 'written_off' THEN 'WRITTEN_OFF' WHEN `l`.`maturity_date` < curdate() THEN 'PAST_MATURITY' WHEN `l`.`days_in_arrears` > 0 THEN 'IN_ARREARS' WHEN `l`.`status` = 'active' THEN 'ACTIVE' WHEN `l`.`status` = 'disbursed' THEN 'DISBURSED' ELSE ucase(`l`.`status`) END AS `status_category`, CASE WHEN `l`.`disbursed_amount` > 0 THEN round(coalesce((select sum(coalesce(`lp`.`principal_amount`,0)) from `loan_payments` `lp` where `lp`.`loan_id` = `l`.`id` and `lp`.`payment_status` = 'confirmed'),0) * 100.0 / `l`.`disbursed_amount`,2) ELSE 0 END AS `principal_recovery_percentage`, to_days(curdate()) - to_days(`l`.`disbursement_date`) AS `days_since_disbursement`, CASE WHEN `l`.`maturity_date` is not null THEN to_days(curdate()) - to_days(`l`.`maturity_date`) ELSE NULL END AS `days_from_maturity`, `l`.`loan_balance` AS `current_loan_balance`, `l`.`interest_balance` AS `current_interest_balance` FROM (((`loans` `l` join `clients` `c` on(`l`.`client_id` = `c`.`id`)) left join `users` `u` on(`l`.`loan_officer_id` = `u`.`id`)) left join `loan_types` `lt` on(`l`.`loan_type` = `lt`.`id`)) WHERE `l`.`disbursed_amount` > 0 AND `l`.`status` in ('disbursed','active','completed','defaulted','past_due') ;

-- --------------------------------------------------------

--
-- Structure for view `v_recovery_priority_queue`
--
DROP TABLE IF EXISTS `v_recovery_priority_queue`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_recovery_priority_queue`  AS SELECT `v_loans_no_payments`.`loan_id` AS `loan_id`, `v_loans_no_payments`.`loan_number` AS `loan_number`, `v_loans_no_payments`.`client_name` AS `client_name`, `v_loans_no_payments`.`client_mobile` AS `client_mobile`, `v_loans_no_payments`.`disbursed_amount` AS `disbursed_amount`, `v_loans_no_payments`.`days_since_disbursement` AS `days_since_disbursement`, `v_loans_no_payments`.`estimated_interest_loss` AS `estimated_interest_loss`, `v_loans_no_payments`.`risk_category` AS `risk_category`, `v_loans_no_payments`.`loan_officer_name` AS `loan_officer_name`, `v_loans_no_payments`.`loan_officer_phone` AS `loan_officer_phone`, `v_loans_no_payments`.`branch` AS `branch`, `v_loans_no_payments`.`recovery_actions_count` AS `recovery_actions_count`, `v_loans_no_payments`.`latest_recovery_action` AS `latest_recovery_action`, `v_loans_no_payments`.`latest_recovery_action_date` AS `latest_recovery_action_date`, CASE WHEN `v_loans_no_payments`.`risk_category` = 'CRITICAL' THEN 100 WHEN `v_loans_no_payments`.`risk_category` = 'HIGH' THEN 75 WHEN `v_loans_no_payments`.`risk_category` = 'MEDIUM' THEN 50 WHEN `v_loans_no_payments`.`risk_category` = 'LOW' THEN 25 ELSE 10 END FROM `v_loans_no_payments` ORDER BY CASE WHEN `v_loans_no_payments`.`risk_category` = 'CRITICAL' THEN 100 WHEN `v_loans_no_payments`.`risk_category` = 'HIGH' THEN 75 WHEN `v_loans_no_payments`.`risk_category` = 'MEDIUM' THEN 50 WHEN `v_loans_no_payments`.`risk_category` = 'LOW' THEN 25 ELSE 10 END+ CASE WHEN `v_loans_no_payments`.`disbursed_amount` > 500000 THEN 30 WHEN `v_loans_no_payments`.`disbursed_amount` > 200000 THEN 20 WHEN `v_loans_no_payments`.`disbursed_amount` > 100000 THEN 10 ELSE 5 END+ CASE WHEN `v_loans_no_payments`.`days_since_disbursement` > 365 THEN 25 WHEN `v_loans_no_payments`.`days_since_disbursement` > 180 THEN 15 WHEN `v_loans_no_payments`.`days_since_disbursement` > 90 THEN 10 ELSE 5 END+ CASE WHEN `v_loans_no_payments`.`recovery_actions_count` = 0 THEN 20 WHEN `v_loans_no_payments`.`recovery_actions_count` < 3 THEN 10 ELSE 0 END DESC, `v_loans_no_payments`.`disbursed_amount` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_number` (`client_number`),
  ADD UNIQUE KEY `borrower_id` (`borrower_id`),
  ADD KEY `idx_client_number` (`client_number`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_mobile` (`mobile`),
  ADD KEY `idx_unique_number` (`unique_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `assigned_officer` (`assigned_officer`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_borrower_id` (`borrower_id`),
  ADD KEY `idx_marital_status` (`marital_status`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loan_number` (`loan_number`),
  ADD UNIQUE KEY `loan_account` (`loan_account`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `disbursed_by` (`disbursed_by`),
  ADD KEY `idx_loan_number` (`loan_number`),
  ADD KEY `idx_loan_account` (`loan_account`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_loan_type` (`loan_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_loan_officer_id` (`loan_officer_id`),
  ADD KEY `idx_performance_class` (`performance_class`),
  ADD KEY `idx_application_date` (`application_date`),
  ADD KEY `idx_maturity_date` (`maturity_date`),
  ADD KEY `idx_loans_performance` (`performance_class`,`status`);

--
-- Indexes for table `loan_audit_logs`
--
ALTER TABLE `loan_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_performed_by` (`performed_by`);

--
-- Indexes for table `loan_collateral`
--
ALTER TABLE `loan_collateral`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indexes for table `loan_comments`
--
ALTER TABLE `loan_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `loan_expenses`
--
ALTER TABLE `loan_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `loan_files`
--
ALTER TABLE `loan_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `loan_fraud_flags`
--
ALTER TABLE `loan_fraud_flags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_fraud_flags_loan_id` (`loan_id`),
  ADD KEY `idx_fraud_flags_severity` (`severity`),
  ADD KEY `idx_fraud_flags_status` (`status`),
  ADD KEY `idx_fraud_flags_reported_by` (`reported_by`),
  ADD KEY `idx_fraud_flags_investigated_by` (`investigated_by`);

--
-- Indexes for table `loan_other_income`
--
ALTER TABLE `loan_other_income`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_payment_ref` (`payment_reference`,`loan_id`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_loan_payments_loan_id` (`loan_id`),
  ADD KEY `idx_loan_payments_date` (`payment_date`),
  ADD KEY `idx_loan_payments_status` (`payment_status`),
  ADD KEY `idx_loan_payments_method` (`payment_method`),
  ADD KEY `idx_loan_payments_reference` (`payment_reference`),
  ADD KEY `idx_loan_payments_received_by` (`received_by`),
  ADD KEY `idx_loan_payments_amount` (`amount`);

--
-- Indexes for table `loan_payment_analysis_cache`
--
ALTER TABLE `loan_payment_analysis_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_analysis` (`loan_id`,`analysis_date`,`analysis_start_date`,`analysis_end_date`,`criteria`),
  ADD KEY `idx_payment_analysis_loan_id` (`loan_id`),
  ADD KEY `idx_payment_analysis_date` (`analysis_date`),
  ADD KEY `idx_payment_analysis_criteria` (`criteria`),
  ADD KEY `idx_payment_analysis_risk` (`risk_category`);

--
-- Indexes for table `loan_recovery_actions`
--
ALTER TABLE `loan_recovery_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_loan_recovery_loan_id` (`loan_id`),
  ADD KEY `idx_loan_recovery_assigned_to` (`assigned_to`),
  ADD KEY `idx_loan_recovery_action_date` (`action_date`),
  ADD KEY `idx_loan_recovery_status` (`status`),
  ADD KEY `idx_loan_recovery_priority` (`priority`),
  ADD KEY `idx_loan_recovery_outcome` (`outcome`),
  ADD KEY `idx_loan_recovery_target_date` (`target_date`),
  ADD KEY `idx_loan_recovery_created_by` (`created_by`);

--
-- Indexes for table `loan_restructures`
--
ALTER TABLE `loan_restructures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_loan_restructure_loan_id` (`loan_id`),
  ADD KEY `idx_loan_restructure_status` (`status`),
  ADD KEY `idx_loan_restructure_effective_date` (`effective_date`);

--
-- Indexes for table `loan_schedules`
--
ALTER TABLE `loan_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_loan_installment` (`loan_id`,`installment_number`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_installment_number` (`installment_number`),
  ADD KEY `idx_loan_schedules_overdue` (`due_date`,`status`);

--
-- Indexes for table `loan_types`
--
ALTER TABLE `loan_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `loan_types_code` (`code`),
  ADD UNIQUE KEY `loan_types_name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `code_5` (`code`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `code_6` (`code`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `code_7` (`code`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `code_8` (`code`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `code_9` (`code`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `code_10` (`code`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `code_11` (`code`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `code_12` (`code`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `code_13` (`code`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `code_14` (`code`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `code_15` (`code`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `code_16` (`code`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `code_17` (`code`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `code_18` (`code`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `code_19` (`code`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `code_20` (`code`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `code_21` (`code`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `code_22` (`code`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `code_23` (`code`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `code_24` (`code`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `code_25` (`code`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `code_26` (`code`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `code_27` (`code`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD KEY `loan_types_category` (`category`),
  ADD KEY `loan_types_is_active` (`is_active`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `loan_types_category_is_active` (`category`,`is_active`),
  ADD KEY `loan_types_is_active_is_visible_to_clients` (`is_active`,`is_visible_to_clients`);

--
-- Indexes for table `missed_repayment_followups`
--
ALTER TABLE `missed_repayment_followups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_schedule_followup` (`schedule_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_schedule_id` (`schedule_id`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_follow_up_date` (`follow_up_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `penalty_settings`
--
ALTER TABLE `penalty_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `repayments`
--
ALTER TABLE `repayments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_repayments_schedule_id` (`schedule_id`),
  ADD KEY `fk_repayments_received_by` (`received_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `employee_id_2` (`employee_id`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `users_email` (`email`),
  ADD UNIQUE KEY `users_employee_id` (`employee_id`),
  ADD UNIQUE KEY `employee_id_3` (`employee_id`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `employee_id_4` (`employee_id`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD KEY `users_role` (`role`),
  ADD KEY `users_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `loan_audit_logs`
--
ALTER TABLE `loan_audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_collateral`
--
ALTER TABLE `loan_collateral`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_comments`
--
ALTER TABLE `loan_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_expenses`
--
ALTER TABLE `loan_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_files`
--
ALTER TABLE `loan_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_fraud_flags`
--
ALTER TABLE `loan_fraud_flags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_other_income`
--
ALTER TABLE `loan_other_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_payments`
--
ALTER TABLE `loan_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_payment_analysis_cache`
--
ALTER TABLE `loan_payment_analysis_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_recovery_actions`
--
ALTER TABLE `loan_recovery_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_restructures`
--
ALTER TABLE `loan_restructures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_schedules`
--
ALTER TABLE `loan_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `loan_types`
--
ALTER TABLE `loan_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `missed_repayment_followups`
--
ALTER TABLE `missed_repayment_followups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `penalty_settings`
--
ALTER TABLE `penalty_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `repayments`
--
ALTER TABLE `repayments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`assigned_officer`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `clients_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`loan_type`) REFERENCES `loan_types` (`id`),
  ADD CONSTRAINT `loans_ibfk_3` FOREIGN KEY (`loan_officer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `loans_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `loans_ibfk_5` FOREIGN KEY (`disbursed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `loan_audit_logs`
--
ALTER TABLE `loan_audit_logs`
  ADD CONSTRAINT `loan_audit_logs_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_audit_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_collateral`
--
ALTER TABLE `loan_collateral`
  ADD CONSTRAINT `loan_collateral_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`);

--
-- Constraints for table `loan_comments`
--
ALTER TABLE `loan_comments`
  ADD CONSTRAINT `loan_comments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`),
  ADD CONSTRAINT `loan_comments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `loan_expenses`
--
ALTER TABLE `loan_expenses`
  ADD CONSTRAINT `loan_expenses_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`),
  ADD CONSTRAINT `loan_expenses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `loan_files`
--
ALTER TABLE `loan_files`
  ADD CONSTRAINT `loan_files_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`),
  ADD CONSTRAINT `loan_files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `loan_fraud_flags`
--
ALTER TABLE `loan_fraud_flags`
  ADD CONSTRAINT `loan_fraud_flags_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_fraud_flags_ibfk_2` FOREIGN KEY (`investigated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loan_fraud_flags_ibfk_3` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `loan_fraud_flags_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_other_income`
--
ALTER TABLE `loan_other_income`
  ADD CONSTRAINT `loan_other_income_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`),
  ADD CONSTRAINT `loan_other_income_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD CONSTRAINT `loan_payments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_payments_ibfk_2` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loan_payments_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loan_payments_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `loan_payments_ibfk_5` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_payment_analysis_cache`
--
ALTER TABLE `loan_payment_analysis_cache`
  ADD CONSTRAINT `loan_payment_analysis_cache_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_recovery_actions`
--
ALTER TABLE `loan_recovery_actions`
  ADD CONSTRAINT `loan_recovery_actions_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_recovery_actions_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loan_recovery_actions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `loan_recovery_actions_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_restructures`
--
ALTER TABLE `loan_restructures`
  ADD CONSTRAINT `loan_restructures_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_restructures_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loan_restructures_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_schedules`
--
ALTER TABLE `loan_schedules`
  ADD CONSTRAINT `fk_loan_schedules_loan_id` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_types`
--
ALTER TABLE `loan_types`
  ADD CONSTRAINT `loan_types_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `loan_types_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `missed_repayment_followups`
--
ALTER TABLE `missed_repayment_followups`
  ADD CONSTRAINT `missed_repayment_followups_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `loan_schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `missed_repayment_followups_ibfk_2` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `missed_repayment_followups_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `missed_repayment_followups_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `missed_repayment_followups_ibfk_5` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `repayments`
--
ALTER TABLE `repayments`
  ADD CONSTRAINT `fk_repayments_loan_id` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_repayments_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_repayments_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `loan_schedules` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
