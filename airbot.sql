-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-05-2018 a las 12:29:21
-- Versión del servidor: 10.1.30-MariaDB
-- Versión de PHP: 7.2.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `airbot`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recordatorios`
--

CREATE TABLE `recordatorios` (
  `idreserva` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `fechaRecordatorio` date NOT NULL,
  `numeroDias` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `recordatorios`
--

INSERT INTO `recordatorios` (`idreserva`, `idusuario`, `fechaRecordatorio`, `numeroDias`) VALUES
(1, 140760980, '2018-05-14', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `idvueloida` int(11) NOT NULL,
  `idvueloretorno` int(11) DEFAULT NULL,
  `idusuario` int(11) NOT NULL,
  `fechareserva` varchar(50) NOT NULL,
  `horareserva` varchar(50) NOT NULL,
  `npersonas` int(11) NOT NULL,
  `expirado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `idvueloida`, `idvueloretorno`, `idusuario`, `fechareserva`, `horareserva`, `npersonas`, `expirado`) VALUES
(1, 1, NULL, 140760980, '21/04/2018 18:25', '11:14', 1, 0),
(2, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '17:38', 2, 0),
(3, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:39', 3, 0),
(4, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:41', 3, 0),
(5, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:45', 3, 0),
(6, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:46', 3, 0),
(7, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:47', 1, 0),
(8, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:48', 1, 0),
(9, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:50', 1, 0),
(10, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:51', 1, 0),
(11, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '20:52', 1, 0),
(12, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '21:0', 1, 0),
(13, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '21:3', 1, 0),
(14, 1, NULL, 140760980, '2018-08-16 00:00:00.000', '12:44', 2, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`) VALUES
(140760980);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vuelos`
--

CREATE TABLE `vuelos` (
  `id` int(11) NOT NULL,
  `origen` varchar(100) NOT NULL,
  `destino` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `hora` varchar(50) NOT NULL,
  `precio` double NOT NULL,
  `plazas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `vuelos`
--

INSERT INTO `vuelos` (`id`, `origen`, `destino`, `fecha`, `hora`, `precio`, `plazas`) VALUES
(1, 'Madrid', 'Poznan', '2018-08-16', '15:30', 45, 187),
(2, 'Barcelona', 'Londres', '2018-10-09', '15:30', 60, 200),
(3, 'Nueva York', 'Barcelona', '2018-05-16', '15:30', 150, 200),
(4, 'Roma', 'Paris', '2018-02-15', '15:30', 40, 200),
(5, 'Sevilla', 'Roma', '2018-02-14', '15:30', 50, 200),
(6, 'Madrid', 'Bangkok', '2018-10-22', '15:30', 200, 200),
(7, 'Ámsterdam', 'Dubái', '2018-01-25', '15:30', 300, 200),
(8, 'Madrid', 'Tokio', '2018-10-11', '15:30', 400, 200),
(9, 'Poznan', 'Seúl', '2018-03-22', '15:30', 250, 200),
(10, 'Oslo', 'Nueva York', '2018-07-13', '15:30', 350, 200),
(11, 'Miami', 'Kuala Lumpur', '2018-01-01', '15:30', 500, 200),
(12, 'Barcelona', 'Hong Kong', '2018-01-22', '15:30', 450, 200),
(13, 'Barcelona', 'Estambul', '2018-03-30', '15:30', 300, 200),
(14, 'Milán', 'Ámsterdam', '2018-12-30', '15:30', 325, 200),
(15, 'Madrid', 'Milán', '2018-11-25', '15:30', 100, 200),
(16, 'Lisboa', 'Taipei', '2018-10-08', '15:30', 400, 200),
(17, 'Madrid', 'Shanghai', '2018-12-31', '15:30', 600, 200),
(18, 'Barcelona', 'Viena', '2018-02-14', '15:30', 200, 200),
(19, 'Oporto', 'Praga', '2018-12-14', '15:30', 150, 200),
(20, 'Madrid', 'Miami', '2018-07-11', '15:30', 450, 200),
(21, 'Amsterdam', 'Dublín', '2018-10-01', '15:30', 250, 200),
(22, 'Hong Kong', 'Munich', '2018-09-12', '15:30', 150, 200),
(23, 'Barcelona', 'Toronto', '2018-09-15', '15:30', 350, 200),
(24, 'Lisboa', 'Berlín', '2018-08-25', '15:30', 250, 200),
(25, 'Toronto', 'Johannesburgo', '2018-11-11', '15:30', 800, 200),
(26, 'Madrid', 'Los Angeles', '2018-08-30', '15:30', 350, 200);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `vuelos`
--
ALTER TABLE `vuelos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `vuelos`
--
ALTER TABLE `vuelos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
