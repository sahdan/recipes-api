-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 19, 2019 at 04:07 AM
-- Server version: 10.1.39-MariaDB
-- PHP Version: 7.1.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_resep`
--
CREATE DATABASE IF NOT EXISTS `db_resep` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `db_resep`;

-- --------------------------------------------------------

--
-- Table structure for table `t_rating`
--

DROP TABLE IF EXISTS `t_rating`;
CREATE TABLE `t_rating` (
  `username` varchar(255) NOT NULL,
  `resepId` int(11) NOT NULL,
  `rating` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `t_rating`
--

INSERT INTO `t_rating` (`username`, `resepId`, `rating`) VALUES
('contributor1', 1500001, 5),
('contributor1', 1500002, 4),
('admin1', 1500001, 4),
('admin1', 1500002, 3),
('contributor2', 1500003, 4);

-- --------------------------------------------------------

--
-- Table structure for table `t_resep`
--

DROP TABLE IF EXISTS `t_resep`;
CREATE TABLE `t_resep` (
  `id` int(11) NOT NULL,
  `servings` int(11) NOT NULL,
  `creditText` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `readyInMinutes` int(11) NOT NULL,
  `image` varchar(1000) NOT NULL,
  `instructions` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Tabel untuk resep makanan';

--
-- Dumping data for table `t_resep`
--

INSERT INTO `t_resep` (`id`, `servings`, `creditText`, `title`, `readyInMinutes`, `image`, `instructions`, `status`) VALUES
(1500001, 3, 'masak apa hari ini', 'nasi goreng jawa', 45, 'https://www.masakapahariini.com/wp-content/uploads/2019/01/nasi-goreng-jawa-620x440.jpg', '1. Panaskan minyak. Tumis bumbu halus sampai harum. Tambahkan telur di tengah wajan. Aduk sampai berbutir.\r\n2. Masukkan ayam.Aduk sampai ayam matang. Masukkan bakso sapi. Aduk sebentar. Tambahkan kol dan caisim. Aduk sampai setengah layu.\r\n3. Masukkan nasi. Aduk-aduk. Tambahkan Bango Kecap Manis, garam, kecap asin dan merica. Aduk sampai matang.\r\n4. Masukkan daun bawang. Aduk rata. Sajikan.', 1),
(1500002, 4, 'selerasa', 'kwetiau goreng', 50, 'https://selerasa.com/wp-content/uploads/2015/06/images_mie_mie-kwetiau_48-kwetiau-goreng-spesial.jpg', 'Panaskan minyak goreng di atas wajan dengan menggunakan api sedang. Masukan bawang putih dan bawang bombay ke dalam wajan kemudian tumis bawang putih dan bawang bombay hingga harum. Masukkan secara berturut turut udang, ayam, bakso ikan dan bakso sapi ke dlam masakan anda kemudian aduk sampai udang dan ayam matang dan berubah warna. Jangan lupa untuk memasukan bumbu cair ke dalam masakan anda kemudian aduk sebentar saja. Ambil kwetiau kemudian masukan dalama wajan, setelah itu berturut-turut masukan daun bawang dan coysim, lalu aduk sampai semua bahan merata dan matang. Pecahkan telur di atas wajan kemudian orak arik telurnya, aduk kembali semua bahan hingga merata sebentar saja. Angkat kwetiau sepsial anda dari wajan, kemudian tata di atas piring saji yang sudah anda persiapkan. Taburkan sedikit bawang goreng di atasnya untuk melengkapi sajian anda, bagi anda yang suka bisa juga menambahkan acar saat menyajikan kwetiau goreng spesial ini. Sajikan selagi hangat agar terasa lebih nikmat.\r\n\r\nSumber: https://selerasa.com/resep-dan-cara-memasak-kwetiau-goreng-spesial-makanan-chinese-yang-sederhana-namun-enak | Selerasa.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `t_resep_bahan`
--

DROP TABLE IF EXISTS `t_resep_bahan`;
CREATE TABLE `t_resep_bahan` (
  `id_resep_bahan` int(11) NOT NULL,
  `id_resep` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `amount` float NOT NULL,
  `unit` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Tabel untuk bahan-bahan suatu resep';

--
-- Dumping data for table `t_resep_bahan`
--

INSERT INTO `t_resep_bahan` (`id_resep_bahan`, `id_resep`, `name`, `amount`, `unit`) VALUES
(1, 1500001, 'Nasi Putih', 1600, 'Gram'),
(2, 1500001, 'Paha Ayam', 1, 'Buah'),
(3, 1500001, 'Kol', 5, 'Lembar'),
(4, 1500001, 'Kecap Manis', 2, 'Sdm'),
(5, 1500001, 'Kecap Asin', 0.5, 'Sdt'),
(6, 1500001, 'Daun Bawang', 2, 'Batang'),
(7, 1500001, 'Telur Ayam', 2, 'Butir'),
(8, 1500001, 'Bakso Sapi', 6, 'Buah'),
(9, 1500001, 'Caisim', 6, 'Batang'),
(10, 1500001, 'Garam', 1.25, 'Sdt'),
(11, 1500001, 'Merica Putih Bubuk', 0.125, 'Sdt'),
(12, 1500001, 'Minyak  Goreng', 2, 'Sdm'),
(13, 1500001, 'Bawang Putih', 3, 'Siung'),
(14, 1500001, 'Bawang Merah', 6, 'Butir'),
(15, 1500001, 'Ebi', 5, 'Butir'),
(16, 1500001, 'Kemiri', 4, 'Butir'),
(17, 1500001, 'Cabai Merah', 3, 'Buah'),
(18, 1500002, 'Kecap Manis', 5, 'Sdm'),
(19, 1500002, 'Kecap Asin', 3, 'Sdm'),
(20, 1500002, 'Daun Bawang', 2, 'Batang'),
(21, 1500002, 'Telur Ayam', 2, 'Butir'),
(22, 1500002, 'Bakso Sapi', 5, 'Buah'),
(23, 1500002, 'Garam', 1, 'Sdt'),
(24, 1500002, 'Minyak  Goreng', 4, 'Sdm'),
(25, 1500002, 'Bawang Putih', 5, 'Siung'),
(26, 1500002, 'Kwetiau Basah', 100, 'Gram'),
(27, 1500002, 'Udang', 100, 'Gram'),
(28, 1500002, 'Ayam Fillet', 100, 'Gram'),
(29, 1500002, 'Bakso Ikan', 5, 'Buah'),
(30, 1500002, 'Sawi Hijau', 1, 'Ikat'),
(31, 1500002, 'Saus Tiram', 4, 'Sdm'),
(32, 1500002, 'Minyak Wijen', 3, 'Sdm'),
(33, 1500002, 'Lada', 1, 'Sdt');

-- --------------------------------------------------------

--
-- Table structure for table `t_user`
--

DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `level` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `t_user`
--

INSERT INTO `t_user` (`username`, `password`, `fullname`, `level`) VALUES
('admin1', '$2b$10$eQirsbuChUd6bFnC/9f7weH1UczGs9W8RyjKvE8HgIVRV4cim0Uci', 'Admin One', 2),
('contributor1', '$2b$10$eQirsbuChUd6bFnC/9f7weH1UczGs9W8RyjKvE8HgIVRV4cim0Uci', 'Contributor One', 1),
('contributor2', '$2b$10$70Put6Qi5VbWYqVMwbKjWO4TyYAZDNxC/.ki9TXyE9c/D7xPkbBgC', 'Contributor Two', 1);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_rating`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `v_rating`;
CREATE TABLE `v_rating` (
`resepId` int(11)
,`rating` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_resep`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `v_resep`;
CREATE TABLE `v_resep` (
`id` int(11)
,`servings` int(11)
,`creditText` varchar(50)
,`title` varchar(100)
,`readyInMinutes` int(11)
,`image` varchar(1000)
,`instructions` text
,`status` tinyint(1)
,`rating` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Structure for view `v_rating`
--
DROP TABLE IF EXISTS `v_rating`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_rating`  AS  select `t_rating`.`resepId` AS `resepId`,avg(`t_rating`.`rating`) AS `rating` from `t_rating` group by `t_rating`.`resepId` ;

-- --------------------------------------------------------

--
-- Structure for view `v_resep`
--
DROP TABLE IF EXISTS `v_resep`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_resep`  AS  select `re`.`id` AS `id`,`re`.`servings` AS `servings`,`re`.`creditText` AS `creditText`,`re`.`title` AS `title`,`re`.`readyInMinutes` AS `readyInMinutes`,`re`.`image` AS `image`,`re`.`instructions` AS `instructions`,`re`.`status` AS `status`,`ra`.`rating` AS `rating` from (`t_resep` `re` left join `v_rating` `ra` on((`re`.`id` = `ra`.`resepId`))) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `t_resep`
--
ALTER TABLE `t_resep`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `t_resep_bahan`
--
ALTER TABLE `t_resep_bahan`
  ADD PRIMARY KEY (`id_resep_bahan`),
  ADD KEY `CNSTR_ID_RESEP` (`id_resep`);

--
-- Indexes for table `t_user`
--
ALTER TABLE `t_user`
  ADD PRIMARY KEY (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `t_resep_bahan`
--
ALTER TABLE `t_resep_bahan`
  MODIFY `id_resep_bahan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `t_resep_bahan`
--
ALTER TABLE `t_resep_bahan`
  ADD CONSTRAINT `CNSTR_ID_RESEP` FOREIGN KEY (`id_resep`) REFERENCES `t_resep` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
